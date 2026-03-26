import { useState } from 'react'
import { Menu, LayoutDashboard, BookOpen, UserCheck, UserPlus, ShieldCheck, Users } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { OrgChart } from './components/OrgChart'
import { Worship } from './components/Worship'
import { Education } from './components/Education'
import { Evangelism } from './components/Evangelism'
import { Accounting } from './components/Accounting'
import { Visits } from './components/Visits'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768)

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onTabChange={setActiveTab} />;
      case 'worship':
        return <Worship />;
      case 'education':
        return <Education />;
      case 'accounting':
        return <Accounting />;
      case 'visits':
        return <Visits />;
      case 'evangelism':
        return <Evangelism />;
      case 'orgchart':
        return <OrgChart />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface-lowest)', color: 'var(--on-surface)', overflow: 'hidden' }}>
      {/* Sidebar - Desktop and Mobile */}
      <div 
        className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{ 
          display: 'block' // Allow CSS media queries to handle width/position
        }}
      >
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={(id) => {
            setActiveTab(id);
            if (window.innerWidth <= 768) setIsSidebarOpen(false); // Close on mobile after selection
          }} 
        />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay open" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Top Header for Mobile & Desktop Toggle */}
        <header style={{ 
          height: '64px', 
          borderBottom: '1px solid var(--outline-variant)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'white',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--on-surface)' }}
            >
              <Menu size={24} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary)" />
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Sanctuary <span style={{ fontWeight: 400, color: 'var(--secondary)' }}>Groupware</span></span>
            </div>
          </div>
        </header>

        {renderContent()}

        {/* Mobile Bottom Navigation */}
        <nav className="mobile-only" style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          height: '72px', 
          background: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--outline-variant)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '0 8px',
          zIndex: 100
        }}>
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: '대시보드' },
            { id: 'worship', icon: UserCheck, label: '예배' },
            { id: 'education', icon: BookOpen, label: '교육' },
            { id: 'orgchart', icon: ShieldCheck, label: '조직도' },
            { id: 'evangelism', icon: UserPlus, label: '전도' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                gap: '4px',
                color: activeTab === item.id ? 'var(--primary)' : 'var(--secondary)',
                padding: '8px'
              }}
            >
              <item.icon size={20} />
              <span style={{ fontSize: '10px', fontWeight: activeTab === item.id ? 700 : 500 }}>{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  )
}

export default App
