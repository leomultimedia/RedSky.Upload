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

interface Language {
  id: number;
  name: string;
  code: string;
  countryCode?: string;
  nativeName?: string;
  direction: string;
  isActive: boolean;
  isDefault: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export default function LanguageManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLanguage, setEditingLanguage] = useState<Language | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: languages, isLoading } = useQuery({
    queryKey: ['languages', searchQuery, showArchived],
    queryFn: () => apiGet(`/languages?search=${searchQuery}&includeArchived=${showArchived}`),
    initialData: { data: [] }
  });

  const createMutation = useMutation({
    mutationFn: (language: Partial<Language>) => apiPost('/languages', language),
    onSuccess: () => {
      message.success('Language created successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: () => {
      message.error('Failed to create language');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...language }: Partial<Language> & { id: number }) => 
      apiPut(`/languages/${id}`, language),
    onSuccess: () => {
      message.success('Language updated successfully');
      setModalVisible(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: () => {
      message.error('Failed to update language');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiDelete(`/languages/${id}`),
    onSuccess: () => {
      message.success('Language archived successfully');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: () => {
      message.error('Failed to archive language');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: (id: number) => apiPost(`/languages/${id}/restore`, {}),
    onSuccess: () => {
      message.success('Language restored successfully');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: () => {
      message.error('Failed to restore language');
    }
  });

  const handleAddLanguage = () => {
    setEditingLanguage(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditLanguage = (language: Language) => {
    setEditingLanguage(language);
    form.setFieldsValue(language);
    setModalVisible(true);
  };

  const handleDeleteLanguage = (languageId: number) => {
    Modal.confirm({
      title: 'Archive Language',
      content: 'Are you sure you want to archive this language?',
      onOk: () => deleteMutation.mutate(languageId)
    });
  };

  const handleRestoreLanguage = (languageId: number) => {
    restoreMutation.mutate(languageId);
  };

  const handleSubmit = (values: any) => {
    const languageData = {
      ...values,
      sortOrder: values.sortOrder || 0,
      isActive: values.isActive !== false,
      isDefault: values.isDefault || false,
      direction: values.direction || 'LTR'
    };

    if (editingLanguage) {
      updateMutation.mutate({ id: editingLanguage.id, ...languageData });
    } else {
      createMutation.mutate(languageData);
    }
  };

  const columns = [
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      sorter: (a: Language, b: Language) => a.sortOrder - b.sortOrder,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Language, b: Language) => a.name.localeCompare(b.name),
    },
    {
      title: 'Native Name',
      dataIndex: 'nativeName',
      key: 'nativeName',
      width: 150,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 80,
      sorter: (a: Language, b: Language) => a.code.localeCompare(b.code),
    },
    {
      title: 'Country',
      dataIndex: 'countryCode',
      key: 'countryCode',
      width: 100,
    },
    {
      title: 'Direction',
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
      render: (direction: string) => (
        <span style={{ 
          color: direction === 'RTL' ? 'orange' : 'green',
          fontWeight: 'bold'
        }}>
          {direction}
        </span>
      ),
      filters: [
        { text: 'LTR (Left to Right)', value: 'LTR' },
        { text: 'RTL (Right to Left)', value: 'RTL' },
      ],
      onFilter: (value: any, record: Language) => record.direction === value,
    },
    {
      title: 'Default',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (isDefault: boolean) => (
        <span style={{ color: isDefault ? 'green' : 'gray' }}>
          {isDefault ? '✓ Default' : ''}
        </span>
      ),
      filters: [
        { text: 'Default Language', value: true },
        { text: 'Non-Default', value: false },
      ],
      onFilter: (value: any, record: Language) => record.isDefault === value,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Language) => {
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
      onFilter: (value: any, record: Language) => {
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
      render: (_: any, record: Language) => (
        <Space>
          {!record.isArchived ? (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditLanguage(record)}
              >
                Edit
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteLanguage(record.id)}
              >
                Archive
              </Button>
            </>
          ) : (
            <Button 
              type="default" 
              size="small" 
              icon={<UndoOutlined />}
              onClick={() => handleRestoreLanguage(record.id)}
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
        <Title level={4}>Language Management</Title>
        <Space>
          <Search
            placeholder="Search languages..."
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
            endpoint="languages" 
            fileName="languages" 
            disabled={!languages?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddLanguage}
          >
            Add Language
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={languages?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
        scroll={{ x: 1000 }}
      />

      <Modal
        title={editingLanguage ? 'Edit Language' : 'Add New Language'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="name"
              label="Language Name"
              rules={[{ required: true, message: 'Please enter language name' }]}
            >
              <Input placeholder="e.g., English, Arabic, Hindi" />
            </Form.Item>

            <Form.Item
              name="code"
              label="Language Code"
              rules={[{ required: true, message: 'Please enter language code' }]}
            >
              <Input placeholder="e.g., en, ar, hi" maxLength={10} />
            </Form.Item>

            <Form.Item
              name="countryCode"
              label="Country Code"
            >
              <Input placeholder="e.g., US, AE, IN" maxLength={10} />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name="nativeName"
              label="Native Name"
            >
              <Input placeholder="e.g., English, العربية, हिन्दी" />
            </Form.Item>

            <Form.Item
              name="direction"
              label="Text Direction"
              rules={[{ required: true, message: 'Please select direction' }]}
            >
              <Select placeholder="Select direction">
                <Option value="LTR">LTR (Left to Right)</Option>
                <Option value="RTL">RTL (Right to Left)</Option>
              </Select>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="isActive"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>

            <Form.Item
              name="isDefault"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch checkedChildren="Default Language" unCheckedChildren="Not Default" />
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
                {editingLanguage ? 'Update' : 'Add'} Language
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
