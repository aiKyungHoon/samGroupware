import { useState, useEffect } from 'react';
import { ArrowDown, Network, Users, X, ChevronRight, RefreshCw } from 'lucide-react';

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVBiwqf-bMs28m6Kw25Pe5T1QRbczpCSAEBCWRjw1ono4AuC-RShiVvvYnPDdqjm_293knKViblbOl/pub?gid=1668494611&single=true&output=csv';

/* ─────────── Types ─────────── */
type NamedRole = { role: string; name: string };
type TeamData = { name: string; leader: string; count: number; color: string; bgColor: string; areas: string[] };
type AreaMember = { name: string; role: string };
type AllAreaMembers = Record<string, AreaMember[]>;

const TEAM_CONFIGS: Record<string, { color: string; bgColor: string }> = {
  '보라': { color: '#8b5cf6', bgColor: '#f3e8ff' },
  '이음': { color: '#3b82f6', bgColor: '#dbeafe' },
  '해봄': { color: '#f59e0b', bgColor: '#fef3c7' },
  'default': { color: '#6b7280', bgColor: '#f3f4f6' }
};

/* ─────────── Helper ─────────── */
const areaKey = (teamName: string, areaName: string) =>
  `${teamName}_${areaName}`.replace(/[.[\]#$/]/g, '_');

/* ─────────── Modal Shell ─────────── */
function Modal({ title, subtitle, onClose, children }: {
  title: string; subtitle: string; onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,40,0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{title}</h2>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#374151" />
          </button>
        </div>
        <div style={{ padding: '20px 24px', background: '#f9fafb' }}>{children}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', borderTop: '1px solid #e8ecf0', position: 'sticky', bottom: 0, background: '#ffffff' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>닫기</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Main Component ─────────── */
export function OrgChart() {
  const [jeondo, setJeondo] = useState<NamedRole[]>([]);
  const [nalgae, setNalgae] = useState<NamedRole[]>([]);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [areaMembers, setAreaMembers] = useState<AllAreaMembers>({});
  const [imwon, setImwon] = useState<string>('미정');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Member modal
  const [selectedArea, setSelectedArea] = useState<{ teamName: string; areaName: string; color: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      const csvText = await response.text();
      
      const rows = csvText.split('\n').map(line => {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' && line[i+1] === '"') {
            current += '"';
            i++;
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      }).filter(row => row.length >= 5 && row[4] && row[4] !== '이름');

      const newJeondo: NamedRole[] = [];
      const newNalgae: NamedRole[] = [];
      const teamMap: Record<string, Set<string>> = {};
      const teamLeaders: Record<string, string> = {};
      const newAreaMembers: AllAreaMembers = {};
      let foundImwon = '미정';

      rows.forEach(row => {
        const [category, teamName, area, role, name] = row;
        if (!name) return;

        if (category === '전도') newJeondo.push({ role, name });
        if (category === '날개') newNalgae.push({ role, name });
        if (category === '임원') foundImwon = name;

        if (teamName) {
          if (!teamMap[teamName]) teamMap[teamName] = new Set();
          if (area) teamMap[teamName].add(area);
          
          if (role.includes('팀장')) {
            teamLeaders[teamName] = name;
          }

          if (area) {
            const key = areaKey(teamName, area);
            if (!newAreaMembers[key]) newAreaMembers[key] = [];
            newAreaMembers[key].push({ name, role });
          }
        }
      });

      const newTeams: TeamData[] = Object.keys(teamMap).map(tName => {
        const config = TEAM_CONFIGS[tName] || TEAM_CONFIGS['default'];
        const areas = Array.from(teamMap[tName]).sort((a, b) => {
          const aNum = parseInt(a) || 0;
          const bNum = parseInt(b) || 0;
          return aNum - bNum;
        });
        
        const totalInTeam = rows.filter(r => r[1] === tName).length;

        return {
          name: tName + '팀',
          leader: teamLeaders[tName] || '미정',
          count: totalInTeam,
          color: config.color,
          bgColor: config.bgColor,
          areas
        };
      });

      setJeondo(newJeondo);
      setNalgae(newNalgae);
      setTeams(newTeams);
      setAreaMembers(newAreaMembers);
      setImwon(foundImwon);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalMembers = Object.values(areaMembers).flat().length;

  return (
    <div style={{ padding: '32px 16px', background: 'var(--surface)', flex: 1, overflowY: 'auto' }}>
      <header style={{ maxWidth: '1000px', margin: '0 auto 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800, letterSpacing: '-0.02em' }}>상암 조직도</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>
            {loading ? '구글 시트 연동 중...' : error ? `에러 발생: ${error}` : `구글 시트 연동 완료 (총 ${totalMembers}명)`}
          </p>
        </div>
        <button 
          onClick={fetchData} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '14px', 
            fontWeight: 700, 
            cursor: 'pointer', 
            boxShadow: 'var(--shadow-elevated)',
            transition: 'transform 0.2s, background 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#7c3aed';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'var(--primary)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <RefreshCw size={18} className={loading ? 'spinner' : ''} />
          조직도 실시간 동기화
        </button>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Top Row */}
        <div className="responsive-grid-3" style={{ width: '100%', alignItems: 'start', marginBottom: '16px' }}>
          {/* 전도 */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700 }}>전도</div>
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {jeondo.map((r, i) => (
                <li key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--secondary)', fontSize: '12px' }}>{r.role}</span>
                  <strong style={{ fontSize: '16px' }}>{r.name}</strong>
                </li>
              ))}
            </ul>
          </div>

          {/* 임원 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#2d3748', color: 'white', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-elevated)' }}>
              <div style={{ fontSize: '13px', color: '#a0aec0', fontWeight: 600, marginBottom: '8px' }}>임원</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>{imwon}</div>
            </div>
            <ArrowDown size={24} color="#cbd5e1" style={{ margin: '16px 0' }} />
          </div>

          {/* 날개 */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700 }}>날개</div>
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {nalgae.map((r, i) => (
                <li key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ color: 'var(--secondary)', fontSize: '12px' }}>{r.role}</span>
                  <strong style={{ fontSize: '16px' }}>{r.name}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 양때 팀장 Hub */}
        <div style={{ background: 'var(--surface-low)', padding: '12px 32px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '22px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Network size={24} color="var(--primary)" />
          양때 팀장
        </div>

        {/* Team Cards */}
        <div className="responsive-grid-3" style={{ width: '100%', paddingBottom: '40px' }}>
          {teams.map((team, idx) => (
            <div key={idx} style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: `6px solid ${team.color}` }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '14px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '4px' }}>{team.name}</div>
                <div style={{ fontSize: '24px', fontWeight: 800 }}>{team.leader} <span style={{ fontSize: '14px', color: 'var(--secondary)' }}>팀장</span></div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: team.bgColor, color: team.color, padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700, marginTop: '12px' }}>
                  <Users size={14} /> 팀 인원: 총 {team.count}명
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {team.areas.map((area, aIdx) => (
                  <div key={aIdx} onClick={() => setSelectedArea({ teamName: team.name, areaName: area, color: team.color })} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-high)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-low)'}>
                    <span>{area}</span>
                    <span style={{ fontSize: '12px', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      구역원 등록 <ChevronRight size={14} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Modal: 구역원 관리 ─── */}
      {selectedArea && (
        <Modal
          title={`${selectedArea.teamName} ${selectedArea.areaName} 명단`}
          subtitle="현재 구역의 성도님 명단입니다."
          onClose={() => setSelectedArea(null)}
        >
          <div style={{ display: 'grid', gap: '10px' }}>
            {(areaMembers[areaKey(selectedArea.teamName.replace('팀',''), selectedArea.areaName)] || []).map((m, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#fff', borderRadius: 'var(--radius-lg)', border: `1px solid ${selectedArea.color}30` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: selectedArea.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {m.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{m.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{m.role || '구역원'}</div>
                </div>
              </div>
            ))}
            {(areaMembers[areaKey(selectedArea.teamName.replace('팀',''), selectedArea.areaName)] || []).length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--secondary)' }}>
                등록된 구역원이 없습니다.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
