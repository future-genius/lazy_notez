import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const subjectData: Record<string, Record<string, string[]>> = {
  CSE: {
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
    VIII: ['Project Work', 'Security Consulting', 'Emerging Threats', 'Research Methodology']
  },
  ECE: {
    III: ['Electronic Circuits', 'Signals and Systems', 'Digital Electronics', 'Electromagnetic Fields'],
    IV: ['Communication Systems', 'Microprocessors', 'Control Systems', 'VLSI Design'],
    V: ['Digital Signal Processing', 'Antenna Theory', 'Embedded Systems', 'Optical Communication'],
    VI: ['Wireless Communication', 'Satellite Communication', 'Radar Systems', 'Biomedical Electronics'],
    VII: ['Advanced Communication', '5G Technology', 'RF Circuit Design', 'Nanoelectronics'],
    VIII: ['Project Work', 'Research Topics', 'Industry Applications', 'Emerging Technologies']
  },
  CIVIL: {
    III: ['Structural Analysis', 'Fluid Mechanics', 'Surveying', 'Building Materials'],
    IV: ['Concrete Technology', 'Soil Mechanics', 'Transportation Engineering', 'Environmental Engineering'],
    V: ['Steel Structures', 'Foundation Engineering', 'Water Resources', 'Construction Management'],
    VI: ['Earthquake Engineering', 'Bridge Engineering', 'Advanced Concrete', 'Project Planning'],
    VII: ['Structural Dynamics', 'Advanced Geotechnics', 'Smart Cities', 'Sustainable Construction'],
    VIII: ['Project Work', 'Advanced Topics', 'Research Methods', 'Professional Practice']
  },
  MECH: {
    III: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing Processes'],
    IV: ['Heat Transfer', 'Internal Combustion Engines', 'Mechanical Vibrations', 'Industrial Engineering'],
    V: ['Automobile Engineering', 'Refrigeration', 'Power Plant Engineering', 'Finite Element Analysis'],
    VI: ['Robotics', 'Advanced Manufacturing', 'Renewable Energy', 'Mechatronics'],
    VII: ['Advanced Robotics', 'Additive Manufacturing', 'Smart Materials', 'Industry 4.0'],
    VIII: ['Project Work', 'Research Topics', 'Advanced Design', 'Emerging Technologies']
  },
  AGRI: {
    III: ['Crop Production', 'Soil Science', 'Agricultural Machinery', 'Plant Pathology'],
    IV: ['Irrigation Engineering', 'Farm Management', 'Agricultural Economics', 'Entomology'],
    V: ['Post Harvest Technology', 'Agricultural Processing', 'Precision Agriculture', 'Biotechnology'],
    VI: ['Sustainable Agriculture', 'Organic Farming', 'Agricultural Marketing', 'Rural Development'],
    VII: ['Advanced Biotechnology', 'Climate Smart Agriculture', 'Agricultural Policy', 'Research Methods'],
    VIII: ['Project Work', 'Extension Education', 'Agricultural Innovation', 'Thesis Work']
  },
  EEE: {
    III: ['Circuit Analysis', 'Electrical Machines', 'Power Systems', 'Control Systems'],
    IV: ['Power Electronics', 'Electrical Drives', 'Microprocessors', 'Digital Signal Processing'],
    V: ['Power System Protection', 'Renewable Energy', 'High Voltage Engineering', 'Electric Vehicles'],
    VI: ['Smart Grid', 'Power Quality', 'Energy Management', 'Industrial Automation'],
    VII: ['Advanced Power Systems', 'Energy Storage', 'Grid Integration', 'Power System Economics'],
    VIII: ['Project Work', 'Research Topics', 'Emerging Technologies', 'Professional Practice']
  },
  MDE: {
    III: ['Manufacturing Processes', 'Engineering Materials', 'Machine Design', 'Quality Control'],
    IV: ['CAD/CAM', 'Production Planning', 'Industrial Engineering', 'Automation'],
    V: ['Advanced Manufacturing', 'Lean Manufacturing', 'Supply Chain Management', 'Product Design'],
    VI: ['Additive Manufacturing', 'Industry 4.0', 'Digital Manufacturing', 'Sustainability'],
    VII: ['Smart Manufacturing', 'IoT in Manufacturing', 'Advanced Materials', 'Innovation Management'],
    VIII: ['Project Work', 'Research Methods', 'Emerging Technologies', 'Entrepreneurship']
  },
  IT: {
    III: ['Programming Fundamentals', 'Data Structures', 'Computer Networks', 'Database Systems'],
    IV: ['Web Technologies', 'Software Engineering', 'Operating Systems', 'System Analysis'],
    V: ['Mobile Application Development', 'Cloud Computing', 'Information Security', 'Data Analytics'],
    VI: ['Artificial Intelligence', 'Machine Learning', 'DevOps', 'Enterprise Systems'],
    VII: ['Advanced AI', 'Big Data', 'Blockchain', 'IoT Applications'],
    VIII: ['Project Work', 'Research Topics', 'Industry Trends', 'Professional Skills']
  },
  EIE: {
    III: ['Instrumentation', 'Control Systems', 'Electronic Circuits', 'Sensors and Transducers'],
    IV: ['Process Control', 'Industrial Automation', 'Microprocessors', 'Signal Processing'],
    V: ['Advanced Control Systems', 'Biomedical Instrumentation', 'Robotics', 'SCADA Systems'],
    VI: ['Smart Instrumentation', 'IoT in Instrumentation', 'Machine Vision', 'Advanced Sensors'],
    VII: ['Industry 4.0', 'Artificial Intelligence', 'Predictive Maintenance', 'Digital Twins'],
    VIII: ['Project Work', 'Research Methods', 'Emerging Technologies', 'Professional Practice']
  },
  AIDS: {
    III: ['Python Programming', 'Statistics', 'Data Structures', 'Linear Algebra'],
    IV: ['Machine Learning', 'Database Systems', 'Data Visualization', 'Probability Theory'],
    V: ['Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Big Data Analytics'],
    VI: ['Advanced AI', 'Reinforcement Learning', 'MLOps', 'AI Ethics'],
    VII: ['Generative AI', 'AI Research', 'Quantum Machine Learning', 'AI in Industry'],
    VIII: ['Project Work', 'Thesis', 'Advanced Research', 'AI Innovation']
  }
};

function ResourcesSubpage() {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const getSubjects = (): string[] => {
    if (selectedDepartment && selectedSemester && subjectData[selectedDepartment]) {
      return subjectData[selectedDepartment][selectedSemester] || [];
    }
    return [];
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department);
    setSelectedSubject('');
  };

  const handleSemesterChange = (semester: string) => {
    setSelectedSemester(semester);
    setSelectedSubject('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/home')}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Your Resources</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selectedSemester}
                onChange={(e) => handleSemesterChange(e.target.value)}
              >
                <option value="">Select Semester</option>
                <option value="III">III Semester</option>
                <option value="IV">IV Semester</option>
                <option value="V">V Semester</option>
                <option value="VI">VI Semester</option>
                <option value="VII">VII Semester</option>
                <option value="VIII">VIII Semester</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selectedDepartment}
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science Engineering</option>
                <option value="CYS">Cyber Security</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="CIVIL">Civil Engineering</option>
                <option value="MECH">Mechanical Engineering</option>
                <option value="AGRI">Agricultural Engineering</option>
                <option value="EEE">Electrical & Electronics</option>
                <option value="MDE">Manufacturing & Design</option>
                <option value="IT">Information Technology</option>
                <option value="EIE">Electronics & Instrumentation</option>
                <option value="AIDS">AI & Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedDepartment || !selectedSemester}
              >
                <option value="">Select Subject</option>
                {getSubjects().map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <button
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!selectedSemester || !selectedDepartment || !selectedSubject}
              onClick={() => {
                console.log('Fetching resources for:', {
                  semester: selectedSemester,
                  department: selectedDepartment,
                  subject: selectedSubject
                });
                alert(`Resources for ${selectedSubject} will be available soon!`);
              }}
            >
              Find Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourcesSubpage;
