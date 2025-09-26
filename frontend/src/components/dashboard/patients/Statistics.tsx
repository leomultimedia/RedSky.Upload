import React, { useRef, useEffect, useState, useMemo } from 'react';
// import { useQuery } from 'react-query';
import { Card, Select, Spin } from 'antd';
import { createChart } from '../../../lib/chart';
// import { apiGet } from '../../../lib/api';

const { Option } = Select;
export default function PatientStatistics() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  // Mock data for now since dashboard endpoints are disabled
  const data = useMemo(() => ({
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      newPatients: [5, 8, 12, 6, 9, 15, 7],
      returningPatients: [10, 15, 20, 12, 18, 25, 14]
    }
  }), [timeRange]);
  const isLoading = false;

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create new chart
    const chart = createChart(chartRef.current, 'bar', {
      labels: data.data.labels,
      datasets: [
        {
          label: 'New Patients',
          data: data.data.newPatients,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Returning Patients',
          data: data.data.returningPatients,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    });

    setChartInstance(chart);
  }, [timeRange]); // Only depend on timeRange, not chartInstance or data

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, []);

  return (
    <Card 
      title="Patient Statistics" 
      extra={
        <Select 
          value={timeRange} 
          onChange={setTimeRange}
          style={{ width: 120 }}
        >
          <Option value="week">Last Week</Option>
          <Option value="month">Last Month</Option>
          <Option value="year">Last Year</Option>
        </Select>
      }
    >
      {isLoading ? (
        <Spin tip="Loading statistics..." />
      ) : (
        <div style={{ position: 'relative', height: '300px' }}>
          <canvas ref={chartRef} />
        </div>
      )}
    </Card>
  );
}