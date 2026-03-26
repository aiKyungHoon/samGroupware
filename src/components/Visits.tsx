import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HeartHandshake, ShieldCheck, TrendingUp, UserPlus } from 'lucide-react';

const visitStats = [
  { name: '1월', 심방횟수: 45 },
  { name: '2월', 심방횟수: 52 },
  { name: '3월', 심방횟수: 68 },
  { name: '4월', 심방횟수: 35 },
  { name: '5월', 심방횟수: 28 },
  { name: '6월', 심방횟수: 42 },
];

const coverageData = [
  { name: '심방 완료', value: 65, color: 'var(--primary)' },
  { name: '미심방', value: 35, color: 'var(--surface-high)' },
];

const recentLogs = [
  { name: '김지민 성도', date: '2026.03.24', type: '위로/병가', summary: '수술 후 가택 요양 중, 빠른 회복을 위한 기도 요청.' },
  { name: '박태양 청년', date: '2026.03.22', type: '새가족 케어', summary: '신앙 생활 가이드 및 정착 상담 완료. 보라팀 배정.' },
  { name: '최현우 장로', date: '2026.03.20', type: '가정 심방', summary: '사업장 이전 감사 예배 및 축복 심방.' },
];

export function Visits() {
  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>심방 관리</h1>
            <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>교구원 심방 기록 및 일정을 관리합니다.</p>
          </div>
          <button style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>+ 심방 보고서 작성</button>
        </div>
      </header>

      {/* Top Highlights */}
      <div className="responsive-flex" style={{ marginBottom: '32px' }}>
        <div style={{ flex: 1, background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '12px' }}>
            <HeartHandshake size={18} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>이번 달 전체 심방 건수</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>86건</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>전월 대비 +12% 증가 ▲</div>
        </div>

        <div style={{ flex: 1, background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderLeft: '4px solid var(--tertiary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '12px' }}>
            <TrendingUp size={18} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>심방 커버리지 (재적 대비)</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>65.0%</div>
          <div style={{ fontSize: '12px', color: 'var(--secondary)', marginTop: '4px' }}>재적 500명 중 325명 방문 완료</div>
        </div>

        <div style={{ flex: 1, background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '12px' }}>
            <UserPlus size={18} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>집중 케어 필요 대상자</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800 }}>12명</div>
          <div style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>장기 결석 2주 이상 증후군</div>
        </div>
      </div>

      <div className="responsive-grid-2" style={{ marginBottom: '32px' }}>
        {/* Visit Statistics Chart */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>월간 심방 횟수 추이</h3>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visitStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip cursor={{ fill: 'var(--surface-low)' }} />
                <Bar dataKey="심방횟수" name="심방 횟수" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coverage Pie Chart */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>재적 대비 심방 완료 비율</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={coverageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {coverageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800 }}>65%</div>
              <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>커버리지</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '13px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }}></div> 완료</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: 'var(--surface-high)', borderRadius: '2px' }}></div> 미완료</div>
          </div>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* Quick Log Input */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>심방 일지 빠른 기록</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input placeholder="대상자 이름" style={{ flex: 1, padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px' }} />
            <select style={{ padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '14px', background: 'white' }}>
              <option>일반 심방</option>
              <option>새가족 케어</option>
              <option>위로/환우</option>
              <option>경조사</option>
            </select>
          </div>
          <textarea 
            placeholder="상담 내용을 기록하세요. (자동 암호화 저장)" 
            style={{ width: '100%', height: '160px', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '15px', fontFamily: 'var(--font-body)', resize: 'none', marginBottom: '16px', background: 'var(--surface-low)' }}
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 500 }}>
              <ShieldCheck size={16} />
              보안 서버 저장 활성
            </div>
            <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>보고서 저장</button>
          </div>
        </div>

        {/* Recent Activity List */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>최근 심방 기록</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>전체 보기</span>
          </div>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentLogs.map((log, idx) => (
              <li key={idx} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-high)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ fontSize: '15px' }}>{log.name}</strong>
                  <span style={{ color: 'var(--secondary)', fontSize: '11px' }}>{log.date}</span>
                </div>
                <div style={{ display: 'inline-block', fontSize: '11px', background: 'var(--secondary-container)', color: 'var(--on-secondary-container)', padding: '2px 8px', borderRadius: '10px', marginBottom: '8px' }}>
                  {log.type}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--secondary)', lineHeight: 1.5 }}>
                  {log.summary}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
