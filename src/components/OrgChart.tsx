import { ArrowDown, Network, Users } from 'lucide-react';

const teamData = [
  { name: '보라팀', leader: '김규리', count: 50, color: '#8b5cf6', bgColor: '#f3e8ff', areas: ['1구역', '2구역', '3구역', '4구역', '5구역'] },
  { name: '이음팀', leader: '김주영a', count: 55, color: '#3b82f6', bgColor: '#dbeafe', areas: ['6구역', '7구역', '8구역', '9구역', '10구역'] },
  { name: '해봄팀', leader: '김반디', count: 45, color: '#f59e0b', bgColor: '#fef3c7', areas: ['11구역', '12구역', '13구역', '14구역', '15구역'] },
];

export function OrgChart() {
  const totalMembers = teamData.reduce((acc, team) => acc + team.count, 0);

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>상암 조직도</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>팀별/구역별 조직 구성 및 인원 현황 (총 {totalMembers}명)</p>
        </div>
        <button style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>+ 명단 수정</button>
      </header>

      {/* 실질적 조직도 트리 컨테이너 */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* 상단 3단 레이아웃: 전도 - 임원 - 날개 */}
        <div className="responsive-grid-3" style={{ width: '100%', alignItems: 'start', marginBottom: '16px' }}>
          
          {/* 전도 (Left) */}
          <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: '4px solid var(--outline-variant)' }}>
            <div style={{ display: 'inline-block', background: 'var(--surface-high)', padding: '4px 12px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>전도</div>
            <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>지역장</span><strong style={{ fontSize: '16px' }}>김하영</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>전도교관</span><strong style={{ fontSize: '16px' }}>박다솔</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>전도서기</span><strong style={{ fontSize: '16px' }}>김선우B</strong></li>
              <li style={{ display: 'flex', flexDirection: 'column' }}><span style={{ color: 'var(--secondary)', fontSize: '12px' }}>대외협력교관</span><strong style={{ fontSize: '16px' }}>양재준</strong></li>
            </ul>
          </div>

          {/* 임원 (Center) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--on-surface), #3e4c59)', color: 'white', padding: '24px 48px', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-ambient)' }}>
              <div style={{ fontSize: '15px', opacity: 0.9, marginBottom: '6px' }}>임원</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>한민지</div>
            </div>
            {/* 연결 화살표 라인 */}
            <div style={{ height: '40px', width: '2px', background: 'var(--outline-variant)', margin: '16px 0 0 0' }}></div>
            <ArrowDown size={24} color="var(--outline-variant)" style={{ marginBottom: '16px' }} />
          </div>

          {/* 날개 (Right) */}
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

        {/* 양때 팀장 연결 타이틀 허브 */}
        <div style={{ background: 'var(--surface-low)', padding: '12px 32px', borderRadius: 'var(--radius-full)', fontWeight: 800, fontSize: '22px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Network size={24} color="var(--primary)" />
          양때 팀장
        </div>

        {/* 하단 3개 팀(Team Branches) 및 구역 리스트 */}
        <div className="responsive-grid-3" style={{ width: '100%', paddingBottom: '40px' }}>
          {teamData.map((team, idx) => (
            <div key={idx} style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderTop: `6px solid ${team.color}` }}>
              <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '1px solid var(--surface-low)', paddingBottom: '16px' }}>
                <div style={{ fontSize: '15px', color: 'var(--secondary)', marginBottom: '4px' }}>{team.name}</div>
                <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{team.leader} <span style={{fontSize: '14px', fontWeight: 500, color: 'var(--secondary)'}}>팀장</span></div>
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
    </div>
  )
}
