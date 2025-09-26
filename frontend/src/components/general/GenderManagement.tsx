import React, { useState } from 'react';
import { Table, Space, Button, Card, Typography, Input, Modal, Form, message, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import ExportButton from '../ExportButton';

const { Title } = Typography;
const { TextArea } = Input;

interface Gender {
  id: number;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export default function GenderManagement() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGender, setEditingGender] = useState<Gender | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: genders, isLoading } = useQuery({
    queryKey: ['genders', showArchived],
    queryFn: () => apiGet(`/genders?includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (gender: Partial<Gender>) => apiPost('/genders', gender),
    onSuccess: () => {
      message.success('Gender created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['genders'] });
    },
    onError: () => {
      message.error('Failed to create gender');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...gender }: Partial<Gender> & { id: number }) => 
      apiPut(`/genders/${id}`, gender),
    onSuccess: () => {
      message.success('Gender updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['genders'] });
    },
    onError: () => {
      message.error('Failed to update gender');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/genders/${id}`),
    onSuccess: () => {
      message.success('Gender archived successfully');
      queryClient.invalidateQueries({ queryKey: ['genders'] });
    },
    onError: () => {
      message.error('Failed to archive gender');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/genders/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Gender restored successfully');
      queryClient.invalidateQueries({ queryKey: ['genders'] });
    },
    onError: () => {
      message.error('Failed to restore gender');
    }
  });

  const handleAddGender = () => {
    setEditingGender(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditGender = (gender: Gender) => {
    setEditingGender(gender);
    form.setFieldsValue(gender);
    setModalVisible(true);
  };

  const handleDeleteGender = (genderId: number) => {
    Modal.confirm({
      title: 'Archive Gender',
      content: 'Are you sure you want to archive this gender option?',
      onOk: () => deleteMutation.mutate(genderId)
    });
  };

  const handleRestoreGender = (genderId: number) => {
    restoreMutation.mutate(genderId);
  };

  const handleSubmit = (values: any) => {
    const genderData = {
      ...values,
      sortOrder: values.sortOrder || 0,
      isActive: values.isActive !== false
    };

    if (editingGender) {
      updateMutation.mutate({ id: editingGender.id, ...genderData });
    } else {
      createMutation.mutate(genderData);
    }
  };

  const columns = [
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      sorter: (a: Gender, b: Gender) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Gender, b: Gender) => a.name.localeCompare(b.name),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a: Gender, b: Gender) => a.code.localeCompare(b.code),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Gender) => {
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
      onFilter: (value: any, record: Gender) => {
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
      render: (_: any, record: Gender) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditGender(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteGender(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreGender(record.id)}
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
        <Title level={4}>Gender Management</Title>
        <Space>
          <Switch
            checkedChildren="Show Archived"
            unCheckedChildren="Hide Archived"
            checked={showArchived}
            onChange={setShowArchived}
          />
          <ExportButton 
            endpoint="genders" 
            fileName="genders" 
            disabled={!genders?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddGender}
          >
            Add Gender
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={genders?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={editingGender ? 'Edit Gender' : 'Add New Gender'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Gender Name"
              rules={[{ required: true, message: 'Please enter gender name' }]}
            >
              <Input placeholder="e.g., Male, Female, Other" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Code"
              rules={[{ required: true, message: 'Please enter code' }]}
            >
              <Input placeholder="e.g., M, F, O" />
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
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Optional description..." />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

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
                {editingGender ? 'Update' : 'Add'} Gender
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
