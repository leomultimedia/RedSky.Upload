// src/components/dashboard/Home.tsx
import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import PatientStatistics from './patients/Statistics';
import VisitTrends from './visits/Trends';
import api from '../../lib/api';
import { useQuery } from '@tanstack/react-query';

export default function DashboardHome() {
  const { data } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get('/dashboard/summary'),
    initialData: {
      data: {
        patients: 150,
        visits: 450,
        clinicians: 25
      }
    }
  });

  return (
    <div className="dashboard-home">
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Patients" 
              value={data?.data.patients} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total Visits" 
              value={data?.data.visits} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Active Clinicians" 
              value={data?.data.clinicians} 
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <PatientStatistics />
        </Col>
        <Col span={12}>
          <VisitTrends />
        </Col>
      </Row>
    </div>
  );
}