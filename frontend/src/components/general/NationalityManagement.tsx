import React, { useState } from 'react';
import { Table, Space, Button, Card, Typography, Input, Modal, Form, Select, message, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import ExportButton from '../ExportButton';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Nationality {
  id: number;
  name: string;
  code: string;
  alpha3Code?: string;
  numericCode?: string;
  region?: string;
  subRegion?: string;
  currency?: string;
  currencyCode?: string;
  requiresVisa: boolean;
  isActive: boolean;
  isArchived: boolean;
  sortOrder: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function NationalityManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingNationality, setEditingNationality] = useState<Nationality | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: nationalities, isLoading } = useQuery({
    queryKey: ['nationalities', searchQuery, regionFilter, showArchived],
    queryFn: () => apiGet(`/nationalities?search=${searchQuery}&region=${regionFilter}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const { data: regions } = useQuery({
    queryKey: ['nationality-regions'],
    queryFn: () => apiGet('/nationalities/regions'),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (nationality: Partial<Nationality>) => apiPost('/nationalities', nationality),
    onSuccess: () => {
      message.success('Nationality created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['nationalities'] });
    },
    onError: () => {
      message.error('Failed to create nationality');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...nationality }: Partial<Nationality> & { id: number }) => 
      apiPut(`/nationalities/${id}`, nationality),
    onSuccess: () => {
      message.success('Nationality updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['nationalities'] });
    },
    onError: () => {
      message.error('Failed to update nationality');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/nationalities/${id}`),
    onSuccess: () => {
      message.success('Nationality archived successfully');
      queryClient.invalidateQueries({ queryKey: ['nationalities'] });
    },
    onError: () => {
      message.error('Failed to archive nationality');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/nationalities/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Nationality restored successfully');
      queryClient.invalidateQueries({ queryKey: ['nationalities'] });
    },
    onError: () => {
      message.error('Failed to restore nationality');
    }
  });

  const handleAddNationality = () => {
    setEditingNationality(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditNationality = (nationality: Nationality) => {
    setEditingNationality(nationality);
    form.setFieldsValue(nationality);
    setModalVisible(true);
  };

  const handleDeleteNationality = (nationalityId: number) => {
    Modal.confirm({
      title: 'Archive Nationality',
      content: 'Are you sure you want to archive this nationality?',
      onOk: () => deleteMutation.mutate(nationalityId)
    });
  };

  const handleRestoreNationality = (nationalityId: number) => {
    restoreMutation.mutate(nationalityId);
  };

  const handleSubmit = (values: any) => {
    const nationalityData = {
      ...values,
      sortOrder: values.sortOrder || 0,
      isActive: values.isActive !== false,
      requiresVisa: values.requiresVisa || false
    };

    if (editingNationality) {
      updateMutation.mutate({ id: editingNationality.id, ...nationalityData });
    } else {
      createMutation.mutate(nationalityData);
    }
  };

  const columns = [
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      sorter: (a: Nationality, b: Nationality) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Country Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Nationality, b: Nationality) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 80,
      sorter: (a: Nationality, b: Nationality) => a.code.localeCompare(b.code),
    },
    {
      title: 'Alpha3',
      dataIndex: 'alpha3Code',
      key: 'alpha3Code',
      width: 80,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      width: 120,
      filters: regions?.data?.map((region: string) => ({ text: region, value: region })) || [],
      onFilter: (value: any, record: Nationality) => record.region === value,
    },
    {
      title: 'Sub Region',
      dataIndex: 'subRegion',
      key: 'subRegion',
      width: 120,
    },
    {
      title: 'Currency',
      key: 'currency',
      width: 120,
      render: (_: any, record: Nationality) => (
        record.currencyCode ? `${record.currencyCode}${record.currency ? ` (${record.currency})` : ''}` : 'N/A'
      ),
    },
    {
      title: 'Visa Required',
      dataIndex: 'requiresVisa',
      key: 'requiresVisa',
      width: 120,
      render: (requiresVisa: boolean) => (
        <span style={{ color: requiresVisa ? 'orange' : 'green' }}>
          {requiresVisa ? '⚠️ Yes' : '✅ No'}
        </span>
      ),
      filters: [
        { text: 'Visa Required', value: true },
        { text: 'No Visa Required', value: false },
      ],
      onFilter: (value: any, record: Nationality) => record.requiresVisa === value,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Nationality) => {
        if (record.isArchived) {
          return <span style={{ color: 'red' }}>Archived</span>;
        }
        return record.isActive ? 
          <span style={{ color: 'green' }}>Active</span> : 
          <span style={{ color: 'orange' }}>Inactive</span>;
      },
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value: any, record: Nationality) => {
        if (value === 'archived') return record.isArchived;
        if (value === 'active') return !record.isArchived && record.isActive;
        if (value === 'inactive') return !record.isArchived && !record.isActive;
        return true;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Nationality) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditNationality(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteNationality(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreNationality(record.id)}
            >
              Restore
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>Nationality Management</Title>
        <Space>
          <Search
            placeholder="Search nationalities..."
            onSearch={setSearchQuery}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by region"
            style={{ width: 150 }}
            allowClear
            onChange={setRegionFilter}
          >
            {regions?.data?.map((region: string) => (
              <Option key={region} value={region}>{region}</Option>
            ))}
          </Select>
          <Switch
            checkedChildren="Show Archived"
            unCheckedChildren="Hide Archived"
            checked={showArchived}
            onChange={setShowArchived}
          />
          <ExportButton 
            endpoint="nationalities" 
            fileName="nationalities" 
            disabled={!nationalities?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddNationality}
          >
            Add Nationality
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={nationalities?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingNationality ? 'Edit Nationality' : 'Add New Nationality'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Country Name"
              rules={[{ required: true, message: 'Please enter country name' }]}
            >
              <Input placeholder="e.g., United Arab Emirates" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Country Code (Alpha-2)"
              rules={[{ required: true, message: 'Please enter country code' }]}
            >
              <Input placeholder="e.g., AE" maxLength={2} />
            </Form.Item>

            <Form.Item
              name="alpha3Code"
              label="Alpha-3 Code"
            >
              <Input placeholder="e.g., ARE" maxLength={3} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="numericCode"
              label="Numeric Code"
            >
              <Input placeholder="e.g., 784" maxLength={3} />
            </Form.Item>

            <Form.Item
              name="region"
              label="Region"
            >
              <Select placeholder="Select region" allowClear>
                <Option value="Middle East">Middle East</Option>
                <Option value="Asia">Asia</Option>
                <Option value="Europe">Europe</Option>
                <Option value="North America">North America</Option>
                <Option value="South America">South America</Option>
                <Option value="Africa">Africa</Option>
                <Option value="Oceania">Oceania</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="subRegion"
              label="Sub Region"
            >
              <Input placeholder="e.g., Western Asia" />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="currency"
              label="Currency Name"
            >
              <Input placeholder="e.g., UAE Dirham" />
            </Form.Item>

            <Form.Item
              name="currencyCode"
              label="Currency Code"
            >
              <Input placeholder="e.g., AED" maxLength={3} />
            </Form.Item>

            <Form.Item
              name="sortOrder"
              label="Sort Order"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Additional notes about visa requirements, special considerations, etc." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="requiresVisa"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren="Visa Required" unCheckedChildren="No Visa Required" />
            </Form.Item>

            <Form.Item
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </div>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingNationality ? 'Update' : 'Add'} Nationality
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
