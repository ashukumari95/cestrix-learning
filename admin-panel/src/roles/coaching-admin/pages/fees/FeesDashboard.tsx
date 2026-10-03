import React, { useState, useEffect, useMemo } from 'react';
import api from '../../../../api';
import { Plus, Search, Receipt, AlertCircle, CheckCircle2, Clock, IndianRupee, TrendingUp, Calendar } from 'lucide-react';

export const FeesDashboard = () => {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isStructureModalOpen, setStructureModalOpen] = useState(false);
  const [newStructure, setNewStructure] = useState({ name: '', amount: '' });

  const [isAssignModalOpen, setAssignModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [assignForm, setAssignForm] = useState({
    studentId: '',
    feeStructureId: '',
    totalAmount: '',
    installments: [{ amount: '', dueDate: '' }]
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'structures'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [structuresRes, feesRes, studentsRes] = await Promise.all([
        api.get('/coaching/fees/structures'),
        api.get('/coaching/fees/student-fees'),
        api.get('/coaching/users/students')
      ]);
      setFeeStructures(structuresRes.data);
      setStudentFees(feesRes.data);
      setStudentsList(studentsRes.data);
    } catch (err) {
      console.error('Failed to fetch fee data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/coaching/fees/structures', {
        name: newStructure.name,
        amount: Number(newStructure.amount)
      });
      setStructureModalOpen(false);
      setNewStructure({ name: '', amount: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating structure', err);
    }
  };

  const handleRecordPayment = async (installmentId: string, amount: number) => {
    const promptStr = window.prompt(`Enter amount to record for this installment (Expected: ₹${amount}):`, String(amount));
    if (!promptStr) return;
    try {
      await api.post('/coaching/fees/payment', {
        installmentId,
        amount: Number(promptStr)
      });
      fetchData();
    } catch (err) {
      alert('Failed to record payment');
    }
  };

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.studentId || !assignForm.feeStructureId) return alert('Select student and structure');
    
    try {
      await api.post('/coaching/fees/assign', {
        studentId: assignForm.studentId,
        feeStructureId: assignForm.feeStructureId,
        totalAmount: Number(assignForm.totalAmount),
        installments: assignForm.installments.map(inst => ({
          amount: Number(inst.amount),
          dueDate: new Date(inst.dueDate).toISOString()
        }))
      });
      setAssignModalOpen(false);
      setAssignForm({
        studentId: '', feeStructureId: '', totalAmount: '', installments: [{ amount: '', dueDate: '' }]
      });
      fetchData();
    } catch (err) {
      console.error('Failed to assign fee', err);
      alert('Failed to assign fee');
    }
  };

  const addInstallmentField = () => {
    setAssignForm(prev => ({
      ...prev,
      installments: [...prev.installments, { amount: '', dueDate: '' }]
    }));
  };

  const { totalPending, totalCollected, upcomingDues } = useMemo(() => {
    let pending = 0;
    let collected = 0;
    let upcoming = 0;
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    studentFees.forEach(fee => {
      fee.installments.forEach((inst: any) => {
        const paid = inst.payments.reduce((sum: number, p: any) => sum + Number(p.amountPaid), 0);
        collected += paid;
        
        const dueAmount = Number(inst.amount) - paid;
        if (dueAmount > 0) {
          pending += dueAmount;
          
          const dueDate = new Date(inst.dueDate);
          if (dueDate >= now && dueDate <= nextWeek) {
            upcoming += dueAmount;
          }
        }
      });
    });

    return { totalPending: pending, totalCollected: collected, upcomingDues: upcoming };
  }, [studentFees]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Fees Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fees & Payments</h1>
          <p className="text-gray-500">Track pending fees, manage structures, and record payments.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Assign Fee
          </button>
          <button
            onClick={() => setStructureModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Fee Structure
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Collected</p>
            <h3 className="text-3xl font-black text-gray-900">₹{totalCollected.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-emerald-50 rounded-xl">
            <IndianRupee className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Pending</p>
            <h3 className="text-3xl font-black text-red-600">₹{totalPending.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Upcoming Dues (7 days)</p>
            <h3 className="text-3xl font-black text-orange-600">₹{upcomingDues.toLocaleString()}</h3>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl">
            <Calendar className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Student Fees & Payments
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'structures'
              ? 'border-brand-500 text-brand-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Fee Structures
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-900">Student Fee Records</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Fee Structure</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Installments</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {studentFees
                  .filter(fee => 
                    fee.student?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    fee.student?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No student fee records found.</td>
                  </tr>
                ) : (
                  studentFees
                    .filter(fee => 
                      fee.student?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      fee.student?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map(fee => (
                    <tr key={fee.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{fee.student?.user?.name}</div>
                        <div className="text-xs text-gray-500">{fee.student?.user?.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {fee.feeStructure?.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        ₹{Number(fee.totalAmount).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-2">
                          {fee.installments.map((inst: any) => {
                            const paid = inst.payments.reduce((sum: number, p: any) => sum + Number(p.amountPaid), 0);
                            const amount = Number(inst.amount);
                            const status = inst.status;
                            return (
                              <div key={inst.id} className="flex items-center justify-between gap-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                  {status === 'PAID' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-orange-500" />}
                                  <div>
                                    <div className="text-xs font-medium text-gray-900">₹{amount}</div>
                                    <div className="text-[10px] text-gray-500">Due: {new Date(inst.dueDate).toLocaleDateString()}</div>
                                  </div>
                                </div>
                                {status !== 'PAID' ? (
                                  <button
                                    onClick={() => handleRecordPayment(inst.id, amount - paid)}
                                    className="text-xs font-medium text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-1 rounded"
                                  >
                                    Pay ₹{amount - paid}
                                  </button>
                                ) : (
                                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Paid</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-brand-600 hover:text-brand-800 text-sm font-medium flex items-center gap-1">
                          <Receipt className="w-4 h-4" /> Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feeStructures.map(structure => (
            <div key={structure.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                  <Receipt className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">₹{Number(structure.amount).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{structure.name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-900">{structure._count?.students || 0}</span>
                <span>Students assigned</span>
              </div>
            </div>
          ))}
          {feeStructures.length === 0 && (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <h3 className="text-gray-900 font-medium">No Fee Structures</h3>
              <p className="text-gray-500 text-sm mt-1">Create your first fee structure to start collecting payments.</p>
            </div>
          )}
        </div>
      )}

      {/* Create Structure Modal */}
      {isStructureModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">New Fee Structure</h2>
              <p className="text-sm text-gray-500 mt-1">Define a standard fee package for your courses.</p>
            </div>
            <form onSubmit={handleCreateStructure} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Structure Name</label>
                <input
                  type="text"
                  required
                  value={newStructure.name}
                  onChange={e => setNewStructure({...newStructure, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g. Class 11 PCM Full Year"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={newStructure.amount}
                  onChange={e => setNewStructure({...newStructure, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="45000"
                />
              </div>
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>You can define custom installments later when assigning this structure to individual students.</p>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setStructureModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
                >
                  Create Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Fee Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Assign Fee to Student</h2>
              <p className="text-sm text-gray-500 mt-1">Select a student and define their fee structure and installments.</p>
            </div>
            <form onSubmit={handleAssignFee} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                  <select
                    required
                    value={assignForm.studentId}
                    onChange={e => setAssignForm({...assignForm, studentId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Select Student --</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.studentProfile?.id || s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fee Structure</label>
                  <select
                    required
                    value={assignForm.feeStructureId}
                    onChange={e => {
                      const str = feeStructures.find(f => f.id === e.target.value);
                      setAssignForm({
                        ...assignForm, 
                        feeStructureId: e.target.value,
                        totalAmount: str ? String(str.amount) : '',
                        installments: str ? [{ amount: String(str.amount), dueDate: '' }] : [{ amount: '', dueDate: '' }]
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">-- Select Structure --</option>
                    {feeStructures.map(s => (
                      <option key={s.id} value={s.id}>{s.name} (₹{Number(s.amount).toLocaleString()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Agreed Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={assignForm.totalAmount}
                  onChange={e => setAssignForm({...assignForm, totalAmount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Installment Plan</label>
                  <button type="button" onClick={addInstallmentField} className="text-xs text-brand-600 font-medium hover:underline">
                    + Add Installment
                  </button>
                </div>
                <div className="space-y-3">
                  {assignForm.installments.map((inst, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <input
                          type="number"
                          required
                          placeholder="Amount"
                          value={inst.amount}
                          onChange={e => {
                            const newInst = [...assignForm.installments];
                            newInst[index].amount = e.target.value;
                            setAssignForm({...assignForm, installments: newInst});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="date"
                          required
                          value={inst.dueDate}
                          onChange={e => {
                            const newInst = [...assignForm.installments];
                            newInst[index].dueDate = e.target.value;
                            setAssignForm({...assignForm, installments: newInst});
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      {assignForm.installments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newInst = assignForm.installments.filter((_, i) => i !== index);
                            setAssignForm({...assignForm, installments: newInst});
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3 justify-end border-t border-gray-100 mt-4">
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
                >
                  Assign Fee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
