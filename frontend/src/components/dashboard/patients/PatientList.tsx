import React from 'react';
import { Table, Space, Button, Card, Typography, Input } from 'antd';
import { useQuery } from '@tanstack/react-query';
import api from '../../../lib/api';
import ExportButton from '../../ExportButton';

const { Title } = Typography;
const { Search } = Input;

export default function PatientList() {
  const [query, setQuery] = React.useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['patients', query],
    queryFn: () => api.get(`/patients?search=${query}`)
  });

  const columns = [
    {
      title: 'Patient ID',
      dataIndex: 'id',
      sorter: (a: any, b: any) => a.id - b.id,
    },
    {
      title: 'Full Name',
      dataIndex: 'fullName',
      render: (_: any, record: any) => `${record.firstName} ${record.lastName}` 
    },
    {
      title: 'Gender',
      dataIndex: 'gender'
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
        <Title level={4}>Patients List</Title>
        <Space>
          <Search 
            placeholder="Search patients..." 
            onSearch={setQuery}
            style={{ width: 300 }}
          />
          <ExportButton 
            endpoint="patients" 
            fileName="patients" 
            disabled={!data?.data.length}
          />
          <Button type="primary">
            Add Patient
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
