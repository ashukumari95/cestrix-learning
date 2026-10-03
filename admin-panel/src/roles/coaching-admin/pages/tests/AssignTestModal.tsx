import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../../../../api';

interface Batch {
  id: string;
  name: string;
  classLevel: { name: string };
  branch: { name: string };
}

interface AssignTestModalProps {
  testId: string;
  testTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignTestModal: React.FC<AssignTestModalProps> = ({ testId, testTitle, onClose, onSuccess }) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/coaching/academic/batches');
      setBatches(res.data);
    } catch (err) {
      console.error('Failed to fetch batches', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleBatch = (id: string) => {
    setSelectedBatchIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleAssign = async () => {
    if (selectedBatchIds.length === 0) {
      alert('Please select at least one batch');
      return;
    }
    
    setAssigning(true);
    try {
      await api.post(`/coaching/tests/${testId}/assign`, {
        batchIds: selectedBatchIds,
        startDate: startDate || null,
        endDate: endDate || null
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to assign test', err);
      alert('Failed to assign test');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assign Test</h2>
            <p className="text-sm text-gray-500 mt-1">{testTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Date Picker */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Batches</label>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading batches...</div>
            ) : batches.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">No batches found</div>
            ) : (
              <div className="space-y-2">
                {batches.map(batch => (
                  <div 
                    key={batch.id} 
                    onClick={() => toggleBatch(batch.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBatchIds.includes(batch.id) 
                        ? 'border-brand-500 bg-brand-50' 
                        : 'border-gray-100 hover:border-brand-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">{batch.name}</h4>
                      <p className="text-xs text-gray-500">{batch.classLevel?.name} • {batch.branch?.name}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedBatchIds.includes(batch.id) ? 'bg-brand-500 border-brand-500' : 'border-gray-300'
                    }`}>
                      {selectedBatchIds.includes(batch.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleAssign}
            disabled={assigning || selectedBatchIds.length === 0}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {assigning ? 'Assigning...' : 'Assign Test'}
          </button>
        </div>

      </div>
    </div>
  );
};
