import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Search, Check } from 'lucide-react';

/* ─────────── Types ─────────── */
interface WorshipAttendance {
  id: string;
  name: string;
  team: string;
  cell: string;
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

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVBiwqf-bMs28m6Kw25Pe5T1QRbczpCSAEBCWRjw1ono4AuC-RShiVvvYnPDdqjm_293knKViblbOl/pub?gid=1668494611&single=true&output=csv';

let worshipDataLoaded = false;
let globalWorshipAttendance: WorshipAttendance[] = [];

export function Worship({ user, teamName }: { user?: any; teamName?: string }) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date & Team Selectors State
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedWeek, setSelectedWeek] = useState('1주차');
  const [selectedCell, setSelectedCell] = useState('전체');
  
  // Compute allowed teams for this user
  const roles = user?.roles || [];
  const isMaster = roles.includes('master') || user?.role === 'admin';
  
  let initialTeam = teamName || '전체';
  if (!isMaster && !teamName) {
    if (roles.includes('team_bora')) initialTeam = '보라팀';
    else if (roles.includes('team_haebom')) initialTeam = '해봄팀';
    else if (roles.includes('team_ieum')) initialTeam = '이음팀';
  }
  const [selectedTeam, setSelectedTeam] = useState(initialTeam);
  
  // Update selectedTeam when teamName prop changes
  useEffect(() => {
    setSelectedTeam(teamName || initialTeam);
  }, [teamName, initialTeam]);

  const [attendance, setAttendance] = useState<WorshipAttendance[]>(globalWorshipAttendance);
  // const [loading, setLoading] = useState(!worshipDataLoaded); // Removed unused state

  useEffect(() => {
    if (worshipDataLoaded) return;
    const fetchCSV = async () => {
      try {
        const res = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await res.text();
        const rows = csvText.split('\n').map(line => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && line[i+1] === '"') { current += '"'; i++; }
            else if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
            else current += char;
          }
          result.push(current.trim());
          return result;
        });

        const newAttendance = rows.filter(r => r.length >= 5 && r[4] && r[4] !== '이름').map((r, idx) => ({
          id: `w_${idx}`,
          name: r[4],
          team: r[1] ? r[1] + '팀' : '소속없음',
          cell: r[2] || '-',
          regular: { '09': false, '12': false, '15': false, '20': false },
          base: { '12': false, '17': false },
          note: ''
        }));
        
        globalWorshipAttendance = newAttendance;
        worshipDataLoaded = true;
        setAttendance(newAttendance);
        // setLoading(false);
      } catch (err) {
        console.error(err);
        // setLoading(false);
      }
    };
    fetchCSV();
  }, []);

  const filteredAttendance = attendance.filter((a: WorshipAttendance) => {
    // 1. Team Filter
    if (selectedTeam !== '전체' && a.team !== selectedTeam) return false;
    // 2. Cell Filter
    if (selectedCell !== '전체' && a.cell !== selectedCell) return false;
    // 3. Search Filter
    if (searchTerm && !a.name.includes(searchTerm) && !a.team.includes(searchTerm)) return false;
    
    return true;
  });

  // Dynamically get available cells for the selected team
  const availableCells = Array.from(new Set(
    attendance
      .filter(a => selectedTeam === '전체' || a.team === selectedTeam)
      .map(a => a.cell)
  )).sort((a, b) => {
    // Natural sort for "1구역", "2구역", etc.
    const aNum = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const bNum = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return aNum - bNum || a.localeCompare(b);
  });

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
    return filteredAttendance.filter(a => type === 'regular' ? a.regular[time] : a.base[time]).length;
  };

  return (
    <div style={{ padding: teamName ? '16px 0' : '32px', flex: 1, overflowY: 'auto' }}>
      {/* 팝업 모달 */}
      {showDetailed && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '1200px', height: '85vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* 팝업 헤더 */}
            <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--surface-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-lowest)' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--on-surface)' }}>실시간 출석 입력 팝업</h1>
                <p style={{ color: 'var(--secondary)', fontSize: '14px', marginTop: '4px' }}>성도들의 예배 참석 여부를 구역별로 빠르게 체크합니다.</p>
              </div>
              <button 
                onClick={() => setShowDetailed(false)}
                style={{ padding: '8px 20px', background: 'var(--surface-low)', color: 'var(--on-surface)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                닫기 ✕
              </button>
            </header>

            {/* 팝업 내용 (스크롤 영역) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'var(--surface-low)' }}>
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', overflow: 'hidden' }}>
                
                {/* Controls Bar */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--on-surface)' }}>상세 출석부</h3>
                  
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {/* 구역 선택기 추가 */}
                    <select
                      value={selectedCell}
                      onChange={(e) => setSelectedCell(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', fontSize: '14px', outline: 'none', background: 'white' }}
                    >
                      <option value="전체">모든 구역</option>
                      {availableCells.map(cell => (
                        <option key={cell} value={cell}>{cell}</option>
                      ))}
                    </select>

                    {/* Month Selector */}
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', fontSize: '14px', outline: 'none', background: 'white' }}
                    >
                      <option value="2026-04">2026년 4월</option>
                      <option value="2026-05">2026년 5월</option>
                      <option value="2026-06">2026년 6월</option>
                    </select>

                    {/* Week Selector */}
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', fontSize: '14px', outline: 'none', background: 'white' }}
                    >
                      {[1, 2, 3, 4, 5].map(w => (
                        <option key={w} value={`${w}주차`}>{w}주차</option>
                      ))}
                    </select>

                    {/* Team Selector (팀 대시보드 내부면 비활성) */}
                    <select
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      disabled={!isMaster || !!teamName}
                      style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', fontSize: '14px', outline: 'none', background: (isMaster && !teamName) ? 'white' : 'var(--surface-low)', cursor: (isMaster && !teamName) ? 'pointer' : 'not-allowed' }}
                    >
                      {isMaster && !teamName && <option value="전체">전체 (모든 팀)</option>}
                      <option value="보라팀">보라팀</option>
                      <option value="해봄팀">해봄팀</option>
                      <option value="이음팀">이음팀</option>
                    </select>

                    <div style={{ position: 'relative', width: '200px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                      <input 
                        type="text" 
                        placeholder="이름 검색..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--outline-variant)', fontSize: '14px', outline: 'none' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ background: 'var(--surface-lowest)' }}>
                      <tr>
                        <th rowSpan={2} style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)', fontWeight: 600, width: '60px' }}>구역</th>
                        <th rowSpan={2} style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)', fontWeight: 600, width: '120px' }}>이름</th>
                        <th colSpan={4} style={{ padding: '12px 24px', borderBottom: '1px solid var(--surface-high)', textAlign: 'center', color: 'var(--primary)', fontWeight: 700, background: 'rgba(37, 99, 235, 0.03)' }}>정규성전 참석</th>
                        <th colSpan={2} style={{ padding: '12px 24px', borderBottom: '1px solid var(--surface-high)', textAlign: 'center', color: '#0ea5e9', fontWeight: 700, background: 'rgba(14, 165, 233, 0.03)' }}>거점예배 참석</th>
                        <th rowSpan={2} style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)', fontWeight: 600, textAlign: 'center' }}>상태</th>
                        <th rowSpan={2} style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)', fontWeight: 600 }}>특이 사유</th>
                      </tr>
                      <tr>
                        {['09', '12', '15', '20'].map(t => (
                          <th key={`reg-${t}`} style={{ padding: '12px', borderBottom: '2px solid var(--surface-high)', textAlign: 'center', color: 'var(--secondary)', fontSize: '13px' }}>{t}:00</th>
                        ))}
                        {['12', '17'].map(t => (
                          <th key={`base-${t}`} style={{ padding: '12px', borderBottom: '2px solid var(--surface-high)', textAlign: 'center', color: 'var(--secondary)', fontSize: '13px' }}>{t}:00</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((a: WorshipAttendance) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--outline-variant)', background: isAttended(a) ? 'white' : 'var(--surface-lowest)', transition: 'background 0.2s' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--secondary)' }}>{a.cell}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--on-surface)', fontSize: '15px' }}>{a.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{a.team}</div>
                          </td>
                          {/* 정규성전 체크박스 */}
                          {['09', '12', '15', '20'].map(t => (
                            <td key={`reg-${t}`} style={{ padding: '12px', textAlign: 'center' }}>
                              <button 
                                onClick={() => toggleRegular(a.id, t)}
                                style={{ border: 'none', background: a.regular[t] ? 'var(--primary)' : '#e5e7eb', width: '24px', height: '24px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}
                              >
                                {a.regular[t] && <Check size={14} color="white" strokeWidth={3} />}
                              </button>
                            </td>
                          ))}
                          {/* 거점예배 체크박스 */}
                          {['12', '17'].map(t => (
                            <td key={`base-${t}`} style={{ padding: '12px', textAlign: 'center' }}>
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
                              style={{ width: '100%', minWidth: '150px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', fontSize: '13px', outline: 'none' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface-lowest)' }}>
                  <button onClick={() => setShowDetailed(false)} style={{ padding: '10px 28px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}>
                    완료 및 저장하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard View */}
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

      {/* Unified Worship Summary Section */}
      <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }}></span>
          실시간 예배 출석 현황 (정규 + 거점)
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
          {/* Regular Slots */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }}></span>
              정규성전 (09, 12, 15, 20)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {['09', '12', '15', '20'].map(t => (
                <div key={t} style={{ background: 'var(--surface-low)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '4px' }}>{t}:00</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)' }}>{getSlotCount('regular', t)}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--secondary)', marginLeft: '2px' }}>명</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Base Slots */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ea5e9' }}></span>
              거점예배 (12, 17)
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {['12', '17'].map(t => (
                <div key={t} style={{ background: 'var(--surface-low)', padding: '16px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--secondary)', marginBottom: '4px' }}>{t}:00</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0ea5e9' }}>{getSlotCount('base', t)}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--secondary)', marginLeft: '2px' }}>명</span></div>
                </div>
              ))}
              {/* Empty Placeholder to fill grid 2x2 for balance if needed */}
              <div style={{ opacity: 0, padding: '16px' }}></div>
              <div style={{ opacity: 0, padding: '16px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Reason Summary Section */}
      <div style={{ background: 'var(--surface-lowest)', padding: '24px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '4px', height: '18px', background: 'var(--error)', borderRadius: '2px' }}></span>
          결석 및 특이 사유 요약
        </h3>
        {attendance.filter(a => a.note.trim() !== '').length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {attendance.filter(a => a.note.trim() !== '').map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--surface-low)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{a.name}</span>
                  <span style={{ fontSize: '12px', color: 'var(--secondary)', background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--outline-variant)' }}>{a.team}</span>
                </div>
                <div style={{ color: 'var(--on-surface)', fontSize: '14px', fontWeight: 500 }}>
                  {a.note}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary)', fontSize: '14px' }}>
            기록된 특이 사유가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
