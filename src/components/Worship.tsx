import { useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Check } from 'lucide-react';

/* ─────────── Types ─────────── */
interface WorshipAttendance {
  id: string;
  name: string;
  team: string;
  regular: { [key: string]: boolean }; // '09', '12', '15', '20'
  base: { [key: string]: boolean };    // '12', '17'
  note: string;
}

const weeklyData = [
  { name: '1주차', 출석률: 82 },
  { name: '2주차', 출석률: 86 },
  { name: '3주차', 출석률: 85 },
  { name: '4주차', 출석률: 91 },
  { name: '5주차', 출석률: 88 },
];

const mockAttendance: WorshipAttendance[] = [
  { id: '1', name: '김하영', team: '해봄팀', regular: { '09': true, '12': false, '15': false, '20': false }, base: { '12': false, '17': false }, note: '' },
  { id: '2', name: '박다솔', team: '보라팀', regular: { '09': false, '12': true, '15': false, '20': false }, base: { '12': false, '17': false }, note: '교관 활동' },
  { id: '3', name: '김선우B', team: '이음팀', regular: { '09': false, '12': false, '15': true, '20': false }, base: { '12': false, '17': false }, note: '' },
  { id: '4', name: '양재준', team: '해봄팀', regular: { '09': true, '12': false, '15': false, '20': false }, base: { '12': false, '17': true }, note: '대외협력' },
  { id: '5', name: '복서경', team: '보라팀', regular: { '09': false, '12': false, '15': false, '20': true }, base: { '12': false, '17': false }, note: '' },
];

export function Worship() {
  const [showDetailed, setShowDetailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState<WorshipAttendance[]>(mockAttendance);

  const filteredAttendance = attendance.filter((a: WorshipAttendance) => 
    a.name.includes(searchTerm) || a.team.includes(searchTerm)
  );

  const toggleRegular = (id: string, time: string) => {
    setAttendance((prev: WorshipAttendance[]) => prev.map((a: WorshipAttendance) => 
      a.id === id ? { ...a, regular: { ...a.regular, [time]: !a.regular[time] } } : a
    ));
  };

  const toggleBase = (id: string, time: string) => {
    setAttendance((prev: WorshipAttendance[]) => prev.map((a: WorshipAttendance) => 
      a.id === id ? { ...a, base: { ...a.base, [time]: !a.base[time] } } : a
    ));
  };

  const updateReason = (id: string, reason: string) => {
    setAttendance((prev: WorshipAttendance[]) => prev.map((a: WorshipAttendance) => 
      a.id === id ? { ...a, note: reason } : a
    ));
  };

  const isAttended = (a: WorshipAttendance) => {
    return Object.values(a.regular).some(v => v) || Object.values(a.base).some(v => v);
  };

  const getSlotCount = (type: 'regular' | 'base', time: string) => {
    return attendance.filter(a => type === 'regular' ? a.regular[time] : a.base[time]).length;
  };

  if (showDetailed) {
    return (
      <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
        <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>실시간 출석 체크</h1>
            <p style={{ color: 'var(--secondary)', fontSize: '14px' }}>성도들의 예배 참석 여부를 실시간으로 입력합니다.</p>
          </div>
          <button 
            onClick={() => setShowDetailed(false)}
            style={{ padding: '8px 16px', background: 'var(--surface-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
          >
            ← 뒤로가기
          </button>
        </header>

        {/* Detailed Attendance Table (Existing Table Code) */}
        <div style={{ background: 'var(--surface-lowest)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--on-surface)' }}>상세 출석부 (정규+거점)</h3>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
              <input 
                placeholder="이름 또는 팀 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', fontSize: '14px', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ background: 'var(--surface-low)', borderBottom: '1.5px solid var(--outline-variant)' }}>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>이름</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>소속</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 700, color: 'var(--primary)', textAlign: 'center' }} colSpan={4}>정규성전</th>
                  <th style={{ padding: '16px 12px', fontSize: '13px', fontWeight: 700, color: '#0ea5e9', textAlign: 'center' }} colSpan={2}>거점예배</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--on-surface)', textAlign: 'center' }}>종합(예배)</th>
                  <th style={{ padding: '16px 24px', fontSize: '13px', fontWeight: 700, color: 'var(--secondary)' }}>사유 (비고)</th>
                </tr>
                <tr style={{ background: 'var(--surface-low)', borderBottom: '1.5px solid var(--outline-variant)' }}>
                  <th colSpan={2}></th>
                  {['09', '12', '15', '20'].map(t => (
                    <th key={t} style={{ padding: '8px 4px', fontSize: '11px', fontWeight: 800, textAlign: 'center', color: 'var(--secondary)' }}>{t}</th>
                  ))}
                  {['12', '17'].map(t => (
                    <th key={t} style={{ padding: '8px 4px', fontSize: '11px', fontWeight: 800, textAlign: 'center', color: 'var(--secondary)' }}>{t}</th>
                  ))}
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((a: WorshipAttendance) => (
                  <tr key={a.id} style={{ borderBottom: '1px solid var(--outline-variant)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 700, color: 'var(--on-surface)' }}>{a.name}</td>
                    <td style={{ padding: '16px 12px', fontSize: '13px', color: 'var(--secondary)' }}>{a.team}</td>
                    {['09', '12', '15', '20'].map(t => (
                      <td key={t} style={{ padding: '8px 4px', textAlign: 'center' }}>
                        <button 
                          onClick={() => toggleRegular(a.id, t)}
                          style={{ border: 'none', background: a.regular[t] ? 'var(--primary)' : '#e5e7eb', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        >
                          {a.regular[t] && <Check size={14} color="white" strokeWidth={3} />}
                        </button>
                      </td>
                    ))}
                    {['12', '17'].map(t => (
                      <td key={t} style={{ padding: '8px 4px', textAlign: 'center' }}>
                        <button 
                          onClick={() => toggleBase(a.id, t)}
                          style={{ border: 'none', background: a.base[t] ? '#0ea5e9' : '#e5e7eb', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                        >
                          {a.base[t] && <Check size={14} color="white" strokeWidth={3} />}
                        </button>
                      </td>
                    ))}
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: isAttended(a) ? '#dcfce7' : '#fee2e2', color: isAttended(a) ? '#166534' : '#991b1b', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 800 }}>
                        {isAttended(a) ? '출석' : '결석'}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <input 
                        value={a.note}
                        onChange={(e) => updateReason(a.id, e.target.value)}
                        placeholder="사유 입력..."
                        style={{ width: '100%', minWidth: '150px', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--outline-variant)', fontSize: '12px', outline: 'none' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button onClick={() => setShowDetailed(false)} style={{ padding: '8px 24px', background: 'var(--on-surface)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>저장 및 브리핑 작성</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>예배 관리</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>상암지역 전체 예배 출석 현황을 관리합니다.</p>
        </div>
        <button 
          onClick={() => setShowDetailed(true)}
          style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
        >
          + 출석 체크하기
        </button>
      </header>

      {/* Main Page Stats */}
      <div className="responsive-grid-2" style={{ marginBottom: '32px' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--primary), #3b82f6)', color: 'white', padding: '32px 24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, opacity: 0.9, marginBottom: '8px' }}>상암지역 주일예배 출석률</h3>
          <div style={{ fontSize: '44px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '4px' }}>87.5%</div>
          <div style={{ fontSize: '13px', opacity: 0.8 }}>지난주 대비 +3.2% 상승</div>
        </div>

        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>매월 주차별 예배 출석률</h3>
          <div style={{ height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--outline-variant)" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} />
                <Tooltip cursor={{ fill: 'var(--surface-low)' }} />
                <Bar dataKey="출석률" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="responsive-grid-2" style={{ gap: '24px' }}>
        {/* Regular Worship Slot Summary */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }}></span>
            정규성전 (09, 12, 15, 20)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {['09', '12', '15', '20'].map(t => (
              <div key={t} style={{ background: 'var(--surface-low)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '4px' }}>{t}:00 타임</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{getSlotCount('regular', t)}<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--secondary)', marginLeft: '2px' }}>명</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Base Worship Slot Summary */}
        <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '4px', height: '18px', background: '#0ea5e9', borderRadius: '2px' }}></span>
            거점예배 (12, 17)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {['12', '17'].map(t => (
              <div key={t} style={{ background: 'var(--surface-low)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: 'var(--secondary)', marginBottom: '4px' }}>{t}:00 타임</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: '#0ea5e9' }}>{getSlotCount('base', t)}<span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--secondary)', marginLeft: '2px' }}>명</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
