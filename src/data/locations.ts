import { Location } from '../types';

export const locations: Location[] = [
  // Ground Floor
  {
    id: 'admin_office',
    name: 'Admin Office',
    description: 'Main administrative office',
    type: 'facility',
    floor: 0
  },
  {
    id: 'principal_office',
    name: 'Principal Office',
    description: 'Office of the College Principal',
    type: 'facility',
    floor: 0
  },
  {
    id: 'library',
    name: 'Central Library',
    description: 'Main college library with reading rooms',
    type: 'facility',
    floor: 0
  },

  // First Floor
  {
    id: 'hod_cse',
    name: 'HOD Cabin - CSE',
    description: 'Head of Department - Computer Science Engineering',
    type: 'room',
    floor: 1
  },
  {
    id: 'hod_aiml',
    name: 'HOD Cabin - CSE-AIML',
    description: 'Head of Department - CSE (AI & ML)',
    type: 'room',
    floor: 1
  },
  {
    id: 'hod_csbs',
    name: 'HOD Cabin - CSBS',
    description: 'Head of Department - CSE (Business Systems)',
    type: 'room',
    floor: 1
  },
  {
    id: 'cc_lab_1',
    name: 'CC Lab 1',
    description: 'Computer Center Laboratory 1',
    type: 'lab',
    floor: 1
  },

  // Second Floor
  {
    id: 'cc_lab_2',
    name: 'CC Lab 2',
    description: 'Computer Center Laboratory 2',
    type: 'lab',
    floor: 2
  },
  {
    id: 'ai_lab',
    name: 'AI Lab',
    description: 'Artificial Intelligence Laboratory',
    type: 'lab',
    floor: 2
  },
  {
    id: 'seminar_hall',
    name: 'Seminar Hall',
    description: 'Main seminar and presentation hall',
    type: 'room',
    floor: 2
  },

  // Third Floor
  {
    id: 'research_lab',
    name: 'Research Lab',
    description: 'Advanced Research Laboratory',
    type: 'lab',
    floor: 3
  },
  {
    id: 'project_lab',
    name: 'Project Lab',
    description: 'Student Project Laboratory',
    type: 'lab',
    floor: 3
  }
]; 