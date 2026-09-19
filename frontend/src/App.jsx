import { Bell, ChevronRight, LayoutDashboard, MapPinned, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, SlidersHorizontal, Sparkles, Table2, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Simulation from './pages/Simulation';
import Header from './components/Header';

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'All projects', icon: Table2 },
  { to: '/simulation', label: 'What-if simulation', icon: Sparkles },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><ShieldCheck size={20} strokeWidth={2.5} /></div>
          {!collapsed && <div><strong>DHARA-SANKET</strong><span>AI risk intelligence</span></div>}
          <button className="icon-button sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="primary-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
              <Icon size={18} /><span>{label}</span>{label === 'Overview' && !collapsed && <span className="nav-dot" />}
            </NavLink>
          ))}
        </nav>

        {!collapsed && <div className="sidebar-note"><Sparkles size={16} /><div><strong>Model health</strong><span>Last synced 4 min ago</span></div><span className="health-dot" /></div>}
        <div className="sidebar-footer">
          <button className="collapse-button" onClick={() => setCollapsed(value => !value)}>{collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}<span>{collapsed ? 'Expand' : 'Collapse'}</span></button>
          {!collapsed && <div className="user-chip"><span className="avatar">DS</span><div><strong>Program team</strong><span>Portfolio workspace</span></div><ChevronRight size={15} /></div>}
        </div>
      </aside>

      <div className="mobile-topbar"><button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button><strong>DHARA-SANKET</strong><Bell size={19} /></div>
      <main className="main-content">
        <header className="topbar">
          <Header />
          <div className="topbar-actions"><span className="last-updated">Updated just now</span><button className="icon-button notification-button" aria-label="Notifications"><Bell size={19} /><i /></button><button className="filter-button"><SlidersHorizontal size={16} /> Filters</button></div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/simulation" element={<Simulation />} />
        </Routes>
      </main>
    </div>
  );
}
