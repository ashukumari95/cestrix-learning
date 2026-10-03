import React, { useState } from 'react';
import {
  Search, Filter, MoreVertical, Eye, MessageSquare, Download,
  Users, Smartphone, ShieldCheck, AlertCircle, X, ChevronLeft, ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../../api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Parent {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email: string;
  initials: string;
  appStatus: 'ACTIVE' | 'INVITED' | 'INACTIVE';
  lastLogin: string;
  students: { name: string; class: string; batch: string }[];
}



const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  INVITED:  'bg-blue-50 text-blue-700 border-blue-200',
  INACTIVE: 'bg-gray-100 text-gray-600 border-gray-200',
};

const AVATAR_COLORS = [
  'linear-gradient(135deg,#1a5dc9,#0e3578)',
  'linear-gradient(135deg,#cc2529,#a81e22)',
  'linear-gradient(135deg,#f5a623,#d97706)',
];

export const ParentList = () => {
  const navigate = useNavigate();
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage]                 = useState(1);
  const [parents, setParents]           = useState<Parent[]>([]);
  const [loading, setLoading]           = useState(true);
  const PER_PAGE = 8;

  React.useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await api.get('/coaching/users/parents');
        const data = res.data.data?.items || res.data || [];
        if (Array.isArray(data)) {
          const mapped: Parent[] = data.map((u: any) => ({
            id: u.id,
            name: u.name,
            relation: 'Guardian',
            phone: u.phone || 'N/A',
            email: u.email || 'N/A',
            initials: u.name ? u.name.substring(0, 2).toUpperCase() : 'PR',
            appStatus: (u.isActive ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INVITED' | 'INACTIVE',
            lastLogin: 'Never',
            students: []
          }));
          setParents(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchParents();
  }, []);

  const filtered = parents.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.phone.includes(q);
    const matchStatus  = filterStatus  === 'ALL' || p.appStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // KPIs
  const total   = parents.length;
  const active  = parents.filter(p => p.appStatus === 'ACTIVE').length;
  const invited = parents.filter(p => p.appStatus === 'INVITED').length;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="cx-animate-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>
            Parents & Guardians
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} of {total} accounts · Monitor app adoption and communication
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="cx-btn-secondary text-xs gap-1.5">
            <Download size={14} /> Export List
          </button>
          <button className="cx-btn-primary text-xs gap-1.5 px-4" style={{ background: '#059669', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' }}>
            <MessageSquare size={14} /> Broadcast Message
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="cx-animate-in grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Total Parents', value: total,   icon: Users,      color: '#1a5dc9', bg: '#e8f0fb' },
          { label: 'Active on App', value: active,  icon: Smartphone, color: '#059669', bg: '#ecfdf5' },
          { label: 'Pending Invite',value: invited, icon: AlertCircle,color: '#f5a623', bg: '#fffbeb' },
        ].map((k, i) => (
          <div key={i} className="cx-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: k.bg }}>
              <k.icon size={16} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-medium">{k.label}</p>
              <p className="text-xl font-black" style={{ color: '#0d1b3e' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="cx-card cx-animate-in-2 overflow-hidden">
        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b" style={{ borderColor: '#dce8f7' }}>
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              type="text"
              placeholder="Search parent name or phone…"
              className="cx-input pl-9 text-xs w-full"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={13} className="text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 font-semibold pl-2">App Status:</span>
            {['ALL','ACTIVE','INVITED','INACTIVE'].map(s => (
              <button key={s} onClick={() => { setFilterStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                  filterStatus === s ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
                style={filterStatus === s ? { background: '#1a5dc9' } : {}}>
                {s === 'ALL' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-widest font-bold text-gray-400 border-b"
                style={{ background: '#f7faff', borderColor: '#dce8f7' }}>
                <th className="px-4 py-3 pl-6">Guardian Details</th>
                <th className="px-4 py-3">Linked Students</th>
                <th className="px-4 py-3">App Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#f0f4fa' }}>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <p className="text-sm font-semibold text-gray-500">Loading...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <p className="text-sm font-semibold text-gray-500">No records found</p>
                  </td>
                </tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} onClick={() => navigate(`/parents/${p.id}`)} className="group transition-colors hover:bg-blue-50/30 cursor-pointer">
                  {/* Guardian */}
                  <td className="px-4 py-3.5 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                        style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                        {p.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate flex items-center gap-1.5" style={{ color: '#0d1b3e' }}>
                          {p.name}
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 tracking-wider">
                            {p.relation.toUpperCase()}
                          </span>
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{p.phone} • {p.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Students */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-2">
                      {p.students.map((st, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: '#e8f0fb' }}>
                            <GraduationCap size={12} style={{ color: '#1a5dc9' }} />
                          </div>
                          <div>
                            <p className="text-xs font-bold" style={{ color: '#0d1b3e' }}>{st.name}</p>
                            <p className="text-[10px] text-gray-400">Class {st.class} · {st.batch}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${STATUS_STYLE[p.appStatus]}`}>
                      {p.appStatus === 'ACTIVE' && <ShieldCheck size={12} />}
                      {p.appStatus}
                    </span>
                    {p.appStatus === 'INVITED' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await api.post(`/coaching/users/${p.id}/invite`);
                            alert('Invite sent successfully!');
                          } catch (err) {
                            alert('Failed to send invite.');
                          }
                        }}
                        className="block mt-1.5 text-[10px] font-bold text-blue-600 hover:underline">
                        Resend Link
                      </button>
                    )}
                  </td>

                  {/* Last Login */}
                  <td className="px-4 py-3.5">
                    <p className="text-xs font-medium text-gray-700">{p.lastLogin}</p>
                  </td>

                  {/* Actions */}
                  <td className="px-4 pr-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded-lg transition-all hover:bg-green-100" title="WhatsApp">
                        <MessageSquare size={14} style={{ color: '#25d366' }} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/parents/${p.id}`); }}
                        className="p-1.5 rounded-lg transition-all hover:bg-blue-100" 
                        title="View Profile"
                      >
                        <Eye size={14} style={{ color: '#1a5dc9' }} />
                      </button>
                      <button className="p-1.5 rounded-lg transition-all hover:bg-gray-100" title="More">
                        <MoreVertical size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3.5 flex items-center justify-between border-t" style={{ borderColor: '#dce8f7', background: '#f7faff' }}>
          <p className="text-[11px] text-gray-500">
            Showing <span className="font-bold text-gray-800">{filtered.length > 0 ? (page - 1) * PER_PAGE + 1 : 0}</span>–<span className="font-bold text-gray-800">{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="font-bold text-gray-800">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 transition-all hover:border-blue-300 disabled:opacity-40">
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 transition-all hover:border-blue-300 disabled:opacity-40">
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
