import { useState } from 'react';
import { Dashboard, healthMetrics } from './Dashboard';
import { Settings, X, Check } from 'lucide-react';
import { OrgChart } from './OrgChart';
import { Worship } from './Worship';
import { Education } from './Education';
import { TeamWeeklyChecklist } from './TeamWeeklyChecklist';

interface TeamManagementProps {
  teamName: string;
  user: any;
}

export function TeamManagement({ teamName, user }: TeamManagementProps) {
  const [internalTab, setInternalTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  
  const storageKey = `dashboard_metrics_${teamName}`;
  const [visibleMetricIds, setVisibleMetricIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : healthMetrics.map(m => m.id);
  });

  const toggleMetric = (id: string) => {
    const newIds = visibleMetricIds.includes(id)
      ? visibleMetricIds.filter(mid => mid !== id)
      : [...visibleMetricIds, id];
    setVisibleMetricIds(newIds);
    localStorage.setItem(storageKey, JSON.stringify(newIds));
  };

  const tabs = [
    { id: 'dashboard', label: '팀 대시보드' },
    { id: 'orgchart', label: '팀 조직도' },
    { id: 'worship_input', label: '주차별 예배 입력' },
    { id: 'education_input', label: '주차별 교육 입력' },
    { id: 'evangelism_input', label: '주차별 전도 입력' },
    { id: 'accounting_input', label: '주차별 회계 입력' },
    { id: 'visit_input', label: '심방 기록' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      {/* Team Header & Internal Tabs */}
      <div className="team-header-container" style={{ background: 'white', borderBottom: '1px solid var(--outline-variant)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '8px' }}>
              {teamName} 관리
            </h1>
            <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>
              {teamName}의 모든 지표와 데이터를 주차별로 관리하는 통합 페이지입니다.
            </p>
          </div>
          {internalTab === 'dashboard' && (user?.roles?.includes('master') || user?.role === 'admin' || user?.id === 'admin' || user?.roles?.includes('menu_dashboard')) && (
            <button 
              onClick={() => setShowSettings(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--outline-variant)',
                background: 'white',
                color: 'var(--on-surface)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-low)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              <Settings size={18} />
              지표 설정
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setInternalTab(tab.id)}
              style={{
                padding: '12px 20px',
                background: 'none',
                border: 'none',
                borderBottom: internalTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
                color: internalTab === tab.id ? 'var(--primary)' : 'var(--secondary)',
                fontWeight: internalTab === tab.id ? 700 : 500,
                fontSize: '15px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Internal Content Rendering */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-lowest)', padding: '16px 20px' }}>
        {internalTab === 'dashboard' && (
          <Dashboard team={teamName} onTabChange={() => {}} visibleMetricIds={visibleMetricIds} />
        )}
        {internalTab === 'orgchart' && (
          <OrgChart team={teamName} />
        )}
        {internalTab === 'worship_input' && (
          <Worship user={user} teamName={teamName} />
        )}
        {internalTab === 'education_input' && (
          <Education user={user} teamName={teamName} />
        )}
        {internalTab === 'evangelism_input' && (
          <TeamWeeklyChecklist teamName={teamName} type="evangelism" />
        )}
        {internalTab === 'accounting_input' && (
          <TeamWeeklyChecklist teamName={teamName} type="accounting" />
        )}
        {internalTab === 'visit_input' && (
          <TeamWeeklyChecklist teamName={teamName} type="visit" />
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '480px',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
            boxShadow: 'var(--shadow-elevated)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowSettings(false)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}
            >
              <X size={24} />
            </button>
            
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>대시보드 지표 설정</h2>
            <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '24px' }}>팀 대시보드에 노출할 성장 및 돌봄 지표를 선택하세요.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
              {healthMetrics.map(metric => {
                const isVisible = visibleMetricIds.includes(metric.id);
                return (
                  <div 
                    key={metric.id}
                    onClick={() => toggleMetric(metric.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: isVisible ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                      background: isVisible ? 'var(--primary-container-lowest, #f0f7ff)' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ background: 'var(--surface-low)', padding: '8px', borderRadius: '8px' }}>
                        <metric.icon size={20} color="var(--secondary)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--on-surface)' }}>{metric.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{metric.category === 'growing' ? '성장 지표' : '돌봄 지표'}</div>
                      </div>
                    </div>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: '2px solid var(--outline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isVisible ? 'var(--primary)' : 'transparent',
                      borderColor: isVisible ? 'var(--primary)' : 'var(--outline)'
                    }}>
                      {isVisible && <Check size={16} color="white" />}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => setShowSettings(false)}
              style={{
                width: '100%',
                marginTop: '32px',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              설정 완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
