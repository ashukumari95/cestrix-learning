import React, { useState, useContext } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  FileQuestion, FileText, Award, CreditCard, CalendarCheck,
  Bell, Search, Settings, Layers, Bot, User,
  ChevronDown, Sparkles, LogOut, Zap, Menu, X
} from 'lucide-react';
import { useOrganization, type Module } from '../context/OrganizationContext';
import { useAuth } from '../../../context/AuthContext';

// ── Nav group definition ─────────────────────────────────────────────────────
interface NavGroup {
  section: string;
  items: { icon: any; label: string; path: string; module: Module; badge?: string }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    section: 'Overview',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',   path: '/',          module: 'DASHBOARD' },
    ]
  },
  {
    section: 'People',
    items: [
      { icon: Users,          label: 'Students',     path: '/students',  module: 'STUDENTS' },
      { icon: GraduationCap, label: 'Teachers',      path: '/teachers',  module: 'TEACHERS' },
      { icon: Layers,         label: 'Batches',      path: '/batches',   module: 'BATCHES' },
      { icon: Users,          label: 'Parents',      path: '/parents',   module: 'PARENTS' },
    ]
  },
  {
    section: 'Academics',
    items: [
      { icon: BookOpen,       label: 'Courses',       path: '/courses',   module: 'LMS' },
      { icon: FileQuestion,   label: 'Question Bank', path: '/questions', module: 'QUESTION_BANK' },
      { icon: FileText,       label: 'Tests',         path: '/tests',     module: 'TESTS' },
      { icon: Award,          label: 'Results',       path: '/results',   module: 'RESULTS' },
    ]
  },
  {
    section: 'Operations',
    items: [
      { icon: CreditCard,     label: 'Fees',         path: '/fees',         module: 'FEES' },
      { icon: CalendarCheck,  label: 'Attendance',   path: '/attendance',   module: 'ATTENDANCE' },
      { icon: Bell,           label: 'Notifications',path: '/notifications',module: 'NOTIFICATIONS' },
    ]
  },
  {
    section: 'Intelligence',
    items: [
      { icon: Bot,            label: 'AI Management',path: '/ai-management',module: 'AI_MANAGEMENT', badge: 'NEW' },
    ]
  },
  {
    section: 'System',
    items: [
      { icon: Settings,       label: 'Settings',     path: '/settings',     module: 'SETTINGS' },
    ]
  }
];

// ── Sidebar NavLink ──────────────────────────────────────────────────────────
const NavLink = ({ icon: Icon, label, path, badge, onClick }: { icon: any; label: string; path: string; badge?: string; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <Link to={path} onClick={onClick} className={`cx-nav-link${isActive ? ' active' : ''}`}>
      <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          badge === 'NEW'
            ? 'bg-accent-500/20 text-accent-300'
            : 'bg-white/10 text-slate-400'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
};

// ── Main Layout ──────────────────────────────────────────────────────────────
export const CoachingAdminLayout = () => {
  const { orgName, adminName, activeModules } = useOrganization();
  const { setRole, logout } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar Mobile Overlay ── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`w-[260px] flex-shrink-0 flex-col fixed top-0 left-0 h-screen z-50 overflow-hidden transition-transform duration-300 ease-in-out md:translate-x-0 flex ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #001233 0%, #001845 100%)' }}
      >
        {/* Mobile close button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 z-50 p-2 text-white/70 hover:text-white bg-white/10 rounded-lg"
        >
          <X size={20} />
        </button>
        {/* Subtle top glow — Navy blue */}
        <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(26,93,201,0.3) 0%, transparent 70%)' }} />

        {/* ── Brand ── */}
        <div className="flex items-center gap-3 px-5 py-5 relative z-10">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #1a5dc9, #0e3578)', boxShadow: '0 0 20px rgba(26,93,201,0.5)' }}>
              CX
            </div>
            {/* Gold dot badge */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{ background: '#f5a623', borderColor: '#001233', boxShadow: '0 0 6px rgba(245,166,35,0.8)' }} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white leading-tight truncate tracking-tight">Cestrix ERP</h1>
            <p className="text-[11px] truncate" style={{ color: 'rgba(157,188,238,0.7)' }}>{orgName}</p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <Sparkles size={14} style={{ color: '#f5a623' }} />
          </div>
        </div>

        {/* ── Global Search ── */}
        <div className="px-4 pb-3 relative z-10">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(157,188,238,0.5)' }} />
            <input
              type="text"
              placeholder="Search… ⌘K"
              className="cx-search w-full pl-9 pr-3 py-2 text-xs"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-4 mb-1" style={{ height: '1px', background: 'rgba(26,93,201,0.25)' }} />

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 relative z-10">
          {NAV_GROUPS.map((group) => {
            const visible = group.items.filter(i => activeModules.includes(i.module));
            if (!visible.length) return null;
            return (
              <div key={group.section}>
                <p className="cx-nav-section">{group.section}</p>
                {visible.map((item) => (
                  <NavLink key={item.path} {...item} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
              </div>
            );
          })}
        </nav>

        {/* ── Bottom user card + Logout ── */}
        <div className="relative z-10 mx-3 mb-4 p-3 rounded-xl flex items-center gap-3"
          style={{ background: 'rgba(26,93,201,0.15)', border: '1px solid rgba(26,93,201,0.25)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #cc2529, #a81e22)' }}>
            {adminName.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{adminName}</p>
            <p className="text-[10px]" style={{ color: 'rgba(157,188,238,0.6)' }}>Administrator</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="p-1.5 rounded-lg transition-all hover:bg-red-500/20 group/logout"
          >
            <LogOut size={14} className="transition-colors group-hover/logout:text-red-400" style={{ color: 'rgba(157,188,238,0.45)' }} />
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-h-screen">

        {/* ── Top Header ── */}
        <header className="h-[60px] sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8"
          style={{
            background: 'rgba(240, 244, 250, 0.9)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(26,93,201,0.15)',
          }}>

          {/* Left Area (Menu + Breadcrumb) */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold" style={{ color: '#1a5dc9' }}>Cestrix</span>
              <span style={{ color: '#9dbcee' }}>/</span>
              <span className="font-medium text-gray-600 hidden sm:inline">Admin Panel</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">

            {/* Quick Action Pill */}
            <Link to="/students/add"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
              style={{ background: 'rgba(26,93,201,0.08)', color: '#1448a0', border: '1px solid rgba(26,93,201,0.2)' }}>
              <Zap size={13} />
              Quick Add
            </Link>

            {/* Notification */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:bg-blue-50">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: '#cc2529', boxShadow: '0 0 6px rgba(204,37,41,0.8)' }} />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-200" />

            {/* Avatar */}
            <div className="relative group/profile">
              <div className="flex items-center gap-2.5 cursor-pointer group-hover/profile:opacity-80 transition-opacity">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                  style={{ background: 'linear-gradient(135deg, #1a5dc9, #0e3578)', boxShadow: '0 0 12px rgba(26,93,201,0.4)' }}>
                  {adminName.substring(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-gray-800 leading-tight">{adminName}</p>
                  <p className="text-[10px] text-gray-400">Admin</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600" />
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all transform origin-top-right z-50">
                <div className="p-2">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <User size={16} /> My Profile
                  </Link>
                  <div className="h-px bg-gray-100 my-1"></div>
                  <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>

        {/* ── Footer ── */}
        <footer className="px-8 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(167,139,250,0.12)' }}>
          <p className="text-[11px] text-gray-400">© 2025 Cestrix Learning Technologies</p>
          <p className="text-[11px] flex items-center gap-1" style={{ color: '#3f7ddd' }}>
            <Sparkles size={10} /> v1.0.0 · Built with Cestrix ERP
          </p>
        </footer>
      </div>
    </div>
  );
};
