import React, { useState } from 'react';
import { Table, Space, Button, Card, Typography, Input, Modal, Form, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import ExportButton from '../ExportButton';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  department: string;
  capacity: number;
  status: 'Available' | 'Occupied' | 'Maintenance';
  floor: number;
  amenities: string[];
}

export default function RoomManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [form] = Form.useForm();

  // Mock data for rooms
  const mockRooms: Room[] = [
    {
      id: 1,
      roomNumber: 'R101',
      roomType: 'Private',
      department: 'Cardiology',
      capacity: 1,
      status: 'Available',
      floor: 1,
      amenities: ['AC', 'TV', 'WiFi']
    },
    {
      id: 2,
      roomNumber: 'R102',
      roomType: 'Semi-Private',
      department: 'Neurology',
      capacity: 2,
      status: 'Occupied',
      floor: 1,
      amenities: ['AC', 'WiFi']
    },
    {
      id: 3,
      roomNumber: 'R201',
      roomType: 'Ward',
      department: 'Orthopedics',
      capacity: 4,
      status: 'Available',
      floor: 2,
      amenities: ['AC']
    }
  ];

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', searchQuery],
    queryFn: () => Promise.resolve({ data: mockRooms }),
    initialData: { data: mockRooms }
  });

  const handleAddRoom = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setModalVisible(true);
  };

  const handleDeleteRoom = (roomId: number) => {
    Modal.confirm({
      title: 'Delete Room',
      content: 'Are you sure you want to delete this room?',
      onOk: () => {
        message.success('Room deleted successfully');
      }
    });
  };

  const handleSubmit = (values: any) => {
    if (editingRoom) {
      message.success('Room updated successfully');
    } else {
      message.success('Room added successfully');
    }
    setModalVisible(false);
    form.resetFields();
  };

  const columns = [
    {
      title: 'Room Number',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      sorter: (a: Room, b: Room) => a.roomNumber.localeCompare(b.roomNumber),
    },
    {
      title: 'Type',
      dataIndex: 'roomType',
      key: 'roomType',
      filters: [
        { text: 'Private', value: 'Private' },
        { text: 'Semi-Private', value: 'Semi-Private' },
        { text: 'Ward', value: 'Ward' },
      ],
      onFilter: (value: any, record: Room) => record.roomType === value,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a: Room, b: Room) => a.capacity - b.capacity,
    },
    {
      title: 'Floor',
      dataIndex: 'floor',
      key: 'floor',
      sorter: (a: Room, b: Room) => a.floor - b.floor,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{
          color: status === 'Available' ? 'green' : 
                status === 'Occupied' ? 'orange' : 'red'
        }}>
          {status}
        </span>
      ),
      filters: [
        { text: 'Available', value: 'Available' },
        { text: 'Occupied', value: 'Occupied' },
        { text: 'Maintenance', value: 'Maintenance' },
      ],
      onFilter: (value: any, record: Room) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Room) => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEditRoom(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRoom(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4}>Room Management</Title>
        <Space>
          <Search
            placeholder="Search rooms..."
            onSearch={setSearchQuery}
            style={{ width: 300 }}
          />
          <ExportButton 
            endpoint="rooms" 
            fileName="rooms" 
            disabled={!data?.data?.length}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddRoom}
          >
            Add Room
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />

      <Modal
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
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
          <Form.Item
            name="roomNumber"
            label="Room Number"
            rules={[{ required: true, message: 'Please enter room number' }]}
          >
            <Input placeholder="e.g., R101" />
          </Form.Item>

          <Form.Item
            name="roomType"
            label="Room Type"
            rules={[{ required: true, message: 'Please select room type' }]}
          >
            <Select placeholder="Select room type">
              <Option value="Private">Private</Option>
              <Option value="Semi-Private">Semi-Private</Option>
              <Option value="Ward">Ward</Option>
              <Option value="ICU">ICU</Option>
              <Option value="Emergency">Emergency</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Department"
            rules={[{ required: true, message: 'Please enter department' }]}
          >
            <Input placeholder="e.g., Cardiology" />
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: 'Please enter capacity' }]}
          >
            <Input type="number" placeholder="Number of beds" />
          </Form.Item>

          <Form.Item
            name="floor"
            label="Floor"
            rules={[{ required: true, message: 'Please enter floor number' }]}
          >
            <Input type="number" placeholder="Floor number" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select status' }]}
          >
            <Select placeholder="Select status">
              <Option value="Available">Available</Option>
              <Option value="Occupied">Occupied</Option>
              <Option value="Maintenance">Maintenance</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRoom ? 'Update' : 'Add'} Room
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
