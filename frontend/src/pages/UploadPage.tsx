import React, { useState } from 'react';
import { Upload, Button, Typography, Alert, Space } from 'antd';
import type { UploadProps } from 'antd/es/upload/interface';
import { UploadOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import { apiUpload } from '../lib/api';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

interface UploadResult {
  patientsInserted: number;
  visitsInserted: number;
  errors: string[];
  warnings: string[];
}

export default function UploadPage() {
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const props: UploadProps = {
    name: 'file',
    maxCount: 1,
    accept: '.xlsx,.xls',
    customRequest: async (options: UploadRequestOption<any>) => {
      try {
        const { file, onSuccess } = options;
        // Ensure we pass a File object to apiUpload
        const actualFile = file instanceof File ? file : (file as any).originFileObj;
        if (!(actualFile instanceof File)) {
          throw new Error('Uploaded file is not a valid File object');
        }
        const res = await apiUpload(actualFile);
        setError(null);
        setResult(res as UploadResult);
        onSuccess?.(res);
      } catch (err: unknown) {
        setResult(null);
        const errorMessage = err instanceof Error ? err.message :
          typeof err === 'object' && err && 'response' in err && 
          typeof err.response === 'object' && err.response && 
          'data' in err.response ? String(err.response.data) :
          'Upload failed';
        
        setError(errorMessage);
        options.onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    },
  };

  const renderSummary = () => {
    if (!result) return null;
    
    const summary = [];
    if (result.patientsInserted > 0) {
      summary.push(`${result.patientsInserted} patient${result.patientsInserted !== 1 ? 's' : ''} added`);
    }
    if (result.visitsInserted > 0) {
      summary.push(`${result.visitsInserted} visit${result.visitsInserted !== 1 ? 's' : ''} imported`);
    }
    if (result.errors.length > 0) {
      summary.push(`${result.errors.length} error${result.errors.length !== 1 ? 's' : ''} found`);
    }
    if (result.warnings.length > 0) {
      summary.push(`${result.warnings.length} warning${result.warnings.length !== 1 ? 's' : ''}`);
    }

    return (
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>{summary.join(', ')}</div>
        {(result.errors.length > 0 || result.warnings.length > 0) && (
          <div>
            {result.errors.map((err, i) => (
              <Alert key={`err-${i}`} type="error" message={err} style={{ marginTop: 8 }} />
            ))}
            {result.warnings.map((warn, i) => (
              <Alert key={`warn-${i}`} type="warning" message={warn} style={{ marginTop: 8 }} />
            ))}
          </div>
        )}
        <Button 
          type="link" 
          onClick={() => setShowDetails(!showDetails)}
          icon={showDetails ? <UpOutlined /> : <DownOutlined />}
        >
          {showDetails ? 'Hide details' : 'Show details'}
        </Button>
        {showDetails && (
          <pre style={{ 
            background: '#f5f5f5', 
            padding: 16, 
            borderRadius: 4,
            maxHeight: 400,
            overflow: 'auto'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </Space>
    );
  };

  return (
    <div>
      <Typography.Title level={3}>Excel Upload</Typography.Title>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      {result && (
        <Alert
          style={{ marginTop: 16 }}
          message="Import completed"
          description={renderSummary()}
          type={result.errors.length > 0 ? 'warning' : 'success'}
        />
      )}
      {error && <Alert style={{ marginTop: 16 }} message={error} type="error" />}
    </div>
  );
}