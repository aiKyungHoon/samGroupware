import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart } from 'recharts';
import { BookOpen, Radio, Users } from 'lucide-react';

// 3. 심야라디오 출결 (1월 ~ 12월)
const radioData = [
  { name: '1월', 출석자: 210, 출석률: 42, 증감: 0 },
  { name: '2월', 출석자: 230, 출석률: 46, 증감: 4 },
  { name: '3월', 출석자: 215, 출석률: 43, 증감: -3 },
  { name: '4월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '5월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '6월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '7월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '8월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '9월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '10월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '11월', 출석자: 0, 출석률: 0, 증감: 0 },
  { name: '12월', 출석자: 0, 출석률: 0, 증감: 0 },
];

const renderCustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const diff = payload[0].payload.증감;
    return (
      <div style={{ background: 'var(--surface-lowest)', padding: '12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-ambient)' }}>
        <p style={{ fontWeight: 800, marginBottom: '8px' }}>{label}</p>
        <p style={{ color: 'var(--primary)', fontSize: '13px', marginBottom: '4px' }}>출석 인원: <strong>{payload[0].value}명</strong></p>
        <p style={{ color: 'var(--tertiary)', fontSize: '13px', marginBottom: '8px' }}>재적 대비: <strong>{payload[1].value}%</strong></p>
        <p style={{ fontSize: '12px', color: diff > 0 ? '#10b981' : diff < 0 ? 'var(--error)' : 'var(--secondary)' }}>
          전월 대비 {Math.abs(diff)}% {diff > 0 ? '상승 ▲' : diff < 0 ? '하락 ▼' : '동일 -'}
        </p>
      </div>
    );
  }
  return null;
};

// 1. 인맞은 시험 미응시자 데이터
const missingExamData = [
  { name: '김철수', team: '해봄팀', reason: '건강 문제로 인한 결석' },
  { name: '이영희', team: '보라팀', reason: '직장 야근 (별도 일정 조율 중)' },
  { name: '박민준', team: '이음팀', reason: '군 복무 중' },
  { name: '최지윤', team: '이음팀', reason: '해외 출장 (장기)' },
];

// 2. 구역예배 취합 (1회도 못한 대상자 중심 모니터링)
const cellWorshipData = [
  { cell: '1구역', leader: '이하은', count: 4, reason: '-' },
  { cell: '2구역', leader: '김영진', count: 3, reason: '-' },
  { cell: '3구역', leader: '박서연', count: 0, reason: '구역원 전체 해외/지방 출장 극심, 줌(Zoom) 대체 논의 중' },
  { cell: '4구역', leader: '정우진', count: 4, reason: '-' },
  { cell: '5구역', leader: '한지혜', count: 0, reason: '주말 근무 형태 변경으로 모임 시간 조율 실패' },
];

export function Education() {
  const enrollment = 500;
  const examTakers = 385;
  const examRate = ((examTakers / enrollment) * 100).toFixed(1);

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>교육 관리</h1>
            <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>교육 수료 및 셀 예배 현황을 파악합니다.</p>
          </div>
          <button style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>+ 교육 등록</button>
        </div>
      </header>

      {/* Top Highlights */}
      <div className="responsive-flex" style={{ marginBottom: '32px' }}>
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--on-surface), #3e4c59)', color: 'white', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.9 }}>
            <BookOpen size={18} />
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>인맞은 시험 응시율</h3>
          </div>
          <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>{examRate}%</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>재적 {enrollment}명 중 {examTakers}명 응시 완료</div>
        </div>

        <div style={{ flex: 1, background: 'var(--surface-lowest)', color: 'var(--on-surface)', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--secondary)' }}>
             <Users size={18} />
             <h3 style={{ fontSize: '15px', fontWeight: 600 }}>이번 달 구역예배 실시율</h3>
           </div>
           <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>85.0%</div>
           <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>전체 20개 구역 중 17개 구역 진행</div>
        </div>

        <div style={{ flex: 1, background: 'var(--surface-lowest)', color: 'var(--on-surface)', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--secondary)' }}>
             <Radio size={18} />
             <h3 style={{ fontSize: '15px', fontWeight: 600 }}>이달 심야라디오 평균 출결</h3>
           </div>
           <div style={{ fontSize: '40px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>43.0%</div>
           <div style={{ fontSize: '13px', color: 'var(--error)' }}>전월 대비 -3.0% 하락 ▼</div>
        </div>
      </div>

      <div className="responsive-grid-1" style={{ marginBottom: '32px' }}>
        {/* 심야라디오 1~12월 달 차트 */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>월별 심야라디오 참석 추이 (1~12월)</h3>
              <p style={{ fontSize: '13px', color: 'var(--secondary)' }}>마우스를 올려 전월 대비 오르고 내린 증감률을 상세 확인하세요.</p>
            </div>
          </div>
          <div style={{ height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={radioData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}명`} fontSize={12} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} fontSize={12} domain={[0, 100]} />
                <Tooltip content={renderCustomTooltip} cursor={{ fill: 'var(--surface-low)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />
                
                <Bar yAxisId="left" dataKey="출석자" name="출석 인원 (명)" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="출석률" name="재적 대비 출석률 (%)" stroke="var(--tertiary)" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="responsive-grid-2">
        {/* 인맞은 시험 현황 */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>인맞은 시험 미응시자 및 사유</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>응시자 명단 보기</span>
          </div>
          
          <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>
              <span>전체 진행률 ({examTakers}명 / {enrollment}명)</span>
              <span style={{ color: 'var(--primary)' }}>{examRate}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--outline-variant)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${examRate}%`, height: '100%', background: 'var(--primary)' }}></div>
            </div>
          </div>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {missingExamData.map((data, idx) => (
              <li key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 0', borderBottom: idx !== missingExamData.length - 1 ? '1px solid var(--surface-low)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '15px' }}>{data.name} <span style={{ fontSize: '12px', color: 'var(--secondary)', fontWeight: 500 }}>({data.team})</span></strong>
                  <span style={{ fontSize: '12px', background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>미응시</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>사유: {data.reason}</div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* 구역예배 취합 현황 */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>구역예배 취합 현황 (이번 달)</h3>
            <span style={{ fontSize: '13px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>리스트 업데이트</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left', minWidth: '450px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)' }}>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>구역 (구역장)</th>
                  <th style={{ padding: '12px 0', fontWeight: 600, textAlign: 'center' }}>실시 횟수</th>
                  <th style={{ padding: '12px 0', fontWeight: 600 }}>1회도 못한 사유 (0회 미진행)</th>
                </tr>
              </thead>
              <tbody>
                {cellWorshipData.map((data, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--surface-low)' }}>
                    <td style={{ padding: '16px 0' }}>
                      <div style={{ fontWeight: 700 }}>{data.cell}</div>
                      <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{data.leader}</div>
                    </td>
                    <td style={{ padding: '16px 0', textAlign: 'center' }}>
                      <span style={{ fontWeight: 800, color: data.count === 0 ? 'var(--error)' : 'var(--on-surface)' }}>{data.count}회</span>
                    </td>
                    <td style={{ padding: '16px 0', color: 'var(--secondary)', fontSize: '13px', lineHeight: 1.4, maxWidth: '200px' }}>
                      {data.count === 0 ? <span style={{ color: '#991b1b', background: '#fee2e2', padding: '4px 8px', borderRadius: '4px', display: 'inline-block' }}>{data.reason}</span> : data.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
