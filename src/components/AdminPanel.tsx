import { useState, useEffect } from 'react';
import { Shield, Check, X, User } from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase';
import { useAuth } from '../hooks/useAuth';

export function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, 'users');
      const snapshot = await getDocs(usersRef);
      const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    if (!window.confirm(`이 사용자를 ${newStatus === 'approved' ? '승인' : '거절'}하시겠습니까?`)) return;
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { status: newStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('상태 업데이트에 실패했습니다.');
    }
  };

  const AVAILABLE_ROLES = [
    { id: 'master', label: '마스터(전체)' },
    { id: 'team_bora', label: '보라팀' },
    { id: 'team_haebom', label: '해봄팀' },
    { id: 'team_ieum', label: '이음팀' },
    { id: 'menu_worship', label: '예배관리' },
    { id: 'menu_education', label: '교육관리' },
    { id: 'menu_evangelism', label: '전도관리' },
    { id: 'menu_accounting', label: '회계관리' },
    { id: 'menu_visits', label: '심방관리' },
  ];

  const handleToggleRole = async (userId: string, currentRoles: string[], roleId: string) => {
    let newRoles = [...(currentRoles || [])];
    if (newRoles.includes(roleId)) {
      newRoles = newRoles.filter(r => r !== roleId);
    } else {
      newRoles.push(roleId);
    }
    
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { roles: newRoles, role: newRoles.includes('master') ? 'admin' : 'user' }); // Backward compatibility
      setUsers(users.map(u => u.id === userId ? { ...u, roles: newRoles, role: newRoles.includes('master') ? 'admin' : 'user' } : u));
    } catch (err) {
      console.error('Failed to update role:', err);
      alert('권한 업데이트에 실패했습니다.');
    }
  };

  const ADMIN_ROLES = ['master', 'menu_worship', 'menu_education', 'menu_evangelism', 'menu_accounting', 'menu_visits'];
  const hasAdminAccess = user?.id === 'admin' || user?.role === 'admin' || (user?.roles || []).some((r: string) => ADMIN_ROLES.includes(r));

  if (!hasAdminAccess) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <h2>접근 권한이 없습니다.</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 16px', background: 'var(--surface)', flex: 1, overflowY: 'auto' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield color="var(--primary)" />
            관리자 설정
          </h1>
          <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>
            가입한 사용자들의 승인 및 권한을 관리합니다.
          </p>
        </div>
        <button onClick={fetchUsers} style={{ padding: '10px 20px', background: 'var(--surface-variant)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>
          새로고침
        </button>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-ambient)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--secondary)' }}>로딩 중...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-lowest)', borderBottom: '2px solid var(--outline-variant)' }}>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>이름 (닉네임)</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>아이디</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>상태</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)', width: '400px' }}>권한 설정</th>
                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>승인관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--outline-variant)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} color="var(--secondary)" />
                      {u.name} <span style={{ color: 'var(--secondary)', fontWeight: 400, fontSize: '13px' }}>({u.nickname || '미설정'})</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--secondary)', fontSize: '14px' }}>{u.id}</td>
                  <td style={{ padding: '16px' }}>
                    {u.status === 'pending' ? (
                      <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700 }}>대기중</span>
                    ) : u.status === 'approved' ? (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700 }}>승인됨</span>
                    ) : (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700 }}>거절됨</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {AVAILABLE_ROLES.map(role => {
                        const isChecked = (u.roles || []).includes(role.id) || (u.role === 'admin' && role.id === 'master');
                        return (
                          <label key={role.id} style={{ 
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', 
                            background: isChecked ? 'var(--primary-container)' : 'var(--surface-lowest)',
                            color: isChecked ? 'var(--on-primary)' : 'var(--secondary)',
                            padding: '4px 8px', borderRadius: 'var(--radius-md)', cursor: user.uid === u.uid ? 'not-allowed' : 'pointer',
                            border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--outline-variant)'}`
                          }}>
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              disabled={user.uid === u.uid}
                              onChange={() => handleToggleRole(u.id, u.roles || (u.role === 'admin' ? ['master'] : []), role.id)}
                              style={{ display: 'none' }}
                            />
                            {role.label}
                          </label>
                        );
                      })}
                    </div>
                  </td>
                  <td style={{ padding: '16px', display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {u.status !== 'approved' && (
                        <button
                          onClick={() => handleUpdateStatus(u.id, 'approved')}
                          style={{
                            background: 'var(--primary)', color: 'white', border: 'none',
                            padding: '4px 8px', borderRadius: 'var(--radius-md)', cursor: user?.uid === u.uid ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                          }}
                          disabled={user?.uid === u.uid}
                        >
                          승인
                        </button>
                      )}
                      
                      {u.status !== 'rejected' && user?.uid !== u.uid && (
                      <button 
                        onClick={() => handleUpdateStatus(u.id, 'rejected')}
                        style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}
                      >
                        <X size={14} /> 거절
                      </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
