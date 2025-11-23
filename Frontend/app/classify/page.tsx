'use client';

import { useState, useEffect } from 'react';
import { Loader2, Brain, CheckCircle, AlertCircle, FileText, Download, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ANALYSIS_MESSAGES = [
  "Initializing neural network...",
  "Loading knee MRI classification model...",
  "Analyzing structural patterns...",
  "Detecting anomalies and injuries...",
  "Comparing with normal knee anatomy...",
  "Evaluating ACL and meniscus integrity...",
  "Processing deep learning predictions...",
  "Finalizing classification results..."
];

export default function ClassifyPage() {
  const router = useRouter();
  const [isClassifying, setIsClassifying] = useState(true);
  const [classificationResult, setClassificationResult] = useState<'normal' | 'abnormal' | null>(null);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [confidence, setConfidence] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    // Get filename from session storage
    const storedFileName = sessionStorage.getItem('uploadedFileName');
    setFileName(storedFileName || 'MRI Scan');

    // Cycle through analysis messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 2000);

    // Simulate classification API call
    const classifyTimeout = setTimeout(async () => {
      try {
        // TODO: Replace with actual API call
        // const res = await fetch('http://localhost:8000/classify', {
        //   method: 'POST',
        //   body: formData,
        // });
        // const data = await res.json();
        
        // Simulated result for demo
        const mockResult = Math.random() > 0.5 ? 'normal' : 'abnormal';
        const mockConfidence = Math.floor(Math.random() * 15) + 85; // 85-100%
        
        setClassificationResult(mockResult);
        setConfidence(mockConfidence);
      } catch (error) {
        console.error('Classification error:', error);
      } finally {
        clearInterval(messageInterval);
        setIsClassifying(false);
      }
    }, 16000); // 16 seconds for demo

    return () => {
      clearInterval(messageInterval);
      clearTimeout(classifyTimeout);
    };
  }, []);

  const handleViewReport = () => {
    // Generate and view detailed report
    alert('Detailed report viewer coming soon!');
  };

  const handleDownloadReport = () => {
    // Download PDF report
    window.print();
  };

  const handleConnectDoctor = () => {
    router.push('/contact');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Classification Analysis
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced deep learning for knee injury detection
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Loading State */}
          {isClassifying && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700 shadow-2xl">
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <Brain className="w-14 h-14 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2 text-purple-300">
                    AI Analysis in Progress
                  </h2>
                  <p className="text-xl text-gray-300 mb-4">
                    {ANALYSIS_MESSAGES[currentMessage]}
                  </p>
                  <p className="text-sm text-gray-400">
                    Analyzing: {fileName}
                  </p>
                </div>
                
                {/* Progress Dots */}
                <div className="flex gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        i === currentMessage ? 'bg-purple-400 scale-125' : 'bg-gray-600'
                      }`}
                    ></div>
                  ))}
                </div>

                <div className="w-full max-w-md bg-gray-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${((currentMessage + 1) / 8) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Results State */}
          {!isClassifying && classificationResult && (
            <div className="space-y-6">
              {/* Result Card */}
              <div className={`backdrop-blur-sm rounded-2xl p-8 border shadow-2xl ${
                classificationResult === 'normal'
                  ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/50'
                  : 'bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-700/50'
              }`}>
                <div className="flex items-center gap-4 mb-6">
                  {classificationResult === 'normal' ? (
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-red-400" />
                  )}
                  <div>
                    <h2 className="text-3xl font-bold">
                      Classification Result
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Analysis completed for {fileName}</p>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Diagnosis</p>
                      <p className={`text-4xl font-bold ${
                        classificationResult === 'normal' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {classificationResult === 'normal' ? 'NORMAL' : 'ABNORMAL'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Confidence Level</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-bold text-blue-400">{confidence}%</p>
                        <p className="text-gray-400 mb-1">accurate</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    Interpretation
                  </h3>
                  {classificationResult === 'normal' ? (
                    <p className="text-gray-300 leading-relaxed">
                      The AI analysis indicates that the knee structure appears <span className="text-green-400 font-semibold">normal</span> with no significant signs of ACL tears, meniscus damage, or other ligament injuries. However, we recommend consulting with a specialist for a comprehensive evaluation if you experience any symptoms.
                    </p>
                  ) : (
                    <p className="text-gray-300 leading-relaxed">
                      The AI analysis has detected <span className="text-red-400 font-semibold">abnormalities</span> that may indicate potential ACL tear, meniscus damage, or other knee injuries. We strongly recommend scheduling an appointment with our knee specialists for proper diagnosis and treatment planning.
                    </p>
                  )}
                </div>

                {/* Recommendations */}
                {classificationResult === 'abnormal' && (
                  <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-6">
                    <h3 className="font-semibold text-lg mb-3 text-orange-400">
                      Recommended Actions
                    </h3>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        Schedule an appointment with a knee specialist immediately
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        Avoid strenuous physical activities until consultation
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        Bring your MRI scans and this report to your appointment
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                        Consider getting a second opinion for major treatment decisions
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={handleViewReport}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View Report
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50"
                >
                  <Download className="w-5 h-5" />
                  Download Report
                </button>
                <button
                  onClick={handleConnectDoctor}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
                >
                  <MapPin className="w-5 h-5" />
                  Connect with Doctor
                </button>
              </div>

              {/* Disclaimer */}
              <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-4">
                <p className="text-xs text-gray-400 text-center">
                  <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with qualified healthcare professionals for accurate diagnosis and treatment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}