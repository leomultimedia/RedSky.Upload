import { generateMockPatients, generateMockVisits, generateMockClinicians } from './mockData';

const MOCK_DATA = {
  patients: generateMockPatients(10),
  clinicians: generateMockClinicians(5)
};

export const mockApi = {
  getPatients: async () => ({ data: MOCK_DATA.patients }),
  getClinicians: async () => ({ data: MOCK_DATA.clinicians }),
  getPatientVisits: async (patientId: string) => ({
    data: generateMockVisits(patientId, 3)
  })
};

export default mockApi;
