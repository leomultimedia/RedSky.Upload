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

interface Therapist {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  address?: string;
  departmentId: number;
  department?: {
    id: number;
    name: string;
    code: string;
  };
  therapyType: string;
  specializations?: string;
  certifications?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  joinDate: string;
  terminationDate?: string;
  hourlyRate?: number;
  employmentStatus: string;
  workingHours?: string;
  availabilitySchedule?: string;
  maxPatientsPerDay: number;
  sessionDurationMinutes: number;
  isActive: boolean;
  isArchived: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function TherapistManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [therapyTypeFilter, setTherapyTypeFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: therapists, isLoading } = useQuery({
    queryKey: ['therapists', searchQuery, departmentFilter, therapyTypeFilter, showArchived],
    queryFn: () => apiGet(`/therapists?search=${searchQuery}&departmentId=${departmentFilter}&therapyType=${therapyTypeFilter}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => apiGet('/departments'),
    initialData: { data: [] }
  });

  const { data: therapyTypes } = useQuery({
    queryKey: ['therapy-types'],
    queryFn: () => apiGet('/therapists/therapy-types'),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (therapist: Partial<Therapist>) => apiPost('/therapists', therapist),
    onSuccess: () => {
      message.success('Therapist created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create therapist');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...therapist }: Partial<Therapist> & { id: number }) => 
      apiPut(`/therapists/${id}`, therapist),
    onSuccess: () => {
      message.success('Therapist updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update therapist');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/therapists/${id}`),
    onSuccess: () => {
      message.success('Therapist archived successfully');
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
    onError: () => {
      message.error('Failed to archive therapist');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/therapists/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Therapist restored successfully');
      queryClient.invalidateQueries({ queryKey: ['therapists'] });
    },
    onError: () => {
      message.error('Failed to restore therapist');
    }
  });

  const handleAddTherapist = () => {
    setEditingTherapist(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditTherapist = (therapist: Therapist) => {
    setEditingTherapist(therapist);
    form.setFieldsValue({
      ...therapist,
      dateOfBirth: therapist.dateOfBirth ? new Date(therapist.dateOfBirth) : null,
      joinDate: therapist.joinDate ? new Date(therapist.joinDate) : null,
      terminationDate: therapist.terminationDate ? new Date(therapist.terminationDate) : null,
      licenseExpiryDate: therapist.licenseExpiryDate ? new Date(therapist.licenseExpiryDate) : null,
    });
    setModalVisible(true);
  };

  const handleDeleteTherapist = (therapistId: number) => {
    Modal.confirm({
      title: 'Archive Therapist',
      content: 'Are you sure you want to archive this therapist? This will mark them as terminated.',
      onOk: () => deleteMutation.mutate(therapistId)
    });
  };

  const handleRestoreTherapist = (therapistId: number) => {
    restoreMutation.mutate(therapistId);
  };

  const handleSubmit = (values: any) => {
    const therapistData = {
      ...values,
      departmentId: parseInt(values.departmentId),
      hourlyRate: values.hourlyRate ? parseFloat(values.hourlyRate) : undefined,
      maxPatientsPerDay: parseInt(values.maxPatientsPerDay),
      sessionDurationMinutes: parseInt(values.sessionDurationMinutes),
      isActive: values.isActive !== false,
      dateOfBirth: values.dateOfBirth?.toISOString(),
      joinDate: values.joinDate?.toISOString(),
      terminationDate: values.terminationDate?.toISOString(),
      licenseExpiryDate: values.licenseExpiryDate?.toISOString(),
    };

    if (editingTherapist) {
      updateMutation.mutate({ id: editingTherapist.id, ...therapistData });
    } else {
      createMutation.mutate(therapistData);
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
      sorter: (a: Therapist, b: Therapist) => a.employeeId.localeCompare(b.employeeId),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: Therapist) => `${record.firstName} ${record.lastName}`,
      sorter: (a: Therapist, b: Therapist) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Therapy Type',
      dataIndex: 'therapyType',
      key: 'therapyType',
      filters: therapyTypes?.data?.map((type: string) => ({ text: type, value: type })) || [],
      onFilter: (value: any, record: Therapist) => record.therapyType === value,
    },
    {
      title: 'Department',
      key: 'department',
      render: (_: any, record: Therapist) => record.department?.name || 'N/A',
      filters: departments?.data?.map((dept: any) => ({ text: dept.name, value: dept.id })) || [],
      onFilter: (value: any, record: Therapist) => record.departmentId === value,
    },
    {
      title: 'Specializations',
      dataIndex: 'specializations',
      key: 'specializations',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Hourly Rate',
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      width: 120,
      render: (rate: number) => rate ? `AED ${rate.toFixed(2)}` : 'N/A',
      sorter: (a: Therapist, b: Therapist) => (a.hourlyRate || 0) - (b.hourlyRate || 0),
    },
    {
      title: 'Max Patients/Day',
      dataIndex: 'maxPatientsPerDay',
      key: 'maxPatientsPerDay',
      width: 130,
      sorter: (a: Therapist, b: Therapist) => a.maxPatientsPerDay - b.maxPatientsPerDay,
    },
    {
      title: 'Session Duration',
      dataIndex: 'sessionDurationMinutes',
      key: 'sessionDurationMinutes',
      width: 130,
      render: (minutes: number) => `${minutes} min`,
      sorter: (a: Therapist, b: Therapist) => a.sessionDurationMinutes - b.sessionDurationMinutes,
    },
    {
      title: 'Employment Status',
      dataIndex: 'employmentStatus',
      key: 'employmentStatus',
      width: 130,
      render: (status: string) => {
        const color = status === 'Active' ? 'green' : status === 'Inactive' ? 'orange' : 'red';
        return <span style={{ color }}>{status}</span>;
      },
      filters: [
        { text: 'Active', value: 'Active' },
        { text: 'Inactive', value: 'Inactive' },
        { text: 'Terminated', value: 'Terminated' },
      ],
      onFilter: (value: any, record: Therapist) => record.employmentStatus === value,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Therapist) => {
        if (record.isArchived) {
          return <span style={{ color: 'red' }}>Archived</span>;
        }
        return record.isActive ? 
          <span style={{ color: 'green' }}>Active</span> : 
          <span style={{ color: 'orange' }}>Inactive</span>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: Therapist) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditTherapist(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteTherapist(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreTherapist(record.id)}
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
        <Title level={4}>Therapist Management</Title>
        <Space>
          <Search
            placeholder="Search therapists..."
            onSearch={setSearchQuery}
            style={{ width: 250 }}
          />
          <Select
            placeholder="Filter by department"
            style={{ width: 180 }}
            allowClear
            onChange={setDepartmentFilter}
          >
            {departments?.data?.map((dept: any) => (
              <Option key={dept.id} value={dept.id}>{dept.name}</Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by therapy type"
            style={{ width: 150 }}
            allowClear
            onChange={setTherapyTypeFilter}
          >
            {therapyTypes?.data?.map((type: string) => (
              <Option key={type} value={type}>{type}</Option>
            ))}
          </Select>
          <Switch
            checkedChildren="Show Archived"
            unCheckedChildren="Hide Archived"
            checked={showArchived}
            onChange={setShowArchived}
          />
          <ExportButton 
            endpoint="therapists" 
            fileName="therapists" 
            disabled={!therapists?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddTherapist}
          >
            Add Therapist
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={therapists?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1600 }}
      />

      <Modal
        title={editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name' }]}
            >
              <Input placeholder="John" />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input placeholder="Doe" />
            </Form.Item>

            <Form.Item
              name="employeeId"
              label="Employee ID"
              rules={[{ required: true, message: 'Please enter employee ID' }]}
            >
              <Input placeholder="THR001" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ type: 'email', message: 'Please enter valid email' }]}
            >
              <Input placeholder="john.doe@hospital.com" />
            </Form.Item>

            <Form.Item
              name="phoneNumber"
              label="Phone Number"
            >
              <Input placeholder="+971-50-1234567" />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
            >
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="nationality"
              label="Nationality"
            >
              <Input placeholder="UAE" />
            </Form.Item>

            <Form.Item
              name="departmentId"
              label="Department"
              rules={[{ required: true, message: 'Please select department' }]}
            >
              <Select placeholder="Select department">
                {departments?.data?.map((dept: any) => (
                  <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="therapyType"
              label="Therapy Type"
              rules={[{ required: true, message: 'Please enter therapy type' }]}
            >
              <Select placeholder="Select therapy type">
                <Option value="Physical Therapy">Physical Therapy</Option>
                <Option value="Occupational Therapy">Occupational Therapy</Option>
                <Option value="Speech Therapy">Speech Therapy</Option>
                <Option value="Mental Health Therapy">Mental Health Therapy</Option>
                <Option value="Respiratory Therapy">Respiratory Therapy</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="licenseNumber"
              label="License Number"
            >
              <Input placeholder="DHA-THR001" />
            </Form.Item>

            <Form.Item
              name="licenseExpiryDate"
              label="License Expiry Date"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="joinDate"
              label="Join Date"
              rules={[{ required: true, message: 'Please select join date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="hourlyRate"
              label="Hourly Rate (AED)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={10}
                placeholder="150"
              />
            </Form.Item>

            <Form.Item
              name="maxPatientsPerDay"
              label="Max Patients Per Day"
              rules={[{ required: true, message: 'Please enter max patients per day' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="8"
              />
            </Form.Item>

            <Form.Item
              name="sessionDurationMinutes"
              label="Session Duration (Minutes)"
              rules={[{ required: true, message: 'Please enter session duration' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={15}
                step={15}
                placeholder="60"
              />
            </Form.Item>

            <Form.Item
              name="employmentStatus"
              label="Employment Status"
              rules={[{ required: true, message: 'Please select employment status' }]}
            >
              <Select placeholder="Select status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
                <Option value="Terminated">Terminated</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="address"
            label="Address"
          >
            <TextArea rows={2} placeholder="Full address..." />
          </Form.Item>

          <Form.Item
            name="specializations"
            label="Specializations"
          >
            <TextArea rows={2} placeholder="Areas of specialization..." />
          </Form.Item>

          <Form.Item
            name="certifications"
            label="Certifications"
          >
            <TextArea rows={2} placeholder="Professional certifications..." />
          </Form.Item>

          <Form.Item
            name="workingHours"
            label="Working Hours"
          >
            <TextArea rows={2} placeholder="Working hours and schedule..." />
          </Form.Item>

          <Form.Item
            name="availabilitySchedule"
            label="Availability Schedule"
          >
            <TextArea rows={2} placeholder="Availability schedule..." />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={2} placeholder="Additional notes..." />
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
                {editingTherapist ? 'Update' : 'Add'} Therapist
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
