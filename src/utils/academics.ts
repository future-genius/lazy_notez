export const DEPARTMENTS: { code: string; label: string }[] = [
  { code: 'CSE', label: 'Computer Science and Engineering' },
  { code: 'ECE', label: 'Electronics and Communication Engineering' },
  { code: 'IT', label: 'Information Technology' },
  { code: 'AIDS', label: 'Artificial Intelligence and Data Science' },
  { code: 'MECH', label: 'Mechanical Engineering' },
  { code: 'CIVIL', label: 'Civil Engineering' },
  { code: 'EEE', label: 'Electrical and Electronics Engineering' },
  { code: 'EIE', label: 'Electronics and Instrumentation Engineering' },
  { code: 'AGRI', label: 'Agricultural Engineering' },
  { code: 'CYBERSECURITY', label: 'Cyber Security' },
  { code: 'MDE', label: 'Mechatronics and Design Engineering' }
];

export const SEMESTERS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'] as const;

const COMMON_SUBJECTS: Record<(typeof SEMESTERS)[number], string[]> = {
  I: ['Engineering Mathematics I', 'Engineering Physics', 'Engineering Chemistry', 'Programming Fundamentals', 'Basic Electrical Engineering', 'Engineering Graphics'],
  II: ['Engineering Mathematics II', 'Physics for Computing', 'Environmental Science', 'Data Structures Basics', 'Digital Fundamentals', 'Professional Communication'],
  III: ['Engineering Mathematics III', 'Data Structures', 'Object Oriented Programming', 'Computer Organization', 'Discrete Mathematics'],
  IV: ['Probability & Statistics', 'Database Management Systems', 'Operating Systems', 'Computer Networks', 'Design and Analysis of Algorithms'],
  V: ['Software Engineering', 'Web Technologies', 'Machine Learning', 'Professional Elective I'],
  VI: ['Cloud Computing', 'Distributed Systems', 'Compiler Design', 'Information Security', 'Professional Elective II'],
  VII: ['Mobile Application Development', 'Big Data Analytics', 'Cyber Security', 'Professional Elective III', 'Project Work I'],
  VIII: ['Project Work II', 'Internship / Seminar', 'Professional Elective IV']
};

const DEPARTMENT_SUBJECTS: Record<string, Partial<typeof COMMON_SUBJECTS>> = {
  CSE: {
    III: ['Data Structures', 'Discrete Mathematics', 'Digital Logic Design', 'Object Oriented Programming (Java)'],
    IV: ['Database Management Systems', 'Operating Systems', 'Computer Networks', 'Design and Analysis of Algorithms'],
    V: ['Software Engineering', 'Web Technologies', 'Machine Learning', 'Computer Graphics'],
    VI: ['Cloud Computing', 'Compiler Design', 'Distributed Systems', 'Information Security'],
    VII: ['Mobile Application Development', 'Big Data Analytics', 'Cyber Security', 'DevOps']
  },
  ECE: {
    III: ['Signals and Systems', 'Analog Circuits', 'Digital Electronics', 'Network Analysis'],
    IV: ['Communication Systems', 'Microprocessors', 'Electromagnetic Fields', 'Linear Integrated Circuits'],
    V: ['Digital Signal Processing', 'VLSI Design', 'Control Systems', 'Embedded Systems'],
    VI: ['Wireless Communication', 'Antenna and Wave Propagation', 'Digital Communication', 'IoT Systems'],
    VII: ['RF Engineering', 'Optical Communication', 'Satellite Communication', 'Project Work I']
  },
  IT: {
    III: ['Data Structures', 'Discrete Mathematics', 'Object Oriented Programming', 'Computer Organization'],
    IV: ['Database Management Systems', 'Operating Systems', 'Computer Networks', 'Algorithms'],
    V: ['Web Technologies', 'Software Engineering', 'Data Mining', 'Professional Elective I'],
    VI: ['Cloud Computing', 'Information Security', 'Distributed Systems', 'Professional Elective II'],
    VII: ['Mobile Application Development', 'Big Data Analytics', 'Project Work I', 'Professional Elective III']
  },
  AIDS: {
    III: ['Data Structures', 'Linear Algebra', 'Python Programming', 'Digital Logic'],
    IV: ['Probability & Statistics', 'Database Management Systems', 'Operating Systems', 'Machine Learning Basics'],
    V: ['Machine Learning', 'Deep Learning', 'Data Mining', 'Natural Language Processing'],
    VI: ['Big Data Analytics', 'Computer Vision', 'Cloud Computing', 'Information Security'],
    VII: ['AI Ethics', 'MLOps', 'Project Work I', 'Professional Elective III']
  }
};

export function getDepartmentLabel(codeOrLabel: string) {
  const code = (codeOrLabel || '').trim();
  return DEPARTMENTS.find((d) => d.code === code)?.label || code;
}

export function getDepartmentCode(labelOrCode: string) {
  const value = (labelOrCode || '').trim();
  return DEPARTMENTS.find((d) => d.label === value)?.code || value;
}

export function getSubjectOptions(departmentCode: string, semester: string) {
  const sem = (semester || '').trim() as (typeof SEMESTERS)[number];
  if (!sem || !(SEMESTERS as readonly string[]).includes(sem)) return [];
  const dept = DEPARTMENT_SUBJECTS[departmentCode]?.[sem];
  const base = COMMON_SUBJECTS[sem] || [];
  return Array.from(new Set([...(dept || []), ...base]));
}

