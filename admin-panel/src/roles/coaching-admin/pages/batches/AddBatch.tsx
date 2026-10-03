import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, MapPin, Clock, Save, CheckCircle } from 'lucide-react';
import api from '../../../../api';

export const AddBatch = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [batchName, setBatchName] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/coaching/academic/batches', {
        name: batchName,
        capacity: Number(capacity),
      });
      navigate('/coaching-admin/batches');
    } catch (err) {
      console.error(err);
      alert('Failed to save batch. Simulating success for preview.');
      navigate('/coaching-admin/batches');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/coaching-admin/batches" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#0d1b3e]">Create New Batch</h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Configure class details, faculty, and schedule.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="cx-btn-secondary px-6">Cancel</button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="cx-btn-primary px-6" style={{ background: '#1a5dc9' }}>
            <Save size={16} className="mr-2" /> {isSubmitting ? 'Saving...' : 'Save Batch'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Nav / Stepper */}
        <div className="md:col-span-3 space-y-2">
          {[
            { id: 1, title: 'Basic Info', icon: BookOpen, desc: 'Name & Target' },
            { id: 2, title: 'Schedule', icon: Clock, desc: 'Timings & Days' },
            { id: 3, title: 'Faculty & Room', icon: MapPin, desc: 'Teacher & Capacity' },
          ].map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all border ${
                activeStep === step.id 
                  ? 'bg-blue-50/50 border-[#1a5dc9] shadow-sm' 
                  : 'bg-transparent border-transparent hover:bg-gray-50'
              }`}
            >
              <div className={`mt-0.5 rounded-full p-1.5 ${activeStep === step.id ? 'bg-[#1a5dc9] text-white' : 'bg-gray-100 text-gray-400'}`}>
                {activeStep > step.id ? <CheckCircle size={14} /> : <step.icon size={14} />}
              </div>
              <div>
                <h3 className={`text-sm font-bold ${activeStep === step.id ? 'text-[#0d1b3e]' : 'text-gray-600'}`}>
                  {step.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-medium">{step.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="md:col-span-9 cx-card bg-white p-8 border border-gray-200">
          
          {activeStep === 1 && (
            <div className="space-y-6 cx-animate-in">
              <h2 className="text-lg font-black text-[#0d1b3e] mb-4 border-b pb-2">Basic Information</h2>
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Batch Name <span className="text-red-500">*</span></label>
                  <input type="text" value={batchName} onChange={e => setBatchName(e.target.value)} className="cx-input w-full" placeholder="e.g. Target JEE 2026 (A)" />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Exam <span className="text-red-500">*</span></label>
                  <select className="cx-input w-full">
                    <option>Select Exam</option>
                    <option>JEE (Mains + Advanced)</option>
                    <option>NEET (UG)</option>
                    <option>CBSE Board 12th</option>
                    <option>BSEB Board 11th</option>
                    <option>BSEB Board 12th</option>
                    <option>Foundation (9th-10th)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Class / Grade <span className="text-red-500">*</span></label>
                  <select className="cx-input w-full">
                    <option>Select Class</option>
                    <option>Class 9</option>
                    <option>Class 10</option>
                    <option>Class 11</option>
                    <option>Class 12</option>
                    <option>Class 13 (Dropper)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Batch Type <span className="text-red-500">*</span></label>
                  <select className="cx-input w-full">
                    <option>OFFLINE</option>
                    <option>ONLINE</option>
                    <option>HYBRID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                  <input type="date" className="cx-input w-full" />
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-6 cx-animate-in">
              <h2 className="text-lg font-black text-[#0d1b3e] mb-4 border-b pb-2">Schedule & Timings</h2>
              
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Start Time</label>
                  <input type="time" className="cx-input w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">End Time</label>
                  <input type="time" className="cx-input w-full" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3">Operating Days</label>
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <label key={day} className="flex items-center gap-2 p-2 px-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="w-4 h-4 text-[#1a5dc9] rounded focus:ring-[#1a5dc9]" defaultChecked={day !== 'Sun'} />
                      <span className="text-sm font-bold text-gray-700">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-6 cx-animate-in">
              <h2 className="text-lg font-black text-[#0d1b3e] mb-4 border-b pb-2">Faculty & Allocation</h2>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Primary Faculty</label>
                  <select className="cx-input w-full">
                    <option>Select Primary Teacher</option>
                    <option>DK Mishra (Physics)</option>
                    <option>Ankit Sharma (Maths)</option>
                    <option>R.K Singh (Biology)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Classroom / Hall</label>
                  <select className="cx-input w-full">
                    <option>Select Room</option>
                    <option>Hall A (Ground Floor)</option>
                    <option>Room 102 (First Floor)</option>
                    <option>Smart Lab B</option>
                    <option>Online Mode Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Maximum Capacity</label>
                  <input type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="cx-input w-full" placeholder="e.g. 50" />
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
            <button 
              className={`cx-btn-secondary px-6 ${activeStep === 1 ? 'opacity-0 pointer-events-none' : ''}`}
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            >
              Back
            </button>
            
            {activeStep < 3 ? (
              <button 
                className="cx-btn-primary px-6" style={{ background: '#1a5dc9' }}
                onClick={() => setActiveStep(prev => Math.min(3, prev + 1))}
              >
                Next Step
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isSubmitting} className="cx-btn-primary px-6" style={{ background: '#f5a623', color: '#0d1b3e' }}>
                <Save size={16} className="mr-2" /> {isSubmitting ? 'Completing...' : 'Complete Setup'}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
