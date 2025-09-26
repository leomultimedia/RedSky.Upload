import React, { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Select, Spin } from 'antd';
import { createChart } from '../../../lib/chart';
import api from '../../../lib/api';

const { Option } = Select;

export default function VisitTrends() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = useState('week');
  const [chartInstance, setChartInstance] = useState<any>(null);
  
  const { data, isLoading } = useQuery({
    queryKey: ['visit-trends', timeRange],
    queryFn: () => api.get(`/dashboard/visit-trends?range=${timeRange}`),
    initialData: {
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{ data: [10, 20, 15, 25, 18] }]
      }
    }
  });

  useEffect(() => {
    if (!chartRef.current) return;
    
    // Destroy existing chart instance
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Create new chart
    const chart = createChart(chartRef.current, 'line', {
      labels: data.data.labels,
      datasets: [
        {
          label: 'Daily Visits',
          data: data.data.datasets[0].data,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          fill: true
        }
      ]
    });

    setChartInstance(chart);
  }, [timeRange]); // Only depend on timeRange

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
      title="Visit Trends" 
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
        <Spin tip="Loading trends..." />
      ) : (
        <div style={{ position: 'relative', height: '300px' }}>
          <canvas ref={chartRef} />
        </div>
      )}
    </Card>
  );
}
