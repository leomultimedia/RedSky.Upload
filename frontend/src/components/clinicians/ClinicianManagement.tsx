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

interface Clinician {
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
  position: string;
  specializations?: string;
  qualifications?: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  joinDate: string;
  terminationDate?: string;
  salary?: number;
  employmentStatus: string;
  workingHours?: string;
  availabilitySchedule?: string;
  isActive: boolean;
  isArchived: boolean;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function ClinicianManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClinician, setEditingClinician] = useState<Clinician | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: clinicians, isLoading } = useQuery({
    queryKey: ['clinicians', searchQuery, departmentFilter, positionFilter, showArchived],
    queryFn: () => apiGet(`/clinicians?search=${searchQuery}&departmentId=${departmentFilter}&position=${positionFilter}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => apiGet('/departments'),
    initialData: { data: [] }
  });

  const { data: positions } = useQuery({
    queryKey: ['clinician-positions'],
    queryFn: () => apiGet('/clinicians/positions'),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (clinician: Partial<Clinician>) => apiPost('/clinicians', clinician),
    onSuccess: () => {
      message.success('Clinician created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to create clinician');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...clinician }: Partial<Clinician> & { id: number }) => 
      apiPut(`/clinicians/${id}`, clinician),
    onSuccess: () => {
      message.success('Clinician updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
    onError: (error: any) => {
      message.error(error.message || 'Failed to update clinician');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/clinicians/${id}`),
    onSuccess: () => {
      message.success('Clinician archived successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
    onError: () => {
      message.error('Failed to archive clinician');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/clinicians/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Clinician restored successfully');
      queryClient.invalidateQueries({ queryKey: ['clinicians'] });
    },
    onError: () => {
      message.error('Failed to restore clinician');
    }
  });

  const handleAddClinician = () => {
    setEditingClinician(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditClinician = (clinician: Clinician) => {
    setEditingClinician(clinician);
    form.setFieldsValue({
      ...clinician,
      dateOfBirth: clinician.dateOfBirth ? new Date(clinician.dateOfBirth) : null,
      joinDate: clinician.joinDate ? new Date(clinician.joinDate) : null,
      terminationDate: clinician.terminationDate ? new Date(clinician.terminationDate) : null,
      licenseExpiryDate: clinician.licenseExpiryDate ? new Date(clinician.licenseExpiryDate) : null,
    });
    setModalVisible(true);
  };

  const handleDeleteClinician = (clinicianId: number) => {
    Modal.confirm({
      title: 'Archive Clinician',
      content: 'Are you sure you want to archive this clinician? This will mark them as terminated.',
      onOk: () => deleteMutation.mutate(clinicianId)
    });
  };

  const handleRestoreClinician = (clinicianId: number) => {
    restoreMutation.mutate(clinicianId);
  };

  const handleSubmit = (values: any) => {
    const clinicianData = {
      ...values,
      departmentId: parseInt(values.departmentId),
      salary: values.salary ? parseFloat(values.salary) : undefined,
      isActive: values.isActive !== false,
      dateOfBirth: values.dateOfBirth?.toISOString(),
      joinDate: values.joinDate?.toISOString(),
      terminationDate: values.terminationDate?.toISOString(),
      licenseExpiryDate: values.licenseExpiryDate?.toISOString(),
    };

    if (editingClinician) {
      updateMutation.mutate({ id: editingClinician.id, ...clinicianData });
    } else {
      createMutation.mutate(clinicianData);
    }
  };

  const columns = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 120,
      sorter: (a: Clinician, b: Clinician) => a.employeeId.localeCompare(b.employeeId),
    },
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: Clinician) => `${record.firstName} ${record.lastName}`,
      sorter: (a: Clinician, b: Clinician) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      filters: positions?.data?.map((pos: string) => ({ text: pos, value: pos })) || [],
      onFilter: (value: any, record: Clinician) => record.position === value,
    },
    {
      title: 'Department',
      key: 'department',
      render: (_: any, record: Clinician) => record.department?.name || 'N/A',
      filters: departments?.data?.map((dept: any) => ({ text: dept.name, value: dept.id })) || [],
      onFilter: (value: any, record: Clinician) => record.departmentId === value,
    },
    {
      title: 'Specializations',
      dataIndex: 'specializations',
      key: 'specializations',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'License',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
      width: 120,
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
      sorter: (a: Clinician, b: Clinician) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
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
      onFilter: (value: any, record: Clinician) => record.employmentStatus === value,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Clinician) => {
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
      render: (_: any, record: Clinician) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditClinician(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteClinician(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreClinician(record.id)}
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
        <Title level={4}>Clinician Management</Title>
        <Space>
          <Search
            placeholder="Search clinicians..."
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
            placeholder="Filter by position"
            style={{ width: 150 }}
            allowClear
            onChange={setPositionFilter}
          >
            {positions?.data?.map((position: string) => (
              <Option key={position} value={position}>{position}</Option>
            ))}
          </Select>
          <Switch
            checkedChildren="Show Archived"
            unCheckedChildren="Hide Archived"
            checked={showArchived}
            onChange={setShowArchived}
          />
          <ExportButton 
            endpoint="clinicians" 
            fileName="clinicians" 
            disabled={!clinicians?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddClinician}
          >
            Add Clinician
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={clinicians?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1600 }}
      />

      <Modal
        title={editingClinician ? 'Edit Clinician' : 'Add New Clinician'}
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
              <Input placeholder="DOC001" />
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
              name="position"
              label="Position"
              rules={[{ required: true, message: 'Please enter position' }]}
            >
              <Input placeholder="Cardiologist" />
            </Form.Item>

            <Form.Item
              name="licenseNumber"
              label="License Number"
            >
              <Input placeholder="DHA-12345" />
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
              name="salary"
              label="Salary (AED)"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={1000}
                placeholder="45000"
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
            name="qualifications"
            label="Qualifications"
          >
            <TextArea rows={2} placeholder="Educational qualifications and certifications..." />
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
                {editingClinician ? 'Update' : 'Add'} Clinician
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
