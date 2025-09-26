import { generateMockPatients, generateMockVisits, generateMockClinicians } from './mockData';

const MOCK_DATA = {
  patients: generateMockPatients(100),
  clinicians: generateMockClinicians(10)
};

MOCK_DATA.patients.forEach(patient => {
  patient.visits = generateMockVisits(patient.id, Math.floor(Math.random() * 5) + 1);
});

export const mockApi = {
  getPatients: async () => ({ data: MOCK_DATA.patients }),
  getClinicians: async () => ({ data: MOCK_DATA.clinicians }),
  getPatientVisits: async (patientId: string) => ({
    data: MOCK_DATA.patients.find(p => p.id === patientId)?.visits || []
  })
};