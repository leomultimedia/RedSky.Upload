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

interface Package {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  originalPrice: number;
  packagePrice: number;
  discountPercentage: number;
  validityDays: number;
  validFrom?: string;
  validTo?: string;
  department?: string;
  maxUsage: number;
  isActive: boolean;
  isArchived: boolean;
  terms?: string;
  inclusions?: string;
  exclusions?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function PackageManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: packages, isLoading } = useQuery({
    queryKey: ['packages', searchQuery, categoryFilter, showArchived],
    queryFn: () => apiGet(`/packages?search=${searchQuery}&category=${categoryFilter}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const { data: categories } = useQuery({
    queryKey: ['package-categories'],
    queryFn: () => apiGet('/packages/categories'),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (packageData: Partial<Package>) => apiPost('/packages', packageData),
    onSuccess: () => {
      message.success('Package created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: () => {
      message.error('Failed to create package');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...packageData }: Partial<Package> & { id: number }) => 
      apiPut(`/packages/${id}`, packageData),
    onSuccess: () => {
      message.success('Package updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: () => {
      message.error('Failed to update package');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/packages/${id}`),
    onSuccess: () => {
      message.success('Package archived successfully');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: () => {
      message.error('Failed to archive package');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/packages/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Package restored successfully');
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: () => {
      message.error('Failed to restore package');
    }
  });

  const handleAddPackage = () => {
    setEditingPackage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditPackage = (packageData: Package) => {
    setEditingPackage(packageData);
    form.setFieldsValue({
      ...packageData,
      validFrom: packageData.validFrom ? new Date(packageData.validFrom) : null,
      validTo: packageData.validTo ? new Date(packageData.validTo) : null,
    });
    setModalVisible(true);
  };

  const handleDeletePackage = (packageId: number) => {
    Modal.confirm({
      title: 'Archive Package',
      content: 'Are you sure you want to archive this package?',
      onOk: () => deleteMutation.mutate(packageId)
    });
  };

  const handleRestorePackage = (packageId: number) => {
    restoreMutation.mutate(packageId);
  };

  const handleSubmit = (values: any) => {
    const packageData = {
      ...values,
      originalPrice: parseFloat(values.originalPrice),
      packagePrice: parseFloat(values.packagePrice),
      discountPercentage: parseFloat(values.discountPercentage),
      validityDays: parseInt(values.validityDays),
      maxUsage: parseInt(values.maxUsage),
      isActive: values.isActive !== false,
      validFrom: values.validFrom?.toISOString(),
      validTo: values.validTo?.toISOString(),
    };

    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, ...packageData });
    } else {
      createMutation.mutate(packageData);
    }
  };

  const columns = [
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      sorter: (a: Package, b: Package) => a.code.localeCompare(b.code),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Package, b: Package) => a.name.localeCompare(b.name),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      filters: categories?.data?.map((cat: string) => ({ text: cat, value: cat })) || [],
      onFilter: (value: any, record: Package) => record.category === value,
    },
    {
      title: 'Original Price',
      dataIndex: 'originalPrice',
      key: 'originalPrice',
      width: 120,
      render: (price: number) => `AED ${price.toFixed(2)}`,
      sorter: (a: Package, b: Package) => a.originalPrice - b.originalPrice,
    },
    {
      title: 'Package Price',
      dataIndex: 'packagePrice',
      key: 'packagePrice',
      width: 120,
      render: (price: number) => `AED ${price.toFixed(2)}`,
      sorter: (a: Package, b: Package) => a.packagePrice - b.packagePrice,
    },
    {
      title: 'Discount %',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      render: (discount: number) => `${discount.toFixed(1)}%`,
      sorter: (a: Package, b: Package) => a.discountPercentage - b.discountPercentage,
    },
    {
      title: 'Validity (Days)',
      dataIndex: 'validityDays',
      key: 'validityDays',
      width: 120,
      sorter: (a: Package, b: Package) => a.validityDays - b.validityDays,
    },
    {
      title: 'Max Usage',
      dataIndex: 'maxUsage',
      key: 'maxUsage',
      width: 100,
      sorter: (a: Package, b: Package) => a.maxUsage - b.maxUsage,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Package) => {
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
      onFilter: (value: any, record: Package) => {
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
      render: (_: any, record: Package) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditPackage(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeletePackage(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestorePackage(record.id)}
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
        <Title level={4}>Package Management</Title>
        <Space>
          <Search
            placeholder="Search packages..."
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
            endpoint="packages" 
            fileName="packages" 
            disabled={!packages?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddPackage}
          >
            Add Package
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={packages?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1400 }}
      />

      <Modal
        title={editingPackage ? 'Edit Package' : 'Add New Package'}
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
              label="Package Name"
              rules={[{ required: true, message: 'Please enter package name' }]}
            >
              <Input placeholder="e.g., Complete Health Checkup" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Package Code"
              rules={[{ required: true, message: 'Please enter package code' }]}
            >
              <Input placeholder="e.g., PKG001" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please enter category' }]}
            >
              <Input placeholder="e.g., Preventive" />
            </Form.Item>

            <Form.Item
              name="department"
              label="Department"
            >
              <Input placeholder="e.g., General Medicine" />
            </Form.Item>

            <Form.Item
              name="originalPrice"
              label="Original Price (AED)"
              rules={[{ required: true, message: 'Please enter original price' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="1000.00"
              />
            </Form.Item>

            <Form.Item
              name="packagePrice"
              label="Package Price (AED)"
              rules={[{ required: true, message: 'Please enter package price' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={0.01}
                placeholder="750.00"
              />
            </Form.Item>

            <Form.Item
              name="discountPercentage"
              label="Discount Percentage"
              rules={[{ required: true, message: 'Please enter discount percentage' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                max={100}
                step={0.1}
                placeholder="25.0"
              />
            </Form.Item>

            <Form.Item
              name="validityDays"
              label="Validity (Days)"
              rules={[{ required: true, message: 'Please enter validity days' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="365"
              />
            </Form.Item>

            <Form.Item
              name="maxUsage"
              label="Maximum Usage"
              rules={[{ required: true, message: 'Please enter maximum usage' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                placeholder="1"
              />
            </Form.Item>

            <Form.Item
              name="validFrom"
              label="Valid From"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="validTo"
              label="Valid To"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Package description..." />
          </Form.Item>

          <Form.Item
            name="inclusions"
            label="Inclusions"
          >
            <TextArea rows={2} placeholder="What's included in this package..." />
          </Form.Item>

          <Form.Item
            name="exclusions"
            label="Exclusions"
          >
            <TextArea rows={2} placeholder="What's not included..." />
          </Form.Item>

          <Form.Item
            name="terms"
            label="Terms & Conditions"
          >
            <TextArea rows={2} placeholder="Terms and conditions..." />
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
                {editingPackage ? 'Update' : 'Add'} Package
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
