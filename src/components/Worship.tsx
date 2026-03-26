import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const weeklyData = [
  { name: '1주차', 출석률: 82 },
  { name: '2주차', 출석률: 86 },
  { name: '3주차', 출석률: 85 },
  { name: '4주차', 출석률: 91 },
  { name: '5주차', 출석률: 88 },
];

const teamData = [
  { team: '해봄팀', rate: '94%', absent: 1, reasons: ['개인사정(1)'] },
  { team: '보라팀', rate: '85%', absent: 3, reasons: ['경조사(1)', '야근 및 철야(2)'] },
  { team: '이음팀', rate: '89%', absent: 2, reasons: ['출장(1)', '병가(1)'] },
];

export function Worship() {
  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>예배 관리</h1>
            <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>상암지역 전체 예배 출석 현황을 관리합니다.</p>
          </div>
          <button style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>+ 출석 체크</button>
        </div>
      </header>

      {/* Top Highlights */}
      <div className="responsive-flex" style={{ marginBottom: '24px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'white', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>상암지역 주일예배 출석률</h3>
          <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>87.5%</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>지난주 대비 +3.2% 상승</div>
        </div>
      </div>

      <div className="responsive-grid-2">

        {/* Left: Monthly Graph */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>매월 주차별 예배 출석률</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{ fill: 'var(--surface-low)' }} />
                <Bar dataKey="출석률" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Team Attendance & Reasons */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>팀별 예배 출석 및 사유 현황</h3>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teamData.map((data, idx) => (
              <li key={idx} style={{ background: 'var(--surface-low)', padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '16px' }}>{data.team}</strong>
                  <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '18px' }}>{data.rate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--error)', fontWeight: 600 }}>결석: {data.absent}명</span>
                  <span style={{ color: 'var(--secondary)' }}>{data.reasons.join(', ')}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
