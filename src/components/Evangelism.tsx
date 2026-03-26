import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';

const monthlyEvangelismData = [
  { name: '1월', 전도인원: 12, 전도율: 2.4 },
  { name: '2월', 전도인원: 8, 전도율: 1.6 },
  { name: '3월', 전도인원: 15, 전도율: 3.0 },
  { name: '4월', 전도인원: 0, 전도율: 0 },
  { name: '5월', 전도인원: 0, 전도율: 0 },
  { name: '6월', 전도인원: 0, 전도율: 0 },
  { name: '7월', 전도인원: 0, 전도율: 0 },
  { name: '8월', 전도인원: 0, 전도율: 0 },
  { name: '9월', 전도인원: 0, 전도율: 0 },
  { name: '10월', 전도인원: 0, 전도율: 0 },
  { name: '11월', 전도인원: 0, 전도율: 0 },
  { name: '12월', 전도인원: 0, 전도율: 0 },
];

const teamVipData = [
  { team: '해봄팀', vips: 12, converted: 3 },
  { team: '보라팀', vips: 8, converted: 1 },
  { team: '이음팀', vips: 15, converted: 4 },
];

export function Evangelism() {
  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>전도 관리</h1>
            <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>새가족 전도 및 정착 현황을 관리합니다.</p>
          </div>
          <button style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>+ 새가족 등록</button>
        </div>
      </header>

      {/* Top Highlights */}
      <div className="responsive-flex" style={{ marginBottom: '32px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary), var(--primary-container))', color: 'white', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>올해 누적 전도율 (재적 대비)</h3>
          <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>7.0%</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>현재 총 재적: 500명 기준</div>
        </div>
        <div style={{ flex: 1, background: 'var(--surface-lowest)', color: 'var(--on-surface)', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
           <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '8px' }}>올해 누적 전도 인원</h3>
           <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>35명</div>
           <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>지난 해 동기간 대비 +12명 증가</div>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Left: Monthly Chart (1-12월) */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>월별 전도 인원 및 재적 대비 전도율</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyEvangelismData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}명`} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} fontSize={12} />
                <Tooltip cursor={{ fill: 'var(--surface-low)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px' }} />
                <Bar yAxisId="left" dataKey="전도인원" name="전도 인원 (명)" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                <Line yAxisId="right" type="monotone" dataKey="전도율" name="재적 대비 전도율 (%)" stroke="var(--tertiary)" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Right: Team VIP Table */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>팀별 전도 대상자(VIP) 현황</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>상세 보기</span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {teamVipData.map((data, idx) => (
              <li key={idx} style={{ background: 'var(--surface-low)', padding: '16px 20px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '16px' }}>{data.team}</strong>
                  <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '16px' }}>{data.converted}명 정착</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--secondary)' }}>집중 케어 중인 VIP: {data.vips}명</span>
                </div>
                <div style={{ marginTop: '12px', height: '4px', background: 'var(--outline-variant)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${(data.converted / data.vips) * 100}%`, height: '100%', background: 'var(--primary)' }}></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
