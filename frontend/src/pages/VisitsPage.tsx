import React, { useCallback, useEffect, useState } from 'react';
import { Table, Input, Space, Typography } from 'antd';
import { apiGet } from '../lib/api';

type Visit = {
  id: number;
  visitNo: string;
  visitDate?: string;
  department?: string;
  doctor?: string;
  encType?: string;
  vatAmount?: number;
  patient: { id: number; emrNo: string; name?: string };
};

export default function VisitsPage() {
  const [data, setData] = useState<Visit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emr, setEmr] = useState('');
  const [visitNo, setVisitNo] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const qs = new URLSearchParams({ emr, visitNo, page: String(page) }).toString();
      const json = await apiGet(`/visits?${qs}`);
      
      // Validate response shape
      if (json && 
          typeof json === 'object' && 
          Array.isArray(json.items) && 
          typeof json.total === 'number') {
        setData(json.items);
        setTotal(json.total);
      } else {
        console.error('Invalid API response format:', json);
        setError('Received invalid data from server');
        setData([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Failed to fetch visits:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visits');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [emr, visitNo, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <Typography.Title level={3}>Visits</Typography.Title>
      {error && (
        <Typography.Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
          {error}
        </Typography.Text>
      )}
      <Space style={{ marginBottom: 12 }}>
        <Input placeholder="Filter by EMR" value={emr} onChange={e => setEmr(e.target.value)} />
        <Input placeholder="Filter by Visit No" value={visitNo} onChange={e => setVisitNo(e.target.value)} />
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{ current: page, pageSize: 50, total, onChange: setPage }}
        columns={[
          { title: 'EMR No', dataIndex: ['patient','emrNo'] },
          { title: 'Patient', dataIndex: ['patient','name'] },
          { title: 'Visit No', dataIndex: 'visitNo' },
          { title: 'Visit Date', dataIndex: 'visitDate' },
          { title: 'Department', dataIndex: 'department' },
          { title: 'Doctor', dataIndex: 'doctor' },
          { title: 'Enc Type', dataIndex: 'encType' },
          { title: 'VAT', dataIndex: 'vatAmount' },
        ]}
      />
    </div>
  );
}


