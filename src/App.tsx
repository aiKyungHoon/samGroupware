import { useState } from 'react'
import { Menu, LayoutDashboard, BookOpen, UserCheck, UserPlus, ShieldCheck, Users, Clock, LogOut } from 'lucide-react'
import { Sidebar } from './components/Sidebar'
import { Dashboard } from './components/Dashboard'
import { OrgChart } from './components/OrgChart'
import { Worship } from './components/Worship'
import { Education } from './components/Education'
import { Evangelism } from './components/Evangelism'
import { Accounting } from './components/Accounting'
import { Visits } from './components/Visits'
import { useAuth } from './hooks/useAuth'
import { Auth } from './components/Auth/Auth'

function App() {
  const { user, loading, logout } = useAuth();
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

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-lowest)' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Show "Pending Approval" screen if logged in but not approved
  if (user && user.status === 'pending') {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--surface-lowest)',
        padding: '24px'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%', 
          background: 'white', 
          padding: '40px', 
          borderRadius: 'var(--radius-xl)', 
          boxShadow: 'var(--shadow-elevated)',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--warning-container)', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px'
          }}>
            <Clock size={32} color="var(--warning)" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>승인 대기 중</h2>
          <p style={{ color: 'var(--secondary)', marginBottom: '32px', lineHeight: 1.6 }}>
            {user.name} 님의 사역 신청이 접수되었습니다.<br />
            관리자가 승인한 후에 모든 기능을 이용하실 수 있습니다.
          </p>
          <button 
            onClick={logout}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: 'var(--surface-variant)', 
              color: 'var(--on-surface-variant)', 
              border: 'none', 
              borderRadius: 'var(--radius-md)', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={18} /> 로그아웃
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface-lowest)', color: 'var(--on-surface)', overflow: 'hidden', position: 'relative' }}>
      
      {/* Login Modal Overlay */}
      {!user && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <Auth />
        </div>
      )}

      {/* Sidebar - Desktop and Mobile */}
      <div
        className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}
        style={{
          display: 'block',
          filter: !user ? 'blur(4px)' : 'none',
          pointerEvents: !user ? 'none' : 'auto'
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

      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        filter: !user ? 'blur(4px)' : 'none',
        pointerEvents: !user ? 'none' : 'auto'
      }}>
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
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>상암 <span style={{ fontWeight: 400, color: 'var(--secondary)' }}>Groupware</span></span>
            </div>
          </div>
          
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="hidden md-block" style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>{user.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{user.department}</div>
              </div>
              <button 
                onClick={logout}
                style={{ background: 'var(--surface-variant)', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', color: 'var(--secondary)' }}
                title="로그아웃"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
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
