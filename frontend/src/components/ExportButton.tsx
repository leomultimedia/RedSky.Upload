import React from 'react';
import { Button, Dropdown, Menu, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { apiGet } from '../lib/api';

interface ExportButtonProps {
  endpoint: string;
  fileName: string;
  disabled?: boolean;
}

export default function ExportButton({ 
  endpoint, 
  fileName,
  disabled = false
}: ExportButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      setLoading(true);
      // For now, just show a message since export endpoints are disabled
      message.info('Export functionality coming soon!');
    } catch (error) {
      message.error('Export failed');
    } finally {
      setLoading(false);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={() => handleExport('excel')}>Excel</Menu.Item>
      <Menu.Item onClick={() => handleExport('pdf')}>PDF</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} placement="bottomLeft" disabled={disabled}>
      <Button 
        type="primary" 
        icon={<DownloadOutlined />} 
        loading={loading}
        disabled={disabled}
      >
        Export
      </Button>
    </Dropdown>
  );
}