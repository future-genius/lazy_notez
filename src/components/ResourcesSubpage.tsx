import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Subject data based on department and semester
const subjectData: Record<string, Record<string, string[]>> = {
export { default } from '../pages/ResourcesSubpage';
    III: ['Data Structures', 'Computer Organization', 'Discrete Mathematics', 'Object Oriented Programming'],
    IV: ['Database Management Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
    V: ['Compiler Design', 'Machine Learning', 'Web Technologies', 'Computer Graphics'],
    VI: ['Artificial Intelligence', 'Distributed Systems', 'Mobile Computing', 'Information Security'],
    VII: ['Cloud Computing', 'Big Data Analytics', 'Internet of Things', 'Blockchain Technology'],
    VIII: ['Project Work', 'Advanced Topics in AI', 'Quantum Computing', 'Research Methodology']
  },
  CYS: {
    III: ['Network Security', 'Cryptography', 'Digital Forensics', 'Ethical Hacking'],
    IV: ['Malware Analysis', 'Incident Response', 'Security Auditing', 'Risk Management'],
    V: ['Advanced Cryptography', 'Penetration Testing', 'Security Architecture', 'Cyber Law'],
    VI: ['Threat Intelligence', 'Security Operations', 'Mobile Security', 'Cloud Security'],
    VII: ['Advanced Forensics', 'Security Research', 'IoT Security', 'AI in Cybersecurity'],
    export { default } from '../pages/ResourcesSubpage';