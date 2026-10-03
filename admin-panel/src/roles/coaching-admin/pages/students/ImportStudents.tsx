import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UploadCloud, FileSpreadsheet, CheckCircle } from 'lucide-react';

export const ImportStudents = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'IDLE' | 'UPLOADING' | 'SUCCESS' | 'ERROR'>('IDLE');

  const handleUpload = () => {
    if (!file) return;
    setStatus('UPLOADING');
    setTimeout(() => {
      setStatus('SUCCESS');
    }, 2000);
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4 border-b pb-4 border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-[#0d1b3e]">Bulk Import Students</h1>
          <p className="text-sm text-gray-500 mt-1">Upload an Excel (.xlsx) or CSV file to import multiple students at once.</p>
        </div>
      </div>

      <div className="cx-card bg-white p-8 border border-gray-200 text-center">
        
        {status === 'SUCCESS' ? (
          <div className="py-12 cx-animate-in">
            <CheckCircle size={64} className="mx-auto text-emerald-500 mb-4" />
            <h2 className="text-2xl font-black text-[#0d1b3e] mb-2">Import Successful!</h2>
            <p className="text-gray-500 mb-8">42 students have been successfully imported into the system.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => navigate('/students')} className="cx-btn-secondary px-6">View Students</button>
              <button onClick={() => { setFile(null); setStatus('IDLE'); }} className="cx-btn-primary px-6" style={{ background: '#1a5dc9' }}>Upload Another File</button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-left">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-blue-100">
                  <FileSpreadsheet size={20} className="text-[#1a5dc9]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Need the exact format?</h3>
                  <p className="text-xs text-gray-500">Download our sample template with predefined columns.</p>
                </div>
              </div>
              <button className="text-xs font-bold text-[#1a5dc9] hover:underline px-4 py-2 bg-white border border-blue-200 rounded-lg shadow-sm">
                Download Template
              </button>
            </div>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 hover:bg-gray-50 hover:border-[#1a5dc9] transition-all cursor-pointer relative group">
              <input 
                type="file" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <UploadCloud size={48} className="mx-auto text-gray-400 group-hover:text-[#1a5dc9] mb-4 transition-colors" />
              
              {file ? (
                <div>
                  <p className="text-lg font-bold text-[#0d1b3e]">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500 mt-1">XLSX, XLS, or CSV (max. 10MB)</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <button onClick={() => navigate(-1)} className="cx-btn-secondary px-6">Cancel</button>
              
              <button 
                onClick={handleUpload}
                disabled={!file || status === 'UPLOADING'}
                className="cx-btn-primary px-8 flex items-center gap-2"
                style={{ background: !file ? '#d1d5db' : '#1a5dc9' }}
              >
                {status === 'UPLOADING' ? 'Importing Data...' : 'Import Students'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
