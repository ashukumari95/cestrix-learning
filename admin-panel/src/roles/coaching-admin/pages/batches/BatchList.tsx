import { useState, useEffect } from 'react';
import {
  Search, Plus, MoreVertical, Users, Clock, BookOpen, MapPin, Monitor, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../../api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Batch {
  id: string;
  name: string;
  className: string;
  timing: string;
  room: string;
  faculty: string;
  capacity: number;
  enrolled: number;
  status: 'ACTIVE' | 'INACTIVE';
  targetExam: string;
  type: 'OFFLINE' | 'ONLINE' | 'HYBRID';
}



const TYPE_STYLE: Record<string, { bg: string, text: string, icon: any }> = {
  OFFLINE: { bg: 'bg-blue-50', text: 'text-blue-700 border-blue-200', icon: MapPin },
  ONLINE:  { bg: 'bg-emerald-50', text: 'text-emerald-700 border-emerald-200', icon: Monitor },
  HYBRID:  { bg: 'bg-purple-50', text: 'text-purple-700 border-purple-200', icon: Users },
};

const EXAM_COLOR: Record<string, string> = {
  JEE:        '#1a5dc9',
  NEET:       '#059669',
  BOARD:      '#f5a623',
  FOUNDATION: '#9333ea',
};

export const BatchList = () => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await api.get('/coaching/academic/batches');
        if (response.data && response.data.length > 0) {
          const mapped = response.data.map((b: any) => ({
            id: b.id,
            name: b.name,
            className: b.classLevel?.name || 'Generic Class',
            timing: '10:00 AM - 12:00 PM', // Placeholder
            room: 'Room A', // Placeholder
            faculty: b.teachers?.[0]?.teacher?.user?.name || 'Unassigned',
            capacity: b.capacity || 50,
            enrolled: b.students?.length || 0,
            status: 'ACTIVE',
            targetExam: b.classLevel?.board?.name || 'BOARD',
            type: 'OFFLINE'
          }));
          setBatches(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch batches.", err);
      }
    };
    fetchBatches();
  }, []);

  const filtered = batches.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !q || b.name.toLowerCase().includes(q) || b.faculty.toLowerCase().includes(q);
    const matchType = filterType === 'ALL' || b.type === filterType;
    return matchSearch && matchType;
  });

  const totalCapacity = batches.reduce((acc, b) => acc + b.capacity, 0);
  const totalEnrolled = batches.reduce((acc, b) => acc + b.enrolled, 0);
  const fillRate = Math.round((totalEnrolled / totalCapacity) * 100) || 0;

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="cx-animate-in flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#0d1b3e' }}>
            Batch Management
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Manage classrooms, online sessions, faculty assignments, and capacity.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="add" className="cx-btn-primary text-xs px-4" style={{ background: '#1a5dc9', boxShadow: '0 4px 12px rgba(26,93,201,0.3)' }}>
            <Plus size={14} /> Create Batch
          </Link>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="cx-animate-in grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Batches', value: batches.length,  icon: BookOpen, color: '#1a5dc9', bg: '#e8f0fb' },
          { label: 'Total Capacity', value: totalCapacity,icon: Users,    color: '#059669', bg: '#ecfdf5' },
          { label: 'Total Enrolled', value: totalEnrolled,icon: Target,   color: '#f5a623', bg: '#fffbeb' },
          { label: 'Avg Fill Rate',  value: `${fillRate}%`, icon: Clock,   color: '#9333ea', bg: '#f3e8ff' },
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

      {/* Grid Area */}
      <div className="cx-card cx-animate-in-2 p-5 bg-gray-50/50">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="relative w-full max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Search batch or faculty..."
              className="cx-input pl-9 text-xs w-full bg-white"
            />
          </div>
          
          <div className="flex items-center gap-2 text-xs bg-white p-1 rounded-lg border shadow-sm" style={{ borderColor: '#dce8f7' }}>
            {['ALL','OFFLINE','ONLINE','HYBRID'].map(s => (
              <button key={s} onClick={() => setFilterType(s)}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  filterType === s ? 'text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
                }`}
                style={filterType === s ? { background: '#1a5dc9' } : {}}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Batches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm font-semibold text-gray-500">No batches match your criteria</p>
            </div>
          ) : filtered.map((b) => {
            const TypeIcon = TYPE_STYLE[b.type].icon;
            const fillPct = Math.round((b.enrolled / b.capacity) * 100);
            const isFull = b.enrolled >= b.capacity;

            return (
              <Link to={b.id} key={b.id} className="cx-card bg-white p-4 border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg group relative flex flex-col cursor-pointer block">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#1a5dc9] transition-colors line-clamp-1" title={b.name}>{b.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ background: EXAM_COLOR[b.targetExam] || '#1a5dc9' }}>
                        {b.targetExam}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500">{b.className}</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-xs text-gray-600 font-medium">
                    <Clock size={14} className="text-gray-400 mr-2" /> {b.timing}
                  </div>
                  <div className="flex items-center text-xs text-gray-600 font-medium">
                    <BookOpen size={14} className="text-gray-400 mr-2" /> Faculty: <span className="text-gray-900 ml-1 truncate">{b.faculty}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-600 font-medium">
                    <TypeIcon size={14} className="text-gray-400 mr-2" /> Room: <span className="text-gray-900 ml-1">{b.room}</span>
                  </div>
                </div>

                {/* Progress Bar & Stats */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fill Rate</div>
                    <div className={`text-xs font-black ${isFull ? 'text-red-600' : 'text-emerald-600'}`}>
                      {b.enrolled} / {b.capacity}
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : fillPct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${TYPE_STYLE[b.type].bg} ${TYPE_STYLE[b.type].text}`}>
                      <TypeIcon size={10} /> {b.type}
                    </span>
                    <button className="text-[11px] font-bold text-blue-600 hover:underline">
                      View details &rarr;
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
