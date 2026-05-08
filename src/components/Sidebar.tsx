import { LayoutDashboard, BookOpen, UserCheck, Calculator, HeartHandshake, UserPlus, Shield, Users } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', name: '대시보드', icon: LayoutDashboard },
  { id: 'orgchart', name: '상암 조직도', icon: UserCheck },
  { id: 'worship', name: '예배 관리', icon: BookOpen },
  { id: 'education', name: '교육 관리', icon: UserCheck },
  { id: 'evangelism', name: '전도 관리', icon: UserPlus },
  { id: 'accounting', name: '회계 관리', icon: Calculator },
  { id: 'visits', name: '심방 관리', icon: HeartHandshake },
  { id: 'team_bora', name: '보라팀', icon: Users },
  { id: 'team_haebom', name: '해봄팀', icon: Users },
  { id: 'team_ieum', name: '이음팀', icon: Users },
];

export function Sidebar({
  activeTab,
  user,
  onTabChange
}: {
  activeTab: string,
  user?: any,
  onTabChange: (id: string) => void
}) {
  return (
    <aside style={{
      width: '280px',
      height: '100%',
      background: 'white',
      borderRight: '1px solid var(--outline-variant)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      gap: '32px'
    }}>
      <div style={{
        padding: '0 16px',
        fontWeight: 800,
        fontSize: '20px',
        color: 'var(--primary)',
        fontFamily: 'Inter, sans-serif',
        letterSpacing: '-0.02em'
      }}>
        상암지역 <br /><span style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 500 }}>{user?.nickname || '사용자'}</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.filter(item => {
          // Always show orgchart
          if (item.id === 'orgchart') return true;
          
          const roles = user?.roles || [];
          const isMaster = roles.includes('master') || user?.role === 'admin' || user?.id === 'admin';

          // Dashboard requires menu_dashboard, role_leader, or master
          if (item.id === 'dashboard') {
            return roles.includes('menu_dashboard') || roles.includes('role_leader') || isMaster;
          }
          
          // Master admin sees everything
          if (isMaster) return true;
          
          // Check specific menu permissions
          if (item.id === 'worship' && roles.includes('menu_worship')) return true;
          if (item.id === 'education' && roles.includes('menu_education')) return true;
          if (item.id === 'evangelism' && roles.includes('menu_evangelism')) return true;
          if (item.id === 'accounting' && roles.includes('menu_accounting')) return true;
          if (item.id === 'visits' && roles.includes('menu_visits')) return true;

          // Check team menu permissions
          if (item.id === 'team_bora' && roles.includes('team_bora')) return true;
          if (item.id === 'team_haebom' && roles.includes('team_haebom')) return true;
          if (item.id === 'team_ieum' && roles.includes('team_ieum')) return true;
          
          return false;
        }).map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: 'none',
                background: isActive ? 'var(--primary-container)' : 'transparent',
                color: isActive ? 'var(--on-primary)' : 'var(--secondary)',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 500,
                fontSize: '15px',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <Icon size={20} />
              {item.name}
            </button>
          );
        })}
        {(() => {
          const ADMIN_ROLES = ['master', 'menu_worship', 'menu_education', 'menu_evangelism', 'menu_accounting', 'menu_visits', 'menu_dashboard'];
          const hasAdminAccess = user?.id === 'admin' || user?.role === 'admin' || (user?.roles || []).some((r: string) => ADMIN_ROLES.includes(r));
          
          if (!hasAdminAccess) return null;

          return (
            <button
              onClick={() => onTabChange('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                border: 'none',
                background: activeTab === 'admin' ? '#fee2e2' : 'transparent',
                color: activeTab === 'admin' ? '#b91c1c' : '#ef4444',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: activeTab === 'admin' ? 600 : 500,
                fontSize: '15px',
                transition: 'all 0.2s',
                textAlign: 'left',
                marginTop: 'auto'
              }}
            >
              <Shield size={20} />
              관리자 설정
            </button>
          );
        })()}
      </nav>
    </aside>
  );
}
