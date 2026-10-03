import React, { useState } from 'react';
import { X, Upload, FileText, Download } from 'lucide-react';
import Papa from 'papaparse';
import api from '../../../../api';

interface BulkImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,text,difficulty,type,marks,option1,option2,option3,option4,correctOption,tags\n" +
      "\"What is 2+2?\",EASY,MULTIPLE_CHOICE,4,\"3\",\"4\",\"5\",\"6\",2,\"math,basic\"\n" +
      "\"Explain Newton's First Law.\",MEDIUM,SUBJECTIVE,5,,,,,,physics";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "question_import_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const processImport = () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setImporting(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const questions = results.data.map((row: any) => {
            const options = [];
            if (row.option1) options.push({ text: row.option1, isCorrect: parseInt(row.correctOption) === 1 });
            if (row.option2) options.push({ text: row.option2, isCorrect: parseInt(row.correctOption) === 2 });
            if (row.option3) options.push({ text: row.option3, isCorrect: parseInt(row.correctOption) === 3 });
            if (row.option4) options.push({ text: row.option4, isCorrect: parseInt(row.correctOption) === 4 });
            
            return {
              text: row.text,
              difficulty: row.difficulty?.toUpperCase() || 'MEDIUM',
              type: row.type?.toUpperCase() || 'MULTIPLE_CHOICE',
              marks: parseFloat(row.marks) || 1,
              tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
              options: options.length > 0 ? options : undefined
            };
          });

          const res = await api.post('/coaching/questions/bulk', { questions });
          alert(`Successfully imported ${res.data.count} questions.`);
          onSuccess();
        } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.error || 'Failed to import questions. Check your format.');
        } finally {
          setImporting(false);
        }
      },
      error: (err) => {
        setError('Failed to parse CSV: ' + err.message);
        setImporting(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Bulk Import Questions</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3">
            <FileText className="w-5 h-5 mt-0.5 text-blue-600" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Import Guidelines</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Upload a CSV file containing your questions.</li>
                <li>Ensure column headers exactly match the template.</li>
                <li>Tags can be comma-separated inside quotes (e.g. "physics, kinematics").</li>
              </ul>
              <button 
                onClick={handleDownloadTemplate}
                className="mt-3 flex items-center gap-1 text-blue-600 font-medium hover:underline"
              >
                <Download className="w-4 h-4" /> Download Template CSV
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="hidden" 
                id="file-upload" 
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                {file ? (
                  <span className="font-medium text-brand-600">{file.name}</span>
                ) : (
                  <>
                    <span className="font-medium text-gray-900">Click to upload</span>
                    <span className="text-sm text-gray-500">CSV file up to 5MB</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button 
            onClick={processImport}
            disabled={!file || importing}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {importing ? 'Importing...' : 'Start Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
