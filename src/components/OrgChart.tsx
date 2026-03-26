import { useState } from 'react';
import { ArrowDown, Network, Users, X, Save } from 'lucide-react';

type TeamData = {
  name: string;
  leader: string;
  count: number;
  color: string;
  bgColor: string;
  areas: string[];
};

const initialTeamData: TeamData[] = [
  { name: '보라팀', leader: '김규리', count: 50, color: '#8b5cf6', bgColor: '#f3e8ff', areas: ['1구역', '2구역', '3구역', '4구역', '5구역'] },
  { name: '이음팀', leader: '김주영a', count: 55, color: '#3b82f6', bgColor: '#dbeafe', areas: ['6구역', '7구역', '8구역', '9구역', '10구역'] },
  { name: '해봄팀', leader: '김반디', count: 45, color: '#f59e0b', bgColor: '#fef3c7', areas: ['11구역', '12구역', '13구역', '14구역', '15구역'] },
];

export function OrgChart() {
  const [teams, setTeams] = useState<TeamData[]>(initialTeamData);
  const [showModal, setShowModal] = useState(false);
  const [editTeams, setEditTeams] = useState<TeamData[]>([]);

  const totalMembers = teams.reduce((acc, team) => acc + team.count, 0);

  const handleOpenModal = () => {
    setEditTeams(teams.map(t => ({ ...t, areas: [...t.areas] })));
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  const handleTeamChange = (idx: number, field: keyof TeamData, value: string | number) => {
    setEditTeams(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const handleAreaChange = (teamIdx: number, areaIdx: number, value: string) => {
    setEditTeams(prev => prev.map((t, i) => {
      if (i !== teamIdx) return t;
      const newAreas = [...t.areas];
      newAreas[areaIdx] = value;
      return { ...t, areas: newAreas };
    }));
  };

  const handleSave = () => {
    setTeams(editTeams.map(t => ({ ...t })));
    setShowModal(false);
  };

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>상암 조직도</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>팀별/구역별 조직 구성 및 인원 현황 (총 {totalMembers}명)</p>
        </div>
        <button
          onClick={handleOpenModal}
          style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
        >
          + 명단 수정
        </button>
      </header>

      {/* 조직도 트리 */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="responsive-grid-3" style={{ width: '100%', alignItems: 'start', marginBottom: '16px' }}>
          {/* 전도 */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'inline-block', background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>전도</div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>지역장</span><strong style={{ fontSize: '16px' }}>김하영</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>전도교관</span><strong style={{ fontSize: '16px' }}>박다솔</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>전도서기</span><strong style={{ fontSize: '16px' }}>김선우B</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>대외협력교관</span><strong style={{ fontSize: '16px' }}>양재준</strong></li>
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
            <div style={{ display: 'inline-block', background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>날개</div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>지역서기</span><strong style={{ fontSize: '16px' }}>복서경</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>교육팀장</span><strong style={{ fontSize: '16px' }}>김성준</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>문화팀장</span><strong style={{ fontSize: '16px' }}>이여진</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>회계팀장</span><strong style={{ fontSize: '16px' }}>유승우</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>심방팀장</span><strong style={{ fontSize: '16px' }}>박미연</strong></li>
            </ul>
          </div>
        </div>

        {/* 양때 팀장 허브 */}
        <div style={{ background: 'var(--surface-low)', padding: '12px 32px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '22px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={24} color="var(--primary)" />
          양때 팀장
        </div>

        {/* 팀 카드 */}
        <div className="responsive-grid-3" style={{ width: '100%', paddingBottom: '40px' }}>
          {teams.map((team, idx) => (
            <div key={idx} style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: `6px solid ${team.color}` }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--surface-low)', paddingBottom: '16px' }}>
                <div style={{ fontSize: '15px', color: 'var(--secondary)', marginBottom: '4px' }}>{team.name}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{team.leader} <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--secondary)' }}>팀장</span></div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: team.color, background: team.bgColor, padding: '6px 16px', borderRadius: 'var(--radius-full)' }}>
                  <Users size={14} />
                  팀 인원: 총 {team.count}명
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

      {/* 명단 수정 모달 */}
      {showModal && (
        <div
          onClick={handleClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--surface)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '720px',
              maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.3)'
            }}
          >
            {/* 모달 헤더 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', borderBottom: '1px solid var(--outline-variant)', position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 1 }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--on-surface)' }}>명단 수정</h2>
                <p style={{ fontSize: '13px', color: 'var(--secondary)', marginTop: '2px' }}>팀 이름, 팀장, 인원 수, 구역명을 수정할 수 있습니다.</p>
              </div>
              <button onClick={handleClose} style={{ background: 'var(--surface-low)', border: 'none', borderRadius: 'var(--radius-md)', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={20} color="var(--on-surface)" />
              </button>
            </div>

            {/* 모달 본문 */}
            <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {editTeams.map((team, tIdx) => (
                <div key={tIdx} style={{ border: `2px solid ${team.color}`, borderRadius: 'var(--radius-lg)', padding: '20px', background: 'var(--surface-lowest)' }}>
                  <div style={{ display: 'inline-block', background: team.bgColor, color: team.color, padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
                    {team.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '4px' }}>팀 이름</label>
                      <input
                        value={team.name}
                        onChange={e => handleTeamChange(tIdx, 'name', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', fontSize: '14px', fontWeight: 600, boxSizing: 'border-box', color: 'var(--on-surface)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '4px' }}>팀장 이름</label>
                      <input
                        value={team.leader}
                        onChange={e => handleTeamChange(tIdx, 'leader', e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', fontSize: '14px', fontWeight: 600, boxSizing: 'border-box', color: 'var(--on-surface)' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '4px' }}>팀 인원 수</label>
                      <input
                        type="number"
                        value={team.count}
                        onChange={e => handleTeamChange(tIdx, 'count', parseInt(e.target.value) || 0)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', fontSize: '14px', fontWeight: 600, boxSizing: 'border-box', color: 'var(--on-surface)' }}
                      />
                    </div>
                  </div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--secondary)', fontWeight: 600, marginBottom: '8px' }}>구역 이름 ({team.areas.length}개)</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                    {team.areas.map((area, aIdx) => (
                      <input
                        key={aIdx}
                        value={area}
                        onChange={e => handleAreaChange(tIdx, aIdx, e.target.value)}
                        style={{ padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', background: 'var(--surface)', fontSize: '13px', fontWeight: 600, textAlign: 'center', color: 'var(--on-surface)' }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 모달 푸터 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 28px', borderTop: '1px solid var(--outline-variant)', position: 'sticky', bottom: 0, background: 'var(--surface)' }}>
              <button
                onClick={handleClose}
                style={{ padding: '10px 24px', background: 'var(--surface-low)', color: 'var(--on-surface)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                취소
              </button>
              <button
                onClick={handleSave}
                style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Save size={16} />
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
