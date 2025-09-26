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

interface Treatment {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  price: number;
  durationMinutes: number;
  department?: string;
  prerequisites?: string;
  postTreatmentInstructions?: string;
  requiresSpecialist: boolean;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
}

export default function TreatmentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: treatments, isLoading } = useQuery({
    queryKey: ['treatments', searchQuery, categoryFilter, showArchived],
    queryFn: () => apiGet(`/treatments?search=${searchQuery}&category=${categoryFilter}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const { data: categories } = useQuery({
    queryKey: ['treatment-categories'],
    queryFn: () => apiGet('/treatments/categories'),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (treatment: Partial<Treatment>) => apiPost('/treatments', treatment),
    onSuccess: () => {
      message.success('Treatment created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
    onError: () => {
      message.error('Failed to create treatment');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...treatment }: Partial<Treatment> & { id: number }) => 
      apiPut(`/treatments/${id}`, treatment),
    onSuccess: () => {
      message.success('Treatment updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
    onError: () => {
      message.error('Failed to update treatment');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/treatments/${id}`),
    onSuccess: () => {
      message.success('Treatment archived successfully');
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
    onError: () => {
      message.error('Failed to archive treatment');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/treatments/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Treatment restored successfully');
      queryClient.invalidateQueries({ queryKey: ['treatments'] });
    },
    onError: () => {
      message.error('Failed to restore treatment');
    }
  });

  const handleAddTreatment = () => {
    setEditingTreatment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditTreatment = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    form.setFieldsValue({
      ...treatment,
      durationMinutes: treatment.durationMinutes
    });
    setModalVisible(true);
  };

  const handleDeleteTreatment = (treatmentId: number) => {
    Modal.confirm({
      title: 'Archive Treatment',
      content: 'Are you sure you want to archive this treatment? It will be hidden from active lists.',
      onOk: () => deleteMutation.mutate(treatmentId)
    });
  };

  const handleRestoreTreatment = (treatmentId: number) => {
    restoreMutation.mutate(treatmentId);
  };

  const handleSubmit = (values: any) => {
    const treatmentData = {
      ...values,
      price: parseFloat(values.price),
      durationMinutes: parseInt(values.durationMinutes),
      requiresSpecialist: values.requiresSpecialist || false,
      isActive: values.isActive !== false
    };

    if (editingTreatment) {
      updateMutation.mutate({ id: editingTreatment.id, ...treatmentData });
    } else {
      createMutation.mutate(treatmentData);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a: Treatment, b: Treatment) => a.code.localeCompare(b.code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Treatment, b: Treatment) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories?.data?.map((cat: string) => ({ text: cat, value: cat })) || [],
      onFilter: (value: any, record: Treatment) => record.category === value,
    },
    {
      title: 'Price (AED)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => `${price.toFixed(2)}`,
      sorter: (a: Treatment, b: Treatment) => a.price - b.price,
    },
    {
      title: 'Duration (min)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: 120,
      sorter: (a: Treatment, b: Treatment) => a.durationMinutes - b.durationMinutes,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
    },
    {
      title: 'Specialist Required',
      dataIndex: 'requiresSpecialist',
      key: 'requiresSpecialist',
      width: 150,
      render: (requiresSpecialist: boolean) => requiresSpecialist ? 'Yes' : 'No',
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Treatment) => {
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
      onFilter: (value: any, record: Treatment) => {
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
      render: (_: any, record: Treatment) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditTreatment(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteTreatment(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreTreatment(record.id)}
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
        <Title level={4}>Treatment Management</Title>
        <Space>
          <Search
            placeholder="Search treatments..."
            onSearch={setSearchQuery}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by category"
            style={{ width: 150 }}
            allowClear
            onChange={setCategoryFilter}
          >
            {categories?.data?.map((category: string) => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
          <Switch
            checkedChildren="Show Archived"
            unCheckedChildren="Hide Archived"
            checked={showArchived}
            onChange={setShowArchived}
          />
          <ExportButton 
            endpoint="treatments" 
            fileName="treatments" 
            disabled={!treatments?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddTreatment}
          >
            Add Treatment
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={treatments?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingTreatment ? 'Edit Treatment' : 'Add New Treatment'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Treatment Name"
              rules={[{ required: true, message: 'Please enter treatment name' }]}
            >
              <Input placeholder="e.g., Physical Therapy Session" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Treatment Code"
              rules={[{ required: true, message: 'Please enter treatment code' }]}
            >
              <Input placeholder="e.g., PT001" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <Input placeholder="e.g., Physical Therapy" />
            </Form.Item>

            <Form.Item
              name="department"
              label="Department"
            >
              <Input placeholder="e.g., Rehabilitation" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price (AED)"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="0.00"
              />
            </Form.Item>

            <Form.Item
              name="durationMinutes"
              label="Duration (minutes)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="60"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Treatment description..." />
          </Form.Item>

          <Form.Item
            name="prerequisites"
            label="Prerequisites"
          >
            <TextArea rows={2} placeholder="Any prerequisites for this treatment..." />
          </Form.Item>

          <Form.Item
            name="postTreatmentInstructions"
            label="Post-Treatment Instructions"
          >
            <TextArea rows={2} placeholder="Instructions after treatment..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="requiresSpecialist"
              valuePropName="checked"
            >
              <Switch checkedChildren="Requires Specialist" unCheckedChildren="General Treatment" />
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
                {editingTreatment ? 'Update' : 'Add'} Treatment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
