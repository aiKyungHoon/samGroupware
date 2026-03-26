import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const weeklyData = [
  { name: '1주차', 십일조: 80, 청체비: 70 },
  { name: '2주차', 십일조: 85, 청체비: 75 },
  { name: '3주차', 십일조: 82, 청체비: 72 },
  { name: '4주차', 십일조: 88, 청체비: 78 },
  { name: '5주차', 십일조: 83, 청체비: 75 },
];

const teamPaymentData = [
  { team: '해봄팀', titheRate: '90%', cheongRate: '85%', unpaidCount: 2, unpaidMembers: ['김철수', '박영희'] },
  { team: '보라팀', titheRate: '85%', cheongRate: '70%', unpaidCount: 1, unpaidMembers: ['이지은'] },
  { team: '이음팀', titheRate: '70%', cheongRate: '60%', unpaidCount: 3, unpaidMembers: ['홍길동', '최민수', '정유진'] },
];

export function Accounting() {
  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between' }}>
        <div>
           <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>회계 관리</h1>
           <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>교구 재정 및 청체비 납부 현황을 관리합니다.</p>
        </div>
        <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>+ 납부 체크</button>
      </header>

      {/* Top Highlights */}
      <div className="responsive-flex" style={{ marginBottom: '24px', gap: '16px' }}>
        {/* 십일조 납부율 */}
        <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'white', padding: '28px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>이번 달 십일조 재적 납부율</h3>
          <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>82.5%</div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>전월 대비 +2.1% 상승</div>
        </div>

        {/* 청체비 납부율 */}
        <div style={{ flex: '1 1 300px', background: 'var(--surface-lowest)', color: 'var(--on-surface)', padding: '28px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '8px' }}>이번 달 청체비 재적 납부율</h3>
          <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>75.0%</div>
          <div style={{ fontSize: '14px', color: 'var(--error)', fontWeight: 600 }}>전월 대비 -1.5% 감소</div>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Left: Monthly Graph */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>주차별 십일조 및 청체비 납부율</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: 'var(--surface-low)'}} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="십일조" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="청체비" fill="var(--secondary)" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Right: Team Payment Status */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>팀별 납부 현황</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px', listStyle: 'none', padding: 0, margin: 0 }}>
             {teamPaymentData.map((data, idx) => (
                 <li key={idx} style={{ background: 'var(--surface-low)', padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '16px' }}>{data.team}</strong>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        십일조 <span style={{ color: 'var(--primary)' }}>{data.titheRate}</span> <span style={{ opacity: 0.3, margin: '0 4px' }}>|</span> 청체비 <span style={{ color: 'var(--secondary)' }}>{data.cheongRate}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px', borderTop: '1px solid var(--outline-variant)', paddingTop: '8px', opacity: 0.8 }}>
                      <span style={{ color: 'var(--error)', fontWeight: 600 }}>미납: {data.unpaidCount}명</span>
                      <span style={{ color: 'var(--secondary)' }}>{data.unpaidMembers.join(', ')}</span>
                    </div>
                 </li>
             ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
