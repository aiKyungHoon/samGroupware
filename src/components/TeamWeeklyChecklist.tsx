import { useState, useEffect } from 'react';
import { Search, Calendar, CheckCircle2, Circle, UserPlus, X } from 'lucide-react';

interface TeamWeeklyChecklistProps {
  teamName: string;
  type: 'education' | 'evangelism' | 'accounting' | 'visit' | 'worship';
}

const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTVBiwqf-bMs28m6Kw25Pe5T1QRbczpCSAEBCWRjw1ono4AuC-RShiVvvYnPDdqjm_293knKViblbOl/pub?gid=1668494611&single=true&output=csv';

// Global state for prototype so members persist across tab switches
let globalMembersLoaded = false;
let globalMembers: { id: string; name: string; cell: string; team: string }[] = [];

// Global checked data for prototype
let globalCheckedData: { [key: string]: boolean } = {};

export function TeamWeeklyChecklist({ teamName, type }: TeamWeeklyChecklistProps) {
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedWeek, setSelectedWeek] = useState('1주차');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [membersList, setMembersList] = useState(globalMembers);
  const [checkedData, setCheckedData] = useState(globalCheckedData);
  // const [loading, setLoading] = useState(!globalMembersLoaded); // Removed unused state

  useEffect(() => {
    if (globalMembersLoaded) {
      setMembersList(globalMembers);
      return;
    }
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

        const members = rows.filter(r => r.length >= 5 && r[4] && r[4] !== '이름').map((r, idx) => ({
          id: `m_${idx}`,
          name: r[4],
          team: r[1] ? r[1] + '팀' : '소속없음',
          cell: r[2] || '-'
        }));
        
        globalMembers = members;
        globalMembersLoaded = true;
        setMembersList(members);
        // setLoading(false);
      } catch (err) {
        console.error(err);
        // setLoading(false);
      }
    };
    fetchCSV();
  }, []);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberCell, setNewMemberCell] = useState('1구역');

  const displayMembers = membersList.filter(m => m.team === teamName && (searchTerm === '' || m.name.includes(searchTerm)));

  const toggleCheck = (memberId: string, itemId: string) => {
    const isMonthlyPersist = type === 'accounting' || type === 'evangelism';
    const key = isMonthlyPersist 
      ? `${selectedMonth}-${type}-${memberId}-${itemId}` // 주차 생략 (월 단위 유지)
      : `${selectedMonth}-${selectedWeek}-${type}-${memberId}-${itemId}`; // 주차 포함
      
    const newData = { ...checkedData, [key]: !checkedData[key] };
    setCheckedData(newData);
    globalCheckedData = newData; // Update global
  };

  const isChecked = (memberId: string, itemId: string) => {
    const isMonthlyPersist = type === 'accounting' || type === 'evangelism';
    const key = isMonthlyPersist 
      ? `${selectedMonth}-${type}-${memberId}-${itemId}` 
      : `${selectedMonth}-${selectedWeek}-${type}-${memberId}-${itemId}`;
    return !!checkedData[key];
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    const newMember = {
      id: Date.now().toString(),
      name: newMemberName,
      team: teamName,
      cell: newMemberCell
    };
    globalMembers = [...globalMembers, newMember];
    setMembersList(globalMembers);
    setShowAddModal(false);
    setNewMemberName('');
    setNewMemberCell('1구역');
  };

  const getCheckItems = () => {
    switch(type) {
      case 'worship': return [{ id: 'regular', label: '정규예배 참석' }, { id: 'base', label: '거점예배 참석' }];
      case 'education': return [{ id: 'cell', label: '구역예배' }, { id: 'radio', label: '심야라디오' }, { id: 'exam', label: '인맞은시험' }];
      case 'evangelism': return [{ id: 'invite', label: '새가족초청' }, { id: 'meeting', label: '전도모임' }];
      case 'accounting': return [{ id: 'tithe', label: '십일조' }, { id: 'thanks', label: '감사헌금' }, { id: 'fee', label: '청체비' }];
      case 'visit': return [{ id: 'visit', label: '심방완료' }, { id: 'call', label: '전화심방' }];
      default: return [];
    }
  };

  const items = getCheckItems();

  const getTitle = () => {
    switch(type) {
      case 'worship': return '주차별 예배 현황 표';
      case 'education': return '주차별 교육 현황 표';
      case 'evangelism': return '월간 전도 현황 표 (주차 무관 유지)';
      case 'accounting': return '월간 회계 현황 표 (주차 무관 유지)';
      case 'visit': return '주차별 심방 현황 표';
      default: return '';
    }
  };

  return (
    <div style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-ambient)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--primary)" />
            {teamName} {getTitle()}
          </h2>
          <p style={{ color: 'var(--secondary)', fontSize: '14px', marginTop: '4px' }}>
            2026년도 데이터를 명단 표(Table)로 한눈에 체크하고 관리합니다.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}
          >
            <UserPlus size={16} /> 팀원 추가
          </button>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontWeight: 600 }}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i} value={`2026-${String(i+1).padStart(2, '0')}`}>2026년 {i+1}월</option>
            ))}
          </select>
          <select 
            value={selectedWeek} 
            onChange={(e) => setSelectedWeek(e.target.value)}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', background: 'var(--surface-lowest)', fontWeight: 600 }}
            disabled={type === 'accounting' || type === 'evangelism'}
          >
            {[1,2,3,4,5].map(w => (
              <option key={w} value={`${w}주차`}>
                {w}주차 {(type === 'accounting' || type === 'evangelism') ? '(월간 고정)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '24px', position: 'relative' }}>
        <Search size={18} color="var(--secondary)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input 
          type="text" 
          placeholder="이름으로 검색..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 48px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '15px' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--surface-high)', color: 'var(--secondary)' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>구역</th>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>이름</th>
              {items.map(item => (
                <th key={item.id} style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>{item.label}</th>
              ))}
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>비고</th>
            </tr>
          </thead>
          <tbody>
            {displayMembers.length === 0 ? (
              <tr>
                <td colSpan={items.length + 3} style={{ padding: '32px', textAlign: 'center', color: 'var(--secondary)' }}>
                  검색 결과가 없거나 소속 팀원이 없습니다. 상단의 '팀원 추가' 버튼을 눌러 추가하세요.
                </td>
              </tr>
            ) : (
              displayMembers.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--surface-low)' }}>
                  <td style={{ padding: '16px', color: 'var(--secondary)', fontSize: '14px', fontWeight: 500 }}>{member.cell}</td>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--on-surface)' }}>{member.name}</td>
                  {items.map(item => {
                    const checked = isChecked(member.id, item.id);
                    return (
                      <td key={item.id} style={{ padding: '16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => toggleCheck(member.id, item.id)}
                          style={{ 
                            background: 'none', border: 'none', cursor: 'pointer', 
                            color: checked ? 'var(--primary)' : 'var(--outline-variant)',
                            transition: 'all 0.2s',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%'
                          }}
                        >
                          {checked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                        </button>
                      </td>
                    );
                  })}
                  <td style={{ padding: '16px' }}>
                    <input 
                      type="text" 
                      placeholder="특이사항 입력..." 
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--outline-variant)', fontSize: '13px' }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{teamName} 팀원 추가</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)' }}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '8px' }}>구역 선택</label>
                <select 
                  value={newMemberCell} 
                  onChange={(e) => setNewMemberCell(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', fontSize: '15px' }}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(c => (
                    <option key={c} value={`${c}구역`}>{c}구역</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '8px' }}>이름</label>
                <input 
                  type="text" 
                  placeholder="새로운 팀원 이름" 
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--outline-variant)', fontSize: '15px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: '12px', background: 'var(--surface-low)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'var(--secondary)' }}
              >
                취소
              </button>
              <button 
                onClick={handleAddMember}
                style={{ flex: 1, padding: '12px', background: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', color: 'white' }}
              >
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
