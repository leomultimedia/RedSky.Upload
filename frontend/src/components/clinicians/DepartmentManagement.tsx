import React, { useState } from 'react';
import { Table, Space, Button, Card, Typography, Input, Modal, Form, message, InputNumber, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import ExportButton from '../ExportButton';

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: number;
  headOfDepartment?: string;
  location?: string;
  phoneNumber?: string;
  email?: string;
  budget?: number;
  staffCount?: number;
  specializations?: string;
  equipment?: string;
  isActive: boolean;
  isArchived: boolean;
  clinicians: any[];
  createdAt: string;
  updatedAt?: string;
}

export default function DepartmentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: departments, isLoading } = useQuery({
    queryKey: ['departments', searchQuery, showArchived],
    queryFn: () => apiGet(`/departments?search=${searchQuery}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (department: Partial<Department>) => apiPost('/departments', department),
    onSuccess: () => {
      message.success('Department created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => {
      message.error('Failed to create department');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...department }: Partial<Department> & { id: number }) => 
      apiPut(`/departments/${id}`, department),
    onSuccess: () => {
      message.success('Department updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => {
      message.error('Failed to update department');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/departments/${id}`),
    onSuccess: () => {
      message.success('Department archived successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data || 'Failed to archive department');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/departments/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Department restored successfully');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
    onError: () => {
      message.error('Failed to restore department');
    }
  });

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    form.setFieldsValue(department);
    setModalVisible(true);
  };

  const handleDeleteDepartment = (departmentId: number) => {
    Modal.confirm({
      title: 'Archive Department',
      content: 'Are you sure you want to archive this department? All active clinicians must be reassigned first.',
      onOk: () => deleteMutation.mutate(departmentId)
    });
  };

  const handleRestoreDepartment = (departmentId: number) => {
    restoreMutation.mutate(departmentId);
  };

  const handleSubmit = (values: any) => {
    const departmentData = {
      ...values,
      budget: values.budget ? parseFloat(values.budget) : undefined,
      staffCount: values.staffCount ? parseInt(values.staffCount) : undefined,
      isActive: values.isActive !== false
    };

    if (editingDepartment) {
      updateMutation.mutate({ id: editingDepartment.id, ...departmentData });
    } else {
      createMutation.mutate(departmentData);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a: Department, b: Department) => a.code.localeCompare(b.code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Department, b: Department) => a.name.localeCompare(b.name),
    },
    {
      title: 'Head of Department',
      dataIndex: 'headOfDepartment',
      key: 'headOfDepartment',
      width: 200,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: 'Staff Count',
      key: 'actualStaffCount',
      width: 120,
      render: (_: any, record: Department) => record.clinicians?.length || 0,
      sorter: (a: Department, b: Department) => (a.clinicians?.length || 0) - (b.clinicians?.length || 0),
    },
    {
      title: 'Budget (AED)',
      dataIndex: 'budget',
      key: 'budget',
      width: 130,
      render: (budget: number) => budget ? `${budget.toLocaleString()}` : '-',
      sorter: (a: Department, b: Department) => (a.budget || 0) - (b.budget || 0),
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 130,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Department) => {
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
      onFilter: (value: any, record: Department) => {
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
      render: (_: any, record: Department) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditDepartment(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteDepartment(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreDepartment(record.id)}
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
        <Title level={4}>Department Management</Title>
        <Space>
          <Search
            placeholder="Search departments..."
            onSearch={setSearchQuery}
            style={{ width: 250 }}
          />
          <Switch
            checkedChildren="Show Archived"
            unCheckedChildren="Hide Archived"
            checked={showArchived}
            onChange={setShowArchived}
          />
          <ExportButton 
            endpoint="departments" 
            fileName="departments" 
            disabled={!departments?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddDepartment}
          >
            Add Department
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={departments?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
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
              label="Department Name"
              rules={[{ required: true, message: 'Please enter department name' }]}
            >
              <Input placeholder="e.g., Cardiology" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Department Code"
              rules={[{ required: true, message: 'Please enter department code' }]}
            >
              <Input placeholder="e.g., CARD" />
            </Form.Item>

            <Form.Item
              name="headOfDepartment"
              label="Head of Department"
            >
              <Input placeholder="Dr. John Smith" />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
            >
              <Input placeholder="Building A, Floor 2" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
            >
              <Input placeholder="+971-4-1234567" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter valid email' }]}
            >
              <Input placeholder="cardiology@hospital.com" />
            </Form.Item>

            <Form.Item
              name="budget"
              label="Annual Budget (AED)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={1000}
                placeholder="1000000"
              />
            </Form.Item>

            <Form.Item
              name="staffCount"
              label="Planned Staff Count"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                placeholder="20"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Department description..." />
          </Form.Item>

          <Form.Item
            name="specializations"
            label="Specializations"
          >
            <TextArea rows={2} placeholder="List of specializations offered..." />
          </Form.Item>

          <Form.Item
            name="equipment"
            label="Equipment & Facilities"
          >
            <TextArea rows={2} placeholder="List of equipment and facilities..." />
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
                {editingDepartment ? 'Update' : 'Add'} Department
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
