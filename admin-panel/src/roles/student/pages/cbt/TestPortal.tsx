import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Info, CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

// Mock Data
const MOCK_QUESTIONS = [
  {
    id: 1,
    subject: "Physics",
    text: "A particle is moving in a circular path of radius r. The displacement after half a circle would be:",
    options: ["Zero", "πr", "2r", "2πr"],
  },
  {
    id: 2,
    subject: "Physics",
    text: "The dimensional formula for gravitational constant is:",
    options: ["[M^-1 L^3 T^-2]", "[M L^2 T^-2]", "[M L^-1 T^-2]", "[M^-1 L^2 T^-2]"],
  },
  {
    id: 3,
    subject: "Chemistry",
    text: "Which of the following is not a noble gas?",
    options: ["Helium", "Neon", "Argon", "Nitrogen"],
  },
  {
    id: 4,
    subject: "Mathematics",
    text: "If the roots of the equation x^2 - 5x + 6 = 0 are α and β, then α + β is:",
    options: ["5", "6", "-5", "-6"],
  }
];

export const TestPortal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<Record<number, 'not_visited' | 'not_answered' | 'answered' | 'marked' | 'answered_marked'>>({});
  
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour

  // Initialize status
  useEffect(() => {
    const initialStatus: Record<number, any> = {};
    MOCK_QUESTIONS.forEach((_, idx) => {
      initialStatus[idx] = 'not_visited';
    });
    initialStatus[0] = 'not_answered'; // First question is visited
    setStatus(initialStatus);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option: string) => {
    setAnswers({ ...answers, [currentQuestionIdx]: option });
  };

  const handleSaveAndNext = () => {
    const newStatus = { ...status };
    if (answers[currentQuestionIdx]) {
      newStatus[currentQuestionIdx] = 'answered';
    } else {
      newStatus[currentQuestionIdx] = 'not_answered';
    }
    
    setStatus(newStatus);
    goToQuestion(currentQuestionIdx + 1);
  };

  const handleMarkForReview = () => {
    const newStatus = { ...status };
    if (answers[currentQuestionIdx]) {
      newStatus[currentQuestionIdx] = 'answered_marked';
    } else {
      newStatus[currentQuestionIdx] = 'marked';
    }
    
    setStatus(newStatus);
    goToQuestion(currentQuestionIdx + 1);
  };

  const handleClearResponse = () => {
    const newAnswers = { ...answers };
    delete newAnswers[currentQuestionIdx];
    setAnswers(newAnswers);
    
    const newStatus = { ...status };
    newStatus[currentQuestionIdx] = 'not_answered';
    setStatus(newStatus);
  };

  const goToQuestion = (idx: number) => {
    if (idx >= 0 && idx < MOCK_QUESTIONS.length) {
      const newStatus = { ...status };
      if (newStatus[idx] === 'not_visited') {
        newStatus[idx] = 'not_answered';
      }
      setStatus(newStatus);
      setCurrentQuestionIdx(idx);
    }
  };

  const handleSubmitTest = () => {
    if (window.confirm("Are you sure you want to submit the test?")) {
      navigate('/student/results/mock-1'); // Redirect to mock result
    }
  };

  const currentQ = MOCK_QUESTIONS[currentQuestionIdx];

  const getStatusColor = (idx: number) => {
    const s = status[idx];
    switch (s) {
      case 'answered': return 'bg-emerald-500 text-white';
      case 'not_answered': return 'bg-red-500 text-white';
      case 'marked': return 'bg-purple-500 text-white';
      case 'answered_marked': return 'bg-purple-500 text-white border-2 border-emerald-500';
      default: return 'bg-slate-200 text-slate-700'; // not visited
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white p-3 flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 px-3 py-1.5 rounded font-bold text-sm">
            JEE Mains Mock Test 4
          </div>
          <div className="hidden md:block text-slate-300 text-sm">
            Candidate: Student User
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-mono font-bold text-lg tracking-wider text-emerald-400">
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={handleSubmitTest}
            className="bg-indigo-500 hover:bg-indigo-600 px-4 py-1.5 rounded font-semibold transition-colors"
          >
            Submit Test
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200">
          {/* Question Header */}
          <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">
              Question {currentQuestionIdx + 1}
            </h2>
            <div className="px-3 py-1 bg-slate-100 rounded text-sm font-medium text-slate-600 border border-slate-200">
              Section: {currentQ.subject}
            </div>
          </div>

          {/* Question Body */}
          <div className="flex-1 overflow-auto p-6 bg-white">
            <div className="prose max-w-none mb-8">
              <p className="text-lg text-slate-800 leading-relaxed font-medium">
                {currentQ.text}
              </p>
            </div>

            <div className="space-y-3 max-w-2xl">
              {currentQ.options.map((opt, i) => {
                const isSelected = answers[currentQuestionIdx] === opt;
                return (
                  <label 
                    key={i} 
                    className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name={`q-${currentQuestionIdx}`} 
                      value={opt}
                      checked={isSelected}
                      onChange={() => handleSelectOption(opt)}
                      className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <span className="ml-4 text-slate-700">{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center flex-wrap gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex gap-2">
              <button 
                onClick={handleMarkForReview}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded font-medium transition-colors"
              >
                Mark for Review & Next
              </button>
              <button 
                onClick={handleClearResponse}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200 font-medium transition-colors"
              >
                Clear Response
              </button>
            </div>
            
            <button 
              onClick={handleSaveAndNext}
              className="px-8 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              Save & Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar - Question Palette */}
        <div className="w-80 bg-slate-50 flex flex-col">
          {/* Status Legend */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-emerald-500 text-white flex items-center justify-center">1</div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center">2</div> Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center">3</div> Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded bg-purple-500 text-white flex items-center justify-center">4</div> Marked</div>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="flex-1 overflow-auto p-4">
            <h3 className="font-semibold text-slate-800 mb-4 px-1">Question Palette</h3>
            <div className="grid grid-cols-4 gap-2">
              {MOCK_QUESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToQuestion(idx)}
                  className={`
                    w-12 h-12 rounded-lg font-semibold text-sm transition-transform hover:scale-105 active:scale-95 shadow-sm
                    ${getStatusColor(idx)}
                    ${currentQuestionIdx === idx ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
