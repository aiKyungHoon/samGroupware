import { useState, useEffect } from 'react';
import { ArrowDown, Network, Users, X, Save, Pencil, UserPlus, ChevronRight } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

/* ─────────── Types ─────────── */
type NamedRole = { role: string; name: string };
type TeamData = { name: string; leader: string; count: number; color: string; bgColor: string; areas: string[] };
type AreaMember = { name: string; role: string };
type AllAreaMembers = Record<string, AreaMember[]>; // key: "{teamName}_{areaName}"

/* ─────────── Default Data ─────────── */
const defaultJeondo: NamedRole[] = [
  { role: '지역장', name: '김하영' },
  { role: '전도교관', name: '박다솔' },
  { role: '전도서기', name: '김선우B' },
  { role: '대외협력교관', name: '양재준' },
];
const defaultNalgae: NamedRole[] = [
  { role: '지역서기', name: '복서경' },
  { role: '교육팀장', name: '김성준' },
  { role: '문화팀장', name: '이여진' },
  { role: '회계팀장', name: '유승우' },
  { role: '심방팀장', name: '박미연' },
];
const defaultTeams: TeamData[] = [
  { name: '보라팀', leader: '김규리', count: 50, color: '#8b5cf6', bgColor: '#f3e8ff', areas: ['1구역', '2구역', '3구역', '4구역', '5구역'] },
  { name: '이음팀', leader: '김주영a', count: 55, color: '#3b82f6', bgColor: '#dbeafe', areas: ['6구역', '7구역', '8구역', '9구역', '10구역'] },
  { name: '해봄팀', leader: '김반디', count: 45, color: '#f59e0b', bgColor: '#fef3c7', areas: ['11구역', '12구역', '13구역', '14구역', '15구역'] },
];

/* ─────────── Helper ─────────── */
const areaKey = (teamName: string, areaName: string) =>
  `${teamName}_${areaName}`.replace(/[.\[\]#$/]/g, '_');

/* ─────────── Common Styles ─────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  border: '1.5px solid #d1d5db', background: '#ffffff',
  fontSize: '14px', fontWeight: 600, boxSizing: 'border-box', color: '#111827',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px'
};

/* ─────────── Modal Shell ─────────── */
function Modal({ title, subtitle, onClose, onSave, saveLabel = '저장하기', children }: {
  title: string; subtitle: string; onClose: () => void; onSave: () => void;
  saveLabel?: string; children: React.ReactNode;
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
          <button onClick={onClose} style={{ padding: '9px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>취소</button>
          <button onClick={onSave} style={{ padding: '9px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary)' }}>
      <Pencil size={13} /> 수정
    </button>
  );
}

/* ─────────── Main Component ─────────── */
export function OrgChart() {
  const [jeondo, setJeondo] = useState<NamedRole[]>(defaultJeondo);
  const [nalgae, setNalgae] = useState<NamedRole[]>(defaultNalgae);
  const [teams, setTeams] = useState<TeamData[]>(defaultTeams);
  const [areaMembers, setAreaMembers] = useState<AllAreaMembers>({});
  const [loading, setLoading] = useState(true);

  // Edit modals
  const [modal, setModal] = useState<'jeondo' | 'nalgae' | 'teams' | null>(null);
  const [editJeondo, setEditJeondo] = useState<NamedRole[]>([]);
  const [editNalgae, setEditNalgae] = useState<NamedRole[]>([]);
  const [editTeams, setEditTeams] = useState<TeamData[]>([]);

  // Member modal
  const [selectedArea, setSelectedArea] = useState<{ teamName: string; areaName: string; color: string } | null>(null);
  const [editMembers, setEditMembers] = useState<AreaMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');

  /* ─── Firebase: Load ─── */
  useEffect(() => {
    let loaded = 0;
    const markLoaded = () => { loaded++; if (loaded === 4) setLoading(false); };

    const u1 = onValue(ref(db, 'orgchart/jeondo'), s => { if (s.exists()) setJeondo(s.val()); markLoaded(); });
    const u2 = onValue(ref(db, 'orgchart/nalgae'), s => { if (s.exists()) setNalgae(s.val()); markLoaded(); });
    const u3 = onValue(ref(db, 'orgchart/teams'), s => { if (s.exists()) setTeams(s.val()); markLoaded(); });
    const u4 = onValue(ref(db, 'orgchart/areaMembers'), s => { if (s.exists()) setAreaMembers(s.val()); markLoaded(); });

    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const totalMembers = teams.reduce((acc, t) => acc + t.count, 0);

  /* ─── Edit Modals ─── */
  const open = (which: typeof modal) => {
    if (which === 'jeondo') setEditJeondo(jeondo.map(r => ({ ...r })));
    if (which === 'nalgae') setEditNalgae(nalgae.map(r => ({ ...r })));
    if (which === 'teams') setEditTeams(teams.map(t => ({ ...t, areas: [...t.areas] })));
    setModal(which);
  };
  const close = () => setModal(null);
  const saveJeondo = async () => { await set(ref(db, 'orgchart/jeondo'), editJeondo); close(); };
  const saveNalgae = async () => { await set(ref(db, 'orgchart/nalgae'), editNalgae); close(); };
  const saveTeams = async () => { await set(ref(db, 'orgchart/teams'), editTeams); close(); };

  /* ─── Area Member Modal ─── */
  const openAreaModal = (teamName: string, areaName: string, color: string) => {
    const key = areaKey(teamName, areaName);
    const existing = areaMembers[key] || [];
    setEditMembers(existing.map(m => ({ ...m })));
    setNewMemberName('');
    setNewMemberRole('');
    setSelectedArea({ teamName, areaName, color });
  };
  const closeAreaModal = () => setSelectedArea(null);

  const addMember = () => {
    if (!newMemberName.trim()) return;
    setEditMembers(prev => [...prev, { name: newMemberName.trim(), role: newMemberRole.trim() }]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const saveAreaMembers = async () => {
    if (!selectedArea) return;
    const key = areaKey(selectedArea.teamName, selectedArea.areaName);
    await set(ref(db, `orgchart/areaMembers/${key}`), editMembers);
    setAreaMembers(prev => ({ ...prev, [key]: editMembers }));
    closeAreaModal();
  };

  const getMemberCount = (teamName: string, areaName: string) => {
    const key = areaKey(teamName, areaName);
    return (areaMembers[key] || []).length;
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', color: 'var(--secondary)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--outline-variant)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '14px', fontWeight: 600 }}>조직도를 불러오는 중...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>상암 조직도</h1>
        <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>팀별/구역별 조직 구성 및 인원 현황 (총 {totalMembers}명)</p>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Top Row */}
        <div className="responsive-grid-3" style={{ width: '100%', alignItems: 'start', marginBottom: '16px' }}>
          {/* 전도 */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700 }}>전도</div>
              <EditBtn onClick={() => open('jeondo')} />
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
            <div style={{ background: 'linear-gradient(135deg, var(--on-surface), #3e4c59)', color: 'white', padding: '24px 48px', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-ambient)' }}>
              <div style={{ fontSize: '15px', opacity: 0.9, marginBottom: '6px' }}>임원</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>한민지</div>
            </div>
            <div style={{ height: '40px', width: '2px', background: 'var(--outline-variant)', margin: '16px 0 0 0' }}></div>
            <ArrowDown size={24} color="var(--outline-variant)" style={{ marginBottom: '16px' }} />
          </div>

          {/* 날개 */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700 }}>날개</div>
              <EditBtn onClick={() => open('nalgae')} />
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
        <div style={{ background: 'var(--surface-low)', padding: '12px 24px 12px 32px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '22px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Network size={24} color="var(--primary)" />
          양때 팀장
          <button onClick={() => open('teams')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary)' }}>
            <Pencil size={13} /> 수정
          </button>
        </div>

        {/* Team Cards */}
        <div className="responsive-grid-3" style={{ width: '100%', paddingBottom: '40px' }}>
          {teams.map((team, idx) => (
            <div key={idx} style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: `6px solid ${team.color}` }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--surface-low)', paddingBottom: '16px' }}>
                <div style={{ fontSize: '15px', color: 'var(--secondary)', marginBottom: '4px' }}>{team.name}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{team.leader} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--secondary)' }}>팀장</span></div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: team.color, background: team.bgColor, padding: '6px 16px', borderRadius: 'var(--radius-full)' }}>
                  <Users size={14} /> 팀 인원: 총 {team.count}명
                </div>
              </div>
              {/* 구역 Badges — clickable */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {team.areas.map(area => {
                  const cnt = getMemberCount(team.name, area);
                  return (
                    <button
                      key={area}
                      onClick={() => openAreaModal(team.name, area, team.color)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = team.bgColor)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-low)')}
                    >
                      <span>{area}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: cnt > 0 ? team.color : 'var(--secondary)', fontWeight: 700 }}>
                        {cnt > 0 ? <><Users size={12} /> {cnt}명</> : <span style={{ opacity: 0.5 }}>구역원 등록</span>}
                        <ChevronRight size={14} color="var(--secondary)" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Modal: 전도 ─── */}
      {modal === 'jeondo' && (
        <Modal title="전도 명단 수정" subtitle="지역장, 교관, 서기 이름을 수정합니다." onClose={close} onSave={saveJeondo}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {editJeondo.map((r, i) => (
              <div key={i}>
                <label style={labelStyle}>{r.role}</label>
                <input style={inputStyle} value={r.name} onChange={e => setEditJeondo(prev => prev.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ─── Modal: 날개 ─── */}
      {modal === 'nalgae' && (
        <Modal title="날개 명단 수정" subtitle="각 팀장 및 서기 이름을 수정합니다." onClose={close} onSave={saveNalgae}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {editNalgae.map((r, i) => (
              <div key={i}>
                <label style={labelStyle}>{r.role}</label>
                <input style={inputStyle} value={r.name} onChange={e => setEditNalgae(prev => prev.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))} />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ─── Modal: 양때 팀장 ─── */}
      {modal === 'teams' && (
        <Modal title="양때 팀장 명단 수정" subtitle="팀 이름, 팀장, 인원 수, 구역명을 수정합니다." onClose={close} onSave={saveTeams}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {editTeams.map((team, tIdx) => (
              <div key={tIdx} style={{ border: `2px solid ${team.color}`, borderRadius: 'var(--radius-lg)', padding: '18px', background: '#fff' }}>
                <div style={{ display: 'inline-block', background: team.bgColor, color: team.color, padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>{team.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '10px', marginBottom: '14px' }}>
                  <div><label style={labelStyle}>팀 이름</label><input style={inputStyle} value={team.name} onChange={e => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, name: e.target.value } : t))} /></div>
                  <div><label style={labelStyle}>팀장 이름</label><input style={inputStyle} value={team.leader} onChange={e => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, leader: e.target.value } : t))} /></div>
                  <div><label style={labelStyle}>인원 수</label><input type="number" style={inputStyle} value={team.count} onChange={e => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, count: parseInt(e.target.value) || 0 } : t))} /></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={labelStyle}>구역 이름 ({team.areas.length}개)</label>
                  <button onClick={() => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, areas: [...t.areas, `${t.areas.length + 1}구역`] } : t))} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>+ 구역 추가</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {team.areas.map((area, aIdx) => (
                    <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, minWidth: '20px', textAlign: 'right' }}>{aIdx + 1}</span>
                      <input style={{ ...inputStyle, flex: 1 }} value={area} onChange={e => setEditTeams(prev => prev.map((t, i) => { if (i !== tIdx) return t; const a = [...t.areas]; a[aIdx] = e.target.value; return { ...t, areas: a }; }))} />
                      <button onClick={() => setEditTeams(prev => prev.map((t, i) => { if (i !== tIdx) return t; return { ...t, areas: t.areas.filter((_, ai) => ai !== aIdx) }; }))} disabled={team.areas.length <= 1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', background: team.areas.length <= 1 ? '#f3f4f6' : '#fee2e2', border: 'none', borderRadius: '8px', cursor: team.areas.length <= 1 ? 'default' : 'pointer', flexShrink: 0, opacity: team.areas.length <= 1 ? 0.4 : 1 }}>
                        <X size={14} color="#ef4444" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ─── Modal: 구역원 관리 ─── */}
      {selectedArea && (
        <Modal
          title={`${selectedArea.areaName} 구역원 관리`}
          subtitle={`${selectedArea.teamName} · 구역원을 추가하거나 삭제할 수 있습니다.`}
          onClose={closeAreaModal}
          onSave={saveAreaMembers}
          saveLabel="저장하기"
        >
          {/* 구역원 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {editMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af', fontSize: '14px' }}>
                <UserPlus size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p>등록된 구역원이 없습니다.</p>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>아래에서 구역원을 추가해 주세요.</p>
              </div>
            ) : (
              editMembers.map((m, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #e8ecf0' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: selectedArea.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: selectedArea.color }}>{m.name[0]}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input style={{ ...inputStyle, marginBottom: '4px', padding: '6px 10px' }} value={m.name} placeholder="이름" onChange={e => setEditMembers(prev => prev.map((item, idx) => idx === i ? { ...item, name: e.target.value } : item))} />
                    <input style={{ ...inputStyle, padding: '6px 10px', fontSize: '12px', color: '#6b7280' }} value={m.role} placeholder="직분 (예: 구역장, 팀원 등)" onChange={e => setEditMembers(prev => prev.map((item, idx) => idx === i ? { ...item, role: e.target.value } : item))} />
                  </div>
                  <button onClick={() => setEditMembers(prev => prev.filter((_, idx) => idx !== i))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#fee2e2', border: 'none', borderRadius: '8px', cursor: 'pointer', flexShrink: 0 }}>
                    <X size={15} color="#ef4444" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 새 구역원 추가 */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: `2px dashed ${selectedArea.color}`, padding: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedArea.color, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={14} /> 새 구역원 추가
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div>
                <label style={labelStyle}>이름 *</label>
                <input style={inputStyle} value={newMemberName} placeholder="이름 입력" onChange={e => setNewMemberName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} />
              </div>
              <div>
                <label style={labelStyle}>직분</label>
                <input style={inputStyle} value={newMemberRole} placeholder="구역장 / 팀원 등" onChange={e => setNewMemberRole(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMember()} />
              </div>
            </div>
            <button onClick={addMember} style={{ width: '100%', padding: '10px', background: selectedArea.color, color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <UserPlus size={15} /> 목록에 추가
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
