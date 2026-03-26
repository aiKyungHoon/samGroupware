import { useState, useEffect } from 'react';
import { ArrowDown, Network, Users, X, Save, Pencil } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';

/* ─────────── Types ─────────── */
type NamedRole = { role: string; name: string };
type TeamData = { name: string; leader: string; count: number; color: string; bgColor: string; areas: string[] };

/* ─────────── Default Data (used when DB is empty) ─────────── */
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

/* ─────────── Reusable Modal Shell ─────────── */
function Modal({ title, subtitle, onClose, onSave, children }: {
  title: string; subtitle: string; onClose: () => void; onSave: () => void; children: React.ReactNode;
}) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,40,0.82)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e8ecf0', position: 'sticky', top: 0, background: '#ffffff', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>{title}</h2>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', display: 'flex' }}>
            <X size={18} color="#374151" />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 24px', background: '#f9fafb' }}>{children}</div>
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', borderTop: '1px solid #e8ecf0', position: 'sticky', bottom: 0, background: '#ffffff' }}>
          <button onClick={onClose} style={{ padding: '9px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>취소</button>
          <button onClick={onSave} style={{ padding: '9px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)',
  border: '1.5px solid #d1d5db', background: '#ffffff',
  fontSize: '14px', fontWeight: 600, boxSizing: 'border-box', color: '#111827',
};
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '4px' };

function EditBtn({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 12px', background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary)' }}
    >
      <Pencil size={13} /> 수정
    </button>
  );
}

/* ─────────── Main Component ─────────── */
export function OrgChart() {
  const [jeondo, setJeondo] = useState<NamedRole[]>(defaultJeondo);
  const [nalgae, setNalgae] = useState<NamedRole[]>(defaultNalgae);
  const [teams, setTeams] = useState<TeamData[]>(defaultTeams);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState<'jeondo' | 'nalgae' | 'teams' | null>(null);
  const [editJeondo, setEditJeondo] = useState<NamedRole[]>([]);
  const [editNalgae, setEditNalgae] = useState<NamedRole[]>([]);
  const [editTeams, setEditTeams] = useState<TeamData[]>([]);

  /* ─── Firebase: Load on mount ─── */
  useEffect(() => {
    const jeondoRef = ref(db, 'orgchart/jeondo');
    const nalgaeRef = ref(db, 'orgchart/nalgae');
    const teamsRef = ref(db, 'orgchart/teams');

    let loaded = 0;
    const markLoaded = () => { loaded++; if (loaded === 3) setLoading(false); };

    const unsub1 = onValue(jeondoRef, snap => {
      if (snap.exists()) setJeondo(snap.val());
      markLoaded();
    });
    const unsub2 = onValue(nalgaeRef, snap => {
      if (snap.exists()) setNalgae(snap.val());
      markLoaded();
    });
    const unsub3 = onValue(teamsRef, snap => {
      if (snap.exists()) setTeams(snap.val());
      markLoaded();
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, []);

  const totalMembers = teams.reduce((acc, t) => acc + t.count, 0);

  const open = (which: typeof modal) => {
    if (which === 'jeondo') setEditJeondo(jeondo.map(r => ({ ...r })));
    if (which === 'nalgae') setEditNalgae(nalgae.map(r => ({ ...r })));
    if (which === 'teams') setEditTeams(teams.map(t => ({ ...t, areas: [...t.areas] })));
    setModal(which);
  };
  const close = () => setModal(null);

  /* ─── Firebase: Save ─── */
  const saveJeondo = async () => { await set(ref(db, 'orgchart/jeondo'), editJeondo); close(); };
  const saveNalgae = async () => { await set(ref(db, 'orgchart/nalgae'), editNalgae); close(); };
  const saveTeams = async () => { await set(ref(db, 'orgchart/teams'), editTeams); close(); };

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
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>상암 조직도</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>팀별/구역별 조직 구성 및 인원 현황 (총 {totalMembers}명)</p>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Top 3-column row */}
        <div className="responsive-grid-3" style={{ width: '100%', alignItems: 'start', marginBottom: '16px' }}>

          {/* 전도 */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'inline-block', background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700 }}>전도</div>
              <EditBtn onClick={() => open('jeondo')} />
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
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
              <div style={{ display: 'inline-block', background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700 }}>날개</div>
              <EditBtn onClick={() => open('nalgae')} />
            </div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
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
          <button
            onClick={() => open('teams')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 14px', background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary)' }}
          >
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {team.areas.map(area => (
                  <div key={area} style={{ padding: '10px 16px', background: 'var(--surface-low)', borderRadius: 'var(--radius-full)', fontSize: '14px', fontWeight: 600 }}>{area}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Modal: 전도 수정 ─── */}
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

      {/* ─── Modal: 날개 수정 ─── */}
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

      {/* ─── Modal: 양때 팀장 (Teams) 수정 ─── */}
      {modal === 'teams' && (
        <Modal title="양때 팀장 명단 수정" subtitle="팀 이름, 팀장, 인원 수, 구역명을 수정합니다." onClose={close} onSave={saveTeams}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {editTeams.map((team, tIdx) => (
              <div key={tIdx} style={{ border: `2px solid ${team.color}`, borderRadius: 'var(--radius-lg)', padding: '18px', background: '#fff' }}>
                <div style={{ display: 'inline-block', background: team.bgColor, color: team.color, padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700, marginBottom: '14px' }}>
                  {team.name}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <label style={labelStyle}>팀 이름</label>
                    <input style={inputStyle} value={team.name} onChange={e => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, name: e.target.value } : t))} />
                  </div>
                  <div>
                    <label style={labelStyle}>팀장 이름</label>
                    <input style={inputStyle} value={team.leader} onChange={e => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, leader: e.target.value } : t))} />
                  </div>
                  <div>
                    <label style={labelStyle}>인원 수</label>
                    <input type="number" style={inputStyle} value={team.count} onChange={e => setEditTeams(prev => prev.map((t, i) => i === tIdx ? { ...t, count: parseInt(e.target.value) || 0 } : t))} />
                  </div>
                </div>
                <label style={labelStyle}>구역 이름 ({team.areas.length}개)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {team.areas.map((area, aIdx) => (
                    <input key={aIdx} style={{ ...inputStyle, textAlign: 'center', padding: '8px 4px' }} value={area}
                      onChange={e => setEditTeams(prev => prev.map((t, i) => {
                        if (i !== tIdx) return t;
                        const a = [...t.areas]; a[aIdx] = e.target.value; return { ...t, areas: a };
                      }))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
