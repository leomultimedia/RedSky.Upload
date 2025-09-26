import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DashboardOutlined,
  UploadOutlined,
  TeamOutlined,
  CalendarOutlined,
  AppstoreOutlined,
  MedicineBoxOutlined,
  SettingOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import UploadPage from './pages/UploadPage';
import PatientsPage from './pages/PatientsPage';
import VisitsPage from './pages/VisitsPage';
import DashboardHome from './components/dashboard/Home';
import RoomManagement from './components/masters/RoomManagement';
import TreatmentManagement from './components/masters/TreatmentManagement';
import PackageManagement from './components/masters/PackageManagement';
import WellnessProgramManagement from './components/masters/WellnessProgramManagement';
import DepartmentManagement from './components/clinicians/DepartmentManagement';
import ClinicianManagement from './components/clinicians/ClinicianManagement';
import TherapistManagement from './components/clinicians/TherapistManagement';
import GenderManagement from './components/general/GenderManagement';
import LanguageManagement from './components/general/LanguageManagement';
import NationalityManagement from './components/general/NationalityManagement';

const { Header, Content } = Layout;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>RedSky Health</div>
            <Menu theme="dark" mode="horizontal" selectable={false} items={[
              { 
                key: 'dashboard', 
                icon: <DashboardOutlined />, 
                label: <Link to="/dashboard">Dashboard</Link> 
              },
              { 
                key: 'upload', 
                icon: <UploadOutlined />, 
                label: <Link to="/upload">Excel Upload</Link> 
              },
              { 
                key: 'patients', 
                icon: <TeamOutlined />, 
                label: <Link to="/patients">Patients</Link>,
                children: [
                  { key: 'patients-list', label: <Link to="/patients/list">Patients List</Link> },
                  { key: 'visits-list', label: <Link to="/patients/visits">Visits List</Link> }
                ]
              },
              { 
                key: 'masters', 
                icon: <AppstoreOutlined />, 
                label: 'Masters',
                children: [
                  { key: 'rooms', label: <Link to="/masters/rooms">Room Management</Link> },
                  { key: 'treatments', label: <Link to="/masters/treatments">Treatment Management</Link> },
                  { key: 'plans', label: <Link to="/masters/plans">Treatment Plan</Link> },
                  { key: 'packages', label: <Link to="/masters/packages">Package Details</Link> },
                  { key: 'wellness', label: <Link to="/masters/wellness">Wellness Program</Link> }
                ]
              },
              { 
                key: 'clinicians', 
                icon: <MedicineBoxOutlined />, 
                label: 'Clinician Management',
                children: [
                  { key: 'departments', label: <Link to="/clinicians/departments">Department</Link> },
                  { key: 'clinicians-list', label: <Link to="/clinicians/list">Clinician</Link> },
                  { key: 'therapists', label: <Link to="/clinicians/therapists">Therapist</Link> }
                ]
              },
              { 
                key: 'general', 
                icon: <SettingOutlined />, 
                label: 'General',
                children: [
                  { key: 'genders', label: <Link to="/general/genders">Gender</Link> },
                  { key: 'languages', label: <Link to="/general/languages">Language</Link> },
                  { key: 'nationalities', label: <Link to="/general/nationalities">Nationality</Link> }
                ]
              }
            ]} />
          </Header>
          <Content style={{ padding: 24 }}>
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/upload" element={<UploadPage />} />
              
              {/* Patient Management */}
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/patients/list" element={<PatientsPage />} />
              <Route path="/patients/visits" element={<VisitsPage />} />
              <Route path="/visits" element={<VisitsPage />} />
              
              {/* Masters Module */}
              <Route path="/masters/rooms" element={<RoomManagement />} />
              <Route path="/masters/treatments" element={<TreatmentManagement />} />
              <Route path="/masters/plans" element={<div style={{padding: 24}}><h2>Treatment Plan</h2><p>Treatment plan functionality coming soon...</p></div>} />
              <Route path="/masters/packages" element={<PackageManagement />} />
              <Route path="/masters/wellness" element={<WellnessProgramManagement />} />
              
              {/* Clinician Management */}
              <Route path="/clinicians/departments" element={<DepartmentManagement />} />
              <Route path="/clinicians/list" element={<ClinicianManagement />} />
              <Route path="/clinicians/therapists" element={<TherapistManagement />} />
              
              {/* General Settings */}
              <Route path="/general/genders" element={<GenderManagement />} />
              <Route path="/general/languages" element={<LanguageManagement />} />
              <Route path="/general/nationalities" element={<NationalityManagement />} />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
