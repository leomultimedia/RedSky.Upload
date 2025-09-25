import React from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import 'antd/dist/reset.css';
import UploadPage from './pages/UploadPage';
import PatientsPage from './pages/PatientsPage';
import VisitsPage from './pages/VisitsPage';

const { Header, Content } = Layout;

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 600, marginRight: 24 }}>RedSky</div>
          <Menu theme="dark" mode="horizontal" selectable={false} items={[
            { key: 'upload', label: <Link to="/upload">Excel Upload</Link> },
            { key: 'patients', label: <Link to="/patients">Patients</Link> },
            { key: 'visits', label: <Link to="/visits">Visits</Link> }
          ]} />
        </Header>
        <Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/visits" element={<VisitsPage />} />
          </Routes>
        </Content>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
