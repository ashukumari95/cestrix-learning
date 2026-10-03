import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../../api';
import {
  ChevronLeft, BookOpen, Users, Video, FileText, IndianRupee,
  TrendingUp, PlayCircle, Clock, CheckCircle2, BarChart3
} from 'lucide-react';



export const CourseProfile = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/coaching/lms/courses/${id}`);
        setCourse(data);
      } catch (err) {
        console.error('Failed to fetch course', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCourse();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Loading course...</div>;
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

  const totalEnrollments = course.enrollments?.length || 0;
  // Compute totals
  let videos = 0;
  let docs = 0;
  let totalLessons = 0;
  let totalCompletedLessons = 0;

  course.modules?.forEach((m: any) => {
    m.chapters?.forEach((c: any) => {
      c.lessons?.forEach((l: any) => {
        totalLessons++;
        if (l.progress) {
          totalCompletedLessons += l.progress.filter((p: any) => p.completed).length;
        }
        l.resources?.forEach((r: any) => {
          if (r.type === 'VIDEO') videos++;
          else if (r.type === 'PDF' || r.type === 'DOCUMENT') docs++;
        });
      });
    });
  });

  const maxPossibleCompletions = totalLessons * totalEnrollments;
  const avgCompletion = maxPossibleCompletions > 0 
    ? Math.round((totalCompletedLessons / maxPossibleCompletions) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="cx-animate-in flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to=".." className="p-2 rounded-xl border transition-all hover:border-blue-300 bg-white" style={{ borderColor: '#dce8f7' }}>
            <ChevronLeft size={18} style={{ color: '#1a5dc9' }} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black" style={{ color: '#0d1b3e' }}>{course.title}</h1>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {course.isPublished ? 'PUBLISHED' : 'DRAFT'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">
              {course.price > 0 ? `₹${course.price}` : 'Free'} • {course.modules?.length || 0} Modules
            </p>
          </div>
        </div>
        <Link to="edit" className="cx-btn-secondary text-xs">
          Edit Course
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 cx-animate-in-2">
        {[
          { label: 'Total Enrollments', value: totalEnrollments, icon: Users, color: '#1a5dc9', bg: '#e8f0fb' },
          { label: 'Active Students', value: course.enrollments?.filter((e: any) => e.status === 'ACTIVE').length || 0, icon: ActivityIcon, color: '#f5a623', bg: '#fffbeb' },
          { label: 'Avg. Completion', value: `${avgCompletion}%`, icon: CheckCircle2, color: '#059669', bg: '#ecfdf5' },
          { label: 'Total Revenue', value: `₹${(totalEnrollments * parseFloat(course.price || 0))}`, icon: IndianRupee, color: '#9333ea', bg: '#f3e8fd' },
        ].map((k, i) => (
          <div key={i} className="cx-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: k.bg }}>
              <k.icon size={18} style={{ color: k.color }} />
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{k.label}</p>
              <p className="text-lg font-black" style={{ color: '#0d1b3e' }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b cx-animate-in-3" style={{ borderColor: '#dce8f7' }}>
        {[
          { id: 'OVERVIEW', label: 'Overview & Analytics', icon: BarChart3 },
          { id: 'CURRICULUM', label: 'Curriculum Progress', icon: BookOpen },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === t.id 
                ? 'border-blue-600 text-blue-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 cx-animate-in-4">
        {activeTab === 'OVERVIEW' ? (
          <>
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <div className="cx-card p-6">
                <h3 className="text-sm font-bold mb-3" style={{ color: '#0d1b3e' }}>About this Course</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{course.description || 'No description provided.'}</p>
              </div>

              {/* Progress Chart Placeholder */}
              <div className="cx-card p-6 min-h-[300px] flex flex-col justify-between relative overflow-hidden">
                <div className="flex justify-between items-center mb-6 relative z-10">
                  <h3 className="text-sm font-bold" style={{ color: '#0d1b3e' }}>Enrollment Trends</h3>
                  <select className="cx-input text-xs py-1 px-2 h-auto">
                    <option>Last 30 Days</option>
                    <option>This Year</option>
                  </select>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pt-10">
                  <TrendingUp size={120} className="text-blue-50 opacity-50" strokeWidth={1} />
                </div>
                <div className="relative z-10 flex items-end justify-between h-40 gap-2">
                  {(() => {
                    const currentYear = new Date().getFullYear();
                    const currentMonth = new Date().getMonth();
                    const monthlyEnrollments = new Array(12).fill(0);
                    course.enrollments?.forEach((e: any) => {
                      const date = new Date(e.enrolledAt || e.createdAt);
                      if (isNaN(date.getTime())) return;
                      const monthDiff = (currentYear - date.getFullYear()) * 12 + (currentMonth - date.getMonth());
                      if (monthDiff >= 0 && monthDiff < 12) {
                        monthlyEnrollments[11 - monthDiff]++;
                      }
                    });
                    const maxE = Math.max(...monthlyEnrollments, 1);
                    return monthlyEnrollments.map((count, i) => {
                      const h = (count / maxE) * 100;
                      return (
                        <div key={i} className="w-full bg-blue-50 rounded-t-sm relative group cursor-pointer" style={{ height: `${Math.max(h, 4)}%` }} title={`${count} Enrollments`}>
                          <div className="absolute bottom-0 w-full rounded-t-sm transition-all bg-blue-500 group-hover:bg-blue-600" style={{ height: '100%' }}></div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Content Summary */}
              <div className="cx-card p-6">
                <h3 className="text-sm font-bold mb-4" style={{ color: '#0d1b3e' }}>Content Summary</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center"><Video size={14} /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Video Lectures</p>
                        <p className="text-[10px] text-gray-500">{videos} items</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold">- Hrs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><FileText size={14} /></div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">Study Materials</p>
                        <p className="text-[10px] text-gray-500">PDFs, Notes</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold">{docs} items</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="md:col-span-3 space-y-4">
            {course.modules?.map((mod: any, i: number) => {
              const chapters = mod.chapters?.length || 0;
              const lessons = mod.chapters?.reduce((acc: number, c: any) => acc + (c.lessons?.length || 0), 0) || 0;
              const progress = (() => {
                let modLessons = 0;
                let modCompleted = 0;
                mod.chapters?.forEach((c: any) => {
                  c.lessons?.forEach((l: any) => {
                    modLessons++;
                    if (l.progress) {
                      modCompleted += l.progress.filter((p: any) => p.completed).length;
                    }
                  });
                });
                const max = modLessons * totalEnrollments;
                return max > 0 ? Math.round((modCompleted / max) * 100) : 0;
              })();
              return (
                <div key={mod.id} className="cx-card p-5 flex items-center gap-6 transition-all hover:border-blue-200">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-blue-700 bg-blue-50 border border-blue-100 flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{mod.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">{chapters} Chapters • {lessons} Lessons</p>
                  </div>
                  <div className="w-48">
                    <div className="flex justify-between text-[10px] font-bold mb-1.5">
                      <span className="text-gray-500">Avg Student Progress</span>
                      <span className={progress > 70 ? 'text-emerald-600' : progress > 40 ? 'text-amber-600' : 'text-red-600'}>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress > 70 ? '#059669' : progress > 40 ? '#f5a623' : '#cc2529' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function ActivityIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}
