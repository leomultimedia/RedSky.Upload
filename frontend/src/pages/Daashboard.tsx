import React from 'react';
import { Layout, Menu, theme, Spin } from 'antd';
import {
  UploadOutlined, TeamOutlined, CalendarOutlined,
  MedicineBoxOutlined, AppstoreOutlined, DashboardOutlined
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import './dashboard.less';

const { Content, Sider } = Layout;

const menuItems = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: 'Dashboard'
  },
  {
    key: 'upload',
    icon: <UploadOutlined />,
    label: 'Excel Upload'
  },
  {
    key: 'patients',
    icon: <TeamOutlined />,
    label: 'Patients',
    children: [
      { key: 'patients/list', label: 'Patients List' },
      { key: 'patients/visits', label: 'Visits List' }
    ]
  },
  {
    key: 'masters',
    icon: <AppstoreOutlined />,
    label: 'Masters',
    children: [
      { key: 'masters/rooms', label: 'Room Management' },
      { key: 'masters/treatments', label: 'Treatment Management' },
      { key: 'masters/plans', label: 'Treatment Plan' },
      { key: 'masters/packages', label: 'Package Details' },
      { key: 'masters/wellness', label: 'Wellness Program' }
    ]
  },
  {
    key: 'clinicians',
    icon: <MedicineBoxOutlined />,
    label: 'Clinician Management',
    children: [
      { key: 'clinicians/departments', label: 'Department' },
      { key: 'clinicians/list', label: 'Clinician' },
      { key: 'clinicians/therapists', label: 'Therapist' }
    ]
  },
  {
    key: 'general',
    icon: <AppstoreOutlined />,
    label: 'General',
    children: [
      { key: 'general/genders', label: 'Gender' },
      { key: 'general/languages', label: 'Language' },
      { key: 'general/nationalities', label: 'Nationality' }
    ]
  }
];

export default function Dashboard() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout className="dashboard-layout">
      <Sider width={250} theme="light">
        <div className="logo">RedSky Health</div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname.split('/').pop() || 'dashboard']}
          defaultOpenKeys={['patients', 'masters', 'clinicians', 'general']}
          style={{ height: '100%' }}
          items={menuItems}
          onSelect={({ keyPath }) => navigate(keyPath.reverse().join('/'))}
        />
      </Sider>
      <Content style={{ background: colorBgContainer }}>
        <React.Suspense fallback={<Spin size="large" />}>
          <Outlet />
        </React.Suspense>
      </Content>
    </Layout>
  );
}