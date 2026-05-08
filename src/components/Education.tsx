import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell as ReCell } from 'recharts';
import { Search, Check, BookOpen, Radio, GraduationCap } from 'lucide-react';

/* ─────────── Types ─────────── */
interface EducationAttendance {
  id: string;
  name: string;
  team: string;
  cell: string;
  education: {
    cell: boolean;  // 구역예배
    radio: boolean; // 심야라디오
    exam: boolean;  // 인맞은시험
  };
  note: string;
}

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVBiwqf-bMs28m6Kw25Pe5T1QRbczpCSAEBCWRjw1ono4AuC-RShiVvvYnPDdqjm_293knKViblbOl/pub?gid=1668494611&single=true&output=csv';

let educationDataLoaded = false;
let globalEducationAttendance: EducationAttendance[] = [];

export function Education({ user, teamName }: { user?: any; teamName?: string }) {
  const [showDetailed, setShowDetailed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Date & Team Selectors State
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
  const selectedTeam = initialTeam;

  const [attendance, setAttendance] = useState<EducationAttendance[]>(globalEducationAttendance);
  const [loading, setLoading] = useState(!educationDataLoaded);

  useEffect(() => {
    if (educationDataLoaded) return;
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
          id: `e_${idx}`,
          name: r[4],
          team: r[1] ? r[1] + '팀' : '소속없음',
          cell: r[2] || '-',
          education: {
            cell: false,
            radio: false,
            exam: false
          },
          note: ''
        }));
        
        globalEducationAttendance = newAttendance;
        educationDataLoaded = true;
        setAttendance(newAttendance);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCSV();
  }, []);

  const filteredAttendance = attendance.filter((a: EducationAttendance) => {
    if (selectedTeam !== '전체' && a.team !== selectedTeam) return false;
    if (selectedCell !== '전체' && a.cell !== selectedCell) return false;
    if (searchTerm && !a.name.includes(searchTerm) && !a.team.includes(searchTerm)) return false;
    return true;
  });

  // Dynamically get available cells for the selected team
  const availableCells = Array.from(new Set(
    attendance
      .filter(a => selectedTeam === '전체' || a.team === selectedTeam)
      .map(a => a.cell)
  )).sort((a, b) => {
    const aNum = parseInt(a.replace(/[^0-9]/g, '')) || 0;
    const bNum = parseInt(b.replace(/[^0-9]/g, '')) || 0;
    return aNum - bNum || a.localeCompare(b);
  });

  const toggleEducation = (id: string, field: keyof EducationAttendance['education']) => {
    setAttendance((prev: EducationAttendance[]) => prev.map((a: EducationAttendance) => 
      a.id === id ? { ...a, education: { ...a.education, [field]: !a.education[field] } } : a
    ));
  };

  const updateReason = (id: string, reason: string) => {
    setAttendance((prev: EducationAttendance[]) => prev.map((a: EducationAttendance) => 
      a.id === id ? { ...a, note: reason } : a
    ));
  };

  // Stats calculation
  const totalInFilter = filteredAttendance.length;
  const cellCount = filteredAttendance.filter(a => a.education.cell).length;
  const radioCount = filteredAttendance.filter(a => a.education.radio).length;
  const examCount = filteredAttendance.filter(a => a.education.exam).length;

  const statsData = [
    { name: '구역예배', count: cellCount, color: '#8b5cf6' },
    { name: '심야라디오', count: radioCount, color: '#f59e0b' },
    { name: '인맞은시험', count: examCount, color: '#10b981' }
  ];

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;
  }

  return (
    <div style={{ padding: teamName ? '16px 0' : '32px', flex: 1, overflowY: 'auto' }}>
      {/* 팝업 모달 */}
      {showDetailed && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', width: '95%', maxWidth: '1200px', height: '85vh', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            
            {/* 팝업 헤더 */}
            <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--surface-high)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-lowest)' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--on-surface)' }}>교육 취합 입력 팝업</h1>
                <p style={{ color: 'var(--secondary)', fontSize: '14px', marginTop: '4px' }}>구역예배, 라디오, 시험 응시 여부를 빠르게 취합합니다.</p>
              </div>
              <button 
                onClick={() => setShowDetailed(false)}
                style={{ padding: '8px 20px', background: 'var(--surface-low)', color: 'var(--on-surface)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                닫기 ✕
              </button>
            </header>

            {/* 팝업 내용 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px', background: 'var(--surface-low)' }}>
              <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', overflow: 'hidden' }}>
                
                {/* Controls */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>상세 교육 명단</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select value={selectedCell} onChange={(e) => setSelectedCell(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                      <option value="전체">모든 구역</option>
                      {availableCells.map(cell => (
                        <option key={cell} value={cell}>{cell}</option>
                      ))}
                    </select>
                    <div style={{ position: 'relative', width: '200px' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                      <input 
                        type="text" 
                        placeholder="이름 검색..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--surface-lowest)' }}>
                      <tr>
                        <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)', width: '60px' }}>구역</th>
                        <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)', width: '120px' }}>이름</th>
                        <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', textAlign: 'center' }}>구역예배</th>
                        <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', textAlign: 'center' }}>심야라디오</th>
                        <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)', textAlign: 'center' }}>인맞은시험</th>
                        <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--surface-high)' }}>특이 사유</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((a: EducationAttendance) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>{a.cell}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ fontWeight: 700 }}>{a.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--secondary)' }}>{a.team}</div>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button onClick={() => toggleEducation(a.id, 'cell')} style={{ border: 'none', background: a.education.cell ? '#8b5cf6' : '#e5e7eb', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
                              {a.education.cell && <Check size={16} />}
                            </button>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button onClick={() => toggleEducation(a.id, 'radio')} style={{ border: 'none', background: a.education.radio ? '#f59e0b' : '#e5e7eb', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
                              {a.education.radio && <Check size={16} />}
                            </button>
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button onClick={() => toggleEducation(a.id, 'exam')} style={{ border: 'none', background: a.education.exam ? '#10b981' : '#e5e7eb', width: '28px', height: '28px', borderRadius: '8px', cursor: 'pointer', color: 'white' }}>
                              {a.education.exam && <Check size={16} />}
                            </button>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <input 
                              value={a.note}
                              onChange={(e) => updateReason(a.id, e.target.value)}
                              placeholder="기록..."
                              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--outline-variant)' }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ padding: '20px 24px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'flex-end', background: 'var(--surface-lowest)' }}>
                  <button onClick={() => setShowDetailed(false)} style={{ padding: '10px 28px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer' }}>
                    취합 완료
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard View */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800 }}>교육 관리</h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px' }}>{teamName ? `${teamName}의` : '상암지역'} 교육 이수 및 참여 현황입니다.</p>
        </div>
        <button 
          onClick={() => setShowDetailed(true)}
          style={{ padding: '10px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
        >
          + 교육 데이터 취합하기
        </button>
      </header>

      {/* Charts / Cards */}
      <div className="responsive-grid-3" style={{ marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-ambient)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#f3e8ff', color: '#8b5cf6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <BookOpen size={24} />
          </div>
          <div style={{ fontSize: '14px', color: 'var(--secondary)', marginBottom: '4px' }}>구역예배 참석율</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#8b5cf6' }}>
            {totalInFilter > 0 ? Math.round((cellCount / totalInFilter) * 100) : 0}%
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-ambient)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#fef3c7', color: '#f59e0b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Radio size={24} />
          </div>
          <div style={{ fontSize: '14px', color: 'var(--secondary)', marginBottom: '4px' }}>심야라디오 시청율</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>
            {totalInFilter > 0 ? Math.round((radioCount / totalInFilter) * 100) : 0}%
          </div>
        </div>

        <div style={{ background: 'white', padding: '24px', borderRadius: '20px', boxShadow: 'var(--shadow-ambient)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#dcfce7', color: '#10b981', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <GraduationCap size={24} />
          </div>
          <div style={{ fontSize: '14px', color: 'var(--secondary)', marginBottom: '4px' }}>인맞은시험 응시율</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>
            {totalInFilter > 0 ? Math.round((examCount / totalInFilter) * 100) : 0}%
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: 'var(--shadow-ambient)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '24px' }}>주차별 교육 완료 현황</h3>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <Tooltip cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={40}>
                {statsData.map((entry, index) => (
                  <ReCell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
