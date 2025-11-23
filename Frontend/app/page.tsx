'use client';

import { useState, useEffect } from 'react';
import { Brain, Sparkles, ArrowRight, Info, Zap, TrendingUp, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ROTATING_MESSAGES = [
  "See your knee like never before",
  "AI-powered insights in seconds",
  "Your health, visualized beautifully",
  "Cutting-edge medical imaging",
  "Understanding made simple"
];

export default function HomePage() {
  const router = useRouter();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
        setIsVisible(true);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Info Icon */}
      <button
        onClick={() => router.push('/info')}
        className="absolute top-6 right-6 z-50 p-3 bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm border border-gray-700 rounded-full transition-all duration-300 hover:scale-110 group"
      >
        <Info className="w-6 h-6 text-gray-400 group-hover:text-purple-400 transition-colors" />
      </button>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* Logo/Brand Section */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <Brain className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            KNEE MRI
          </span>
          <br />
          <span className="text-5xl md:text-7xl text-gray-300">Report</span>
        </h1>

        {/* Tagline */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            Understand your MRI with AI
          </p>
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
        </div>

        {/* Rotating Message */}
        <div className="h-12 mb-12 flex items-center justify-center">
          <p
            className={`text-lg text-purple-300 transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
          >
            {ROTATING_MESSAGES[currentMessageIndex]}
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => router.push('/segment')}
          className="group relative px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-2xl font-bold text-xl transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 mb-16"
        >
          <span className="flex items-center gap-3">
            Start Analysis
            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </span>
        </button>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full mb-12">
          {/* Card 1 */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg">Lightning Fast</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Get your MRI analysis in seconds, not days. AI-powered speed meets medical precision.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-pink-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="font-semibold text-lg">AI-Powered</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Advanced neural networks trained on thousands of knee scans for accurate insights.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-cyan-500/20 rounded-lg">
                <Heart className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-lg">Easy to Understand</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Complex medical imaging simplified. See what matters without the medical jargon.
            </p>
          </div>
        </div>

        {/* Bottom Message */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-cyan-900/20 backdrop-blur-sm border border-purple-700/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-purple-300">
                  We're Constantly Improving
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Our AI gets smarter every day. We're bringing you the latest in medical imaging technology 
                  to help you understand your knee health better. More features, better accuracy, and 
                  deeper insights are on the way. Your journey to knee health starts here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl w-full">
          <div className="text-center">
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              99%
            </p>
            <p className="text-xs text-gray-400">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent mb-1">
              &lt;30s
            </p>
            <p className="text-xs text-gray-400">Analysis Time</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-1">
              24/7
            </p>
            <p className="text-xs text-gray-400">Available</p>
          </div>
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
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}