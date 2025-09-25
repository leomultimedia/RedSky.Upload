import React, { useCallback, useEffect, useState } from 'react';
import { Table, Input, Typography } from 'antd';
import { apiGet } from '../lib/api';

type Patient = {
  id: number;
  emrNo: string;
  name?: string;
  age?: number;
  nationality?: string;
};

export default function PatientsPage() {
  const [data, setData] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const json = await apiGet(`/patients?q=${encodeURIComponent(q)}&page=${page}`);
      
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
      console.error('Failed to fetch patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <Typography.Title level={3}>Patients</Typography.Title>
      {error && (
        <Typography.Text type="danger" style={{ display: 'block', marginBottom: 12 }}>
          {error}
        </Typography.Text>
      )}
      <Input.Search placeholder="Search EMR or Name" value={q} onChange={e => setQ(e.target.value)} onSearch={setQ} style={{ width: 320, marginBottom: 12 }} />
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        pagination={{ current: page, pageSize: 50, total, onChange: setPage }}
        columns={[
          { title: 'EMR No', dataIndex: 'emrNo' },
          { title: 'Name', dataIndex: 'name' },
          { title: 'Age', dataIndex: 'age' },
          { title: 'Nationality', dataIndex: 'nationality' },
        ]}
      />
    </div>
  );
}
