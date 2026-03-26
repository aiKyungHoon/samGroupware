import { LayoutDashboard, BookOpen, UserCheck, Calculator, HeartHandshake, UserPlus } from 'lucide-react';

const menuItems = [
  { id: 'dashboard', name: '대시보드', icon: LayoutDashboard },
  { id: 'orgchart', name: '상암 조직도', icon: UserCheck },
  { id: 'worship', name: '예배 관리', icon: BookOpen },
  { id: 'education', name: '교육 관리', icon: UserCheck },
  { id: 'evangelism', name: '전도 관리', icon: UserPlus },
  { id: 'accounting', name: '회계 관리', icon: Calculator },
  { id: 'visits', name: '심방 관리', icon: HeartHandshake },
];

export function Sidebar({
  activeTab,
  onTabChange
}: {
  activeTab: string,
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
        상암지역 <br /><span style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 500 }}>춘식 관리자</span>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map(item => {
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
      </nav>
    </aside>
  );
}
