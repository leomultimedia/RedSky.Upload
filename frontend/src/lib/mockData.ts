// import { faker } from '@faker-js/faker';

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: Date;
  visits?: Visit[];
};

type Visit = {
  id: string;
  visitDate: Date;
  diagnosis: string;
  treatment: string;
};

export function generateMockPatients(count: number): Patient[] {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
  return Array.from({ length: count }, (_, i) => ({
    id: `patient-${i + 1}`,
    firstName: firstNames[i % firstNames.length],
    lastName: lastNames[i % lastNames.length],
    email: `patient${i + 1}@example.com`,
    gender: i % 2 === 0 ? 'Male' : 'Female',
    dateOfBirth: new Date(1970 + (i % 50), i % 12, (i % 28) + 1)
  }));
}

export function generateMockVisits(patientId: string, count: number): Visit[] {
  const diagnoses = ['Checkup', 'Flu', 'Headache', 'Back Pain'];
  const treatments = ['Medication', 'Therapy', 'Rest', 'Surgery'];
  return Array.from({ length: count }, (_, i) => ({
    id: `visit-${patientId}-${i + 1}`,
    visitDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
    diagnosis: diagnoses[i % diagnoses.length],
    treatment: treatments[i % treatments.length]
  }));
}

export function generateMockClinicians(count: number) {
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'David'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown'];
  const departments = ['Cardiology', 'Neurology', 'Orthopedics'];
  return Array.from({ length: count }, (_, i) => ({
    id: `clinician-${i + 1}`,
    firstName: `Dr. ${firstNames[i % firstNames.length]}`,
    lastName: lastNames[i % lastNames.length],
    department: departments[i % departments.length]
  }));
}