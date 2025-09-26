import React, { useState } from 'react';
import { Table, Space, Button, Card, Typography, Input, Modal, Form, Select, message, InputNumber, Switch, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UndoOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPut, apiDelete } from '../../lib/api';
import ExportButton from '../ExportButton';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface WellnessProgram {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  price: number;
  durationDays: number;
  targetAgeGroup?: string;
  targetGender?: string;
  prerequisites?: string;
  benefits?: string;
  inclusions?: string;
  maxParticipants: number;
  startDate?: string;
  endDate?: string;
  instructorName?: string;
  location?: string;
  schedule: string;
  isActive: boolean;
  isArchived: boolean;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export default function WellnessProgramManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WellnessProgram | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: programs, isLoading } = useQuery({
    queryKey: ['wellnessprograms', searchQuery, categoryFilter, showArchived],
    queryFn: () => apiGet(`/wellnessprograms?search=${searchQuery}&category=${categoryFilter}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const { data: categories } = useQuery({
    queryKey: ['wellness-categories'],
    queryFn: () => apiGet('/wellnessprograms/categories'),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (program: Partial<WellnessProgram>) => apiPost('/wellnessprograms', program),
    onSuccess: () => {
      message.success('Wellness program created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['wellnessprograms'] });
    },
    onError: () => {
      message.error('Failed to create wellness program');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...program }: Partial<WellnessProgram> & { id: number }) => 
      apiPut(`/wellnessprograms/${id}`, program),
    onSuccess: () => {
      message.success('Wellness program updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['wellnessprograms'] });
    },
    onError: () => {
      message.error('Failed to update wellness program');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/wellnessprograms/${id}`),
    onSuccess: () => {
      message.success('Wellness program archived successfully');
      queryClient.invalidateQueries({ queryKey: ['wellnessprograms'] });
    },
    onError: () => {
      message.error('Failed to archive wellness program');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/wellnessprograms/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Wellness program restored successfully');
      queryClient.invalidateQueries({ queryKey: ['wellnessprograms'] });
    },
    onError: () => {
      message.error('Failed to restore wellness program');
    }
  });

  const handleAddProgram = () => {
    setEditingProgram(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditProgram = (program: WellnessProgram) => {
    setEditingProgram(program);
    form.setFieldsValue({
      ...program,
      startDate: program.startDate ? new Date(program.startDate) : null,
      endDate: program.endDate ? new Date(program.endDate) : null,
    });
    setModalVisible(true);
  };

  const handleDeleteProgram = (programId: number) => {
    Modal.confirm({
      title: 'Archive Wellness Program',
      content: 'Are you sure you want to archive this wellness program?',
      onOk: () => deleteMutation.mutate(programId)
    });
  };

  const handleRestoreProgram = (programId: number) => {
    restoreMutation.mutate(programId);
  };

  const handleSubmit = (values: any) => {
    const programData = {
      ...values,
      price: parseFloat(values.price),
      durationDays: parseInt(values.durationDays),
      maxParticipants: parseInt(values.maxParticipants),
      isActive: values.isActive !== false,
      startDate: values.startDate?.toISOString(),
      endDate: values.endDate?.toISOString(),
    };

    if (editingProgram) {
      updateMutation.mutate({ id: editingProgram.id, ...programData });
    } else {
      createMutation.mutate(programData);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a: WellnessProgram, b: WellnessProgram) => a.code.localeCompare(b.code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: WellnessProgram, b: WellnessProgram) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories?.data?.map((cat: string) => ({ text: cat, value: cat })) || [],
      onFilter: (value: any, record: WellnessProgram) => record.category === value,
    },
    {
      title: 'Price (AED)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => `${price.toFixed(2)}`,
      sorter: (a: WellnessProgram, b: WellnessProgram) => a.price - b.price,
    },
    {
      title: 'Duration (Days)',
      dataIndex: 'durationDays',
      key: 'durationDays',
      width: 120,
      sorter: (a: WellnessProgram, b: WellnessProgram) => a.durationDays - b.durationDays,
    },
    {
      title: 'Max Participants',
      dataIndex: 'maxParticipants',
      key: 'maxParticipants',
      width: 130,
      sorter: (a: WellnessProgram, b: WellnessProgram) => a.maxParticipants - b.maxParticipants,
    },
    {
      title: 'Target Age',
      dataIndex: 'targetAgeGroup',
      key: 'targetAgeGroup',
      width: 100,
    },
    {
      title: 'Instructor',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 150,
    },
    {
      title: 'Schedule',
      dataIndex: 'schedule',
      key: 'schedule',
      width: 100,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: WellnessProgram) => {
        if (record.isArchived) {
          return <span style={{ color: 'red' }}>Archived</span>;
        }
        if (record.status === 'Active') {
          return <span style={{ color: 'green' }}>Active</span>;
        }
        if (record.status === 'Draft') {
          return <span style={{ color: 'orange' }}>Draft</span>;
        }
        return <span style={{ color: 'gray' }}>{record.status}</span>;
      },
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Draft', value: 'Draft' },
        { text: 'Completed', value: 'Completed' },
        { text: 'Cancelled', value: 'Cancelled' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value: any, record: WellnessProgram) => {
        if (value === 'archived') return record.isArchived;
        return record.status === value;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: WellnessProgram) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditProgram(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteProgram(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreProgram(record.id)}
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
        <Title level={4}>Wellness Program Management</Title>
        <Space>
          <Search
            placeholder="Search programs..."
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
            endpoint="wellnessprograms" 
            fileName="wellness-programs" 
            disabled={!programs?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddProgram}
          >
            Add Program
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={programs?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1400 }}
      />

      <Modal
        title={editingProgram ? 'Edit Wellness Program' : 'Add New Wellness Program'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Program Name"
              rules={[{ required: true, message: 'Please enter program name' }]}
            >
              <Input placeholder="e.g., Heart Health Program" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Program Code"
              rules={[{ required: true, message: 'Please enter program code' }]}
            >
              <Input placeholder="e.g., HEART001" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <Select placeholder="Select category">
                <Option value="Cardiovascular">Cardiovascular</Option>
                <Option value="Metabolic">Metabolic</Option>
                <Option value="Nutrition">Nutrition</Option>
                <Option value="Mental Health">Mental Health</Option>
                <Option value="Fitness">Fitness</Option>
                <Option value="Preventive">Preventive</Option>
              </Select>
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
                placeholder="1200.00"
              />
            </Form.Item>

            <Form.Item
              name="durationDays"
              label="Duration (Days)"
              rules={[{ required: true, message: 'Please enter duration' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="30"
              />
            </Form.Item>

            <Form.Item
              name="maxParticipants"
              label="Max Participants"
              rules={[{ required: true, message: 'Please enter max participants' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="20"
              />
            </Form.Item>

            <Form.Item
              name="targetAgeGroup"
              label="Target Age Group"
            >
              <Input placeholder="e.g., 40+, 18-65" />
            </Form.Item>

            <Form.Item
              name="targetGender"
              label="Target Gender"
            >
              <Select placeholder="Select target gender" allowClear>
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="All">All</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="instructorName"
              label="Instructor Name"
            >
              <Input placeholder="Dr. Ahmed Al-Mansoori" />
            </Form.Item>

            <Form.Item
              name="location"
              label="Location"
            >
              <Input placeholder="Wellness Center" />
            </Form.Item>

            <Form.Item
              name="schedule"
              label="Schedule"
              rules={[{ required: true, message: 'Please enter schedule' }]}
            >
              <Select placeholder="Select schedule">
                <Option value="Daily">Daily</Option>
                <Option value="Weekly">Weekly</Option>
                <Option value="Bi-weekly">Bi-weekly</Option>
                <Option value="Monthly">Monthly</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: 'Please select status' }]}
            >
              <Select placeholder="Select status">
                <Option value="Draft">Draft</Option>
                <Option value="Active">Active</Option>
                <Option value="Completed">Completed</Option>
                <Option value="Cancelled">Cancelled</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="startDate"
              label="Start Date"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="endDate"
              label="End Date"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Program description..." />
          </Form.Item>

          <Form.Item
            name="benefits"
            label="Benefits"
          >
            <TextArea rows={2} placeholder="Program benefits..." />
          </Form.Item>

          <Form.Item
            name="prerequisites"
            label="Prerequisites"
          >
            <TextArea rows={2} placeholder="Prerequisites for participation..." />
          </Form.Item>

          <Form.Item
            name="inclusions"
            label="Inclusions"
          >
            <TextArea rows={2} placeholder="What's included in the program..." />
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
                {editingProgram ? 'Update' : 'Add'} Program
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
