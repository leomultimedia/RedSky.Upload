import React from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';

const { Option } = Select;

interface PatientFormProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PatientForm({ visible, onClose, onSuccess }: PatientFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      // TODO: Implement API call to create patient
      console.log('Creating patient:', values);
      message.success('Patient created successfully!');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error('Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add New Patient"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter valid email' }
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: 'Please select gender' }]}
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
          <Input type="date" />
        </Form.Item>

        <Form.Item>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Patient
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
