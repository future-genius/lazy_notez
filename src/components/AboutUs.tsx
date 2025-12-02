import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Mail, Linkedin, Code, Users, FileText, Settings } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  linkedin: string;
  email: string;
  icon: React.ReactNode;
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  const handleLinkedInClick = () => {
    window.open(member.linkedin, '_blank', 'noopener,noreferrer');
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Profile Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-full flex items-center justify-center shadow-lg">
          {member.icon}
        </div>
      </div>
      
      {/* Member Info */}
      <div className="text-center space-y-3">
        <h3 className="text-lg font-bold text-gray-800">
          {member.name}
        </h3>
        <p className="text-sm text-gray-600 bg-gray-100 rounded-full px-3 py-1 inline-block">
          {member.role}
        </p>
        
        {/* Contact Links */}
          <div className="flex justify-center space-x-3 pt-3">
            <button
              onClick={handleLinkedInClick}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transform hover:scale-110 transition-all duration-300 shadow-md"
              title={`Visit ${member.name}'s LinkedIn profile`}
            >
              <Linkedin className="w-4 h-4" />
            </button>
            <a
              href={`mailto:${encodeURIComponent(member.email)}`}
              className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transform hover:scale-110 transition-all duration-300 shadow-md inline-flex items-center justify-center"
              title={`Send email to ${member.email}`}
              aria-label={`Email ${member.name}`}
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>
      </div>
    </div>
  );
}

function AboutUs() {
  const navigate = useNavigate();

  const teamMembers: TeamMember[] = [
    {
      name: "Hariharan R",
      role: "Full Stack Developer / Project Team Lead",
      linkedin: "https://www.linkedin.com/in/future-genius/",
      email: "haranrhari28@gmail.com",
      icon: <Code className="w-8 h-8 text-white" />
    },
    {
      name: "Balamurugan P",
      role: "Project Manager",
      linkedin: "https://www.linkedin.com/in/balamurugan-p-4260222b6/",
      email: "bala911922@gmail.com",
      icon: <Users className="w-8 h-8 text-white" />
    },
    {
      name: "Kamales A M",
      role: "Notes Organizer / Resource Manager",
      linkedin: "https://www.linkedin.com/in/amkamales25/",
      email: "amk25amales2006@gmail.com",
      icon: <FileText className="w-8 h-8 text-white" />
    },
    {
      name: "Harish Raja R",
      role: "Documentation & Compliance Lead",
      linkedin: "https://www.linkedin.com/in/harish-raja-5559942b7/",
      email: "harishraja250@gmail.com",
      icon: <Settings className="w-8 h-8 text-white" />
    }
  ];

  const handleContactEmail = () => {
    // Use an explicit mailto link navigation via anchor click to improve compatibility
    window.location.href = `mailto:${encodeURIComponent('projectlazynotez@gmail.com')}`;
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBackToHome}
          className="mb-8 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
            About Lazy Tech Wave
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are a passionate team of developers and educators dedicated to revolutionizing the way students access and organize their study materials. Our mission is to make learning more efficient and accessible for everyone.
          </p>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Mission</h2>
            <p className="text-gray-600 text-center leading-relaxed">
              To simplify the educational journey by providing organized, accessible, and comprehensive study resources that empower students to achieve their academic goals efficiently.
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Our Vision</h2>
            <p className="text-gray-600 text-center leading-relaxed">
              To become the leading platform for educational resources, fostering a collaborative learning environment where knowledge is shared freely and learning becomes a joyful experience.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-xl p-8 shadow-lg mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Collaboration</h3>
              <p className="text-gray-600">Working together to create the best learning experience for students worldwide.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Innovation</h3>
              <p className="text-gray-600">Constantly improving and innovating to provide cutting-edge educational solutions.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality</h3>
              <p className="text-gray-600">Ensuring every resource meets the highest standards of accuracy and usefulness.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-lg mb-6 opacity-90">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href={`mailto:${encodeURIComponent('projectlazynotez@gmail.com')}`}
              className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg inline-block text-center"
            >
              Contact Us
            </a>
            <button
              onClick={handleBackToHome}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-800 transition-colors duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;