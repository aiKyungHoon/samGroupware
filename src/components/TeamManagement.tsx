import { useState } from 'react';
import { Dashboard } from './Dashboard';
import { OrgChart } from './OrgChart';
import { Worship } from './Worship';

interface TeamManagementProps {
  teamName: string;
  user: any;
}

export function TeamManagement({ teamName, user }: TeamManagementProps) {
  const [internalTab, setInternalTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: '팀 대시보드' },
    { id: 'orgchart', label: '팀 조직도' },
    { id: 'worship_input', label: '주차별 예배 입력' },
    { id: 'education_input', label: '주차별 교육 입력' },
    { id: 'visit_input', label: '심방 기록' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      {/* Team Header & Internal Tabs */}
      <div className="team-header-container" style={{ background: 'white', borderBottom: '1px solid var(--outline-variant)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '8px' }}>
          {teamName} 관리
        </h1>
        <p style={{ color: 'var(--secondary)', fontSize: '15px', marginBottom: '24px' }}>
          {teamName}의 모든 지표와 데이터를 주차별로 관리하는 통합 페이지입니다.
        </p>

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
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--surface-lowest)' }}>
        {internalTab === 'dashboard' && <Dashboard team={teamName} onTabChange={() => {}} />}
        {internalTab === 'orgchart' && (
          <OrgChart team={teamName} />
        )}
        {internalTab === 'worship_input' && (
          <Worship user={{ ...user, roles: [teamName === '보라팀' ? 'team_bora' : teamName === '해봄팀' ? 'team_haebom' : 'team_ieum'] }} />
        )}
        {internalTab === 'education_input' && (
          <div style={{ padding: '32px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', textAlign: 'center', color: 'var(--secondary)' }}>
              <h3>{teamName} 전용 교육 주차별 입력 폼 영역입니다.</h3>
              <p>주차를 선택하고 팀원 교육 데이터를 체크할 수 있습니다.</p>
            </div>
          </div>
        )}
        {internalTab === 'visit_input' && (
          <div style={{ padding: '32px' }}>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', textAlign: 'center', color: 'var(--secondary)' }}>
              <h3>{teamName} 전용 심방 기록 관리 영역입니다.</h3>
              <p>팀원들의 주차별 심방 현황을 기록합니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
