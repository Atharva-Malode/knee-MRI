'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, GraduationCap, UserCircle, Building2, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: 'guide' | 'student';
  avatar: string;
}

export default function InfoPage() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    // Import team data directly
    import('./team.json')
      .then((module) => {
        const data = module.default;
        setTeamMembers(data);
      })
      .catch((err) => console.error('Error loading team:', err));
  }, []);

  const guide = teamMembers.find((member) => member.role === 'guide');
  const students = teamMembers.filter((member) => member.role === 'student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-50 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700 rounded-full transition-all duration-300 hover:scale-105 flex items-center gap-2 group"
      >
        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
        <span className="text-sm text-gray-400 group-hover:text-purple-400">Back</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-700/50 rounded-full">
            <Award className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Final Year Project 2024-25</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered Knee MRI Analysis
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Revolutionizing medical imaging with cutting-edge artificial intelligence 
            to provide instant, accurate knee injury detection and analysis
          </p>

          {/* College Card */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl">
            <Building2 className="w-5 h-5 text-cyan-400" />
            <div className="text-left">
              <p className="text-xs text-gray-400">Institution</p>
              <p className="text-sm font-semibold text-cyan-300">
                Yeshwantrao Chavan College of Engineering, Nagpur
              </p>
            </div>
          </div>
        </div>

        {/* Guide Section */}
        {guide && (
          <div className="max-w-4xl mx-auto mb-16">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 text-purple-400" />
              <h2 className="text-3xl font-bold text-purple-300">Project Guide</h2>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-8 hover:border-purple-400 transition-all duration-300 hover:transform hover:scale-[1.02]">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/20">
                    <img
                      src={guide.avatar}
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-2 bg-purple-500 rounded-full">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold mb-2 text-purple-300">{guide.name}</h3>
                  <p className="text-gray-400 mb-3 text-sm uppercase tracking-wider font-semibold">
                    Project Guide & Mentor
                  </p>
                  <div className="flex items-center gap-2 justify-center md:justify-start text-gray-300">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <a
                      href={`mailto:${guide.email}`}
                      className="text-sm hover:text-purple-400 transition-colors"
                    >
                      {guide.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <UserCircle className="w-6 h-6 text-pink-400" />
            <h2 className="text-3xl font-bold text-pink-300">Project Team</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:transform hover:scale-105 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-pink-500/30 group-hover:border-pink-500/60 transition-all shadow-lg">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-pink-500 rounded-full">
                      <UserCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1 text-pink-300 group-hover:text-pink-400 transition-colors">
                    {student.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">
                    Team Member
                  </p>
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Mail className="w-4 h-4 text-pink-400" />
                    <a
                      href={`mailto:${student.email}`}
                      className="hover:text-pink-400 transition-colors truncate max-w-full"
                    >
                      {student.email}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Description */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-cyan-700/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-cyan-300">About This Project</h3>
            <p className="text-gray-300 leading-relaxed mb-4">
              This innovative project leverages state-of-the-art deep learning algorithms to analyze knee MRI scans 
              with remarkable precision. Our AI model can detect abnormalities, segment anatomical structures, and 
              provide instant diagnostic insights that traditionally require hours of expert analysis.
            </p>
            <p className="text-gray-300 leading-relaxed">
              By making advanced medical imaging accessible and understandable, we're bridging the gap between 
              complex diagnostic technology and patient care. Our mission is to empower both medical professionals 
              and patients with tools that provide clarity, speed, and confidence in knee health assessment.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>© 2024-25 YCCE, Nagpur | AI-Powered Knee MRI Analysis System</p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}