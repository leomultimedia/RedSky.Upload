import React from 'react';
import { Table, Space, Button, Card, Typography, Input, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import ExportButton from '../../ExportButton';

const { Title } = Typography;
const { Search } = Input;

export default function PatientVisits() {
  const [query, setQuery] = React.useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patient-visits', query],
    queryFn: () => api.get(`/visits?search=${query}`)
  });

  const columns = [
    {
      title: 'Visit ID',
      dataIndex: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Patient Name',
      dataIndex: 'patientName',
      render: (_: any, record: any) => `${record.patient?.firstName} ${record.patient?.lastName}`
    },
    {
      title: 'Visit Date',
      dataIndex: 'visitDate',
      render: (date: any) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      render: (diagnosis: any) => <Tag color="blue">{diagnosis}</Tag>
    },
    {
      title: 'Treatment',
      dataIndex: 'treatment'
    },
    {
      title: 'Actions',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small">View</Button>
          <Button size="small" type="primary">Edit</Button>
        </Space>
      )
    }
  ];

  return (
    <Card className="dashboard-widget">
      <div className="widget-header">
        <Title level={4}>Patient Visits</Title>
        <Space>
          <Search 
            placeholder="Search visits..." 
            onSearch={setQuery}
            style={{ width: 300 }}
          />
          <ExportButton 
            endpoint="visits" 
            fileName="patient-visits" 
            disabled={!data?.data.length}
          />
          <Button type="primary">
            Add Visit
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
