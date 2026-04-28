import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, update } from 'firebase/database';
import { UserCheck, Shield, UserX, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../hooks/useAuth';

export function Settings({ user }: { user: UserProfile }) {
  const [users, setUsers] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);

  const isAdmin = user.department === '총괄' || user.role === 'admin';

  useEffect(() => {
    if (!isAdmin) return;

    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleApprove = async (userId: string) => {
    try {
      await update(ref(db, `users/${userId}`), { status: 'approved' });
    } catch (error) {
      console.error('Error approving user:', error);
      alert('승인 중 오류가 발생했습니다.');
    }
  };

  const handleReject = async (userId: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      await update(ref(db, `users/${userId}`), { status: 'rejected' }); // or delete
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await update(ref(db, `users/${userId}`), { role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  if (loading) return <div style={{ padding: '32px', textAlign: 'center' }}>데이터를 불러오는 중...</div>;

  if (!isAdmin) {
    return (
      <div style={{ padding: '64px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--error)" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>접근 권한 없음</h2>
        <p style={{ color: 'var(--secondary)', marginTop: '8px' }}>총괄 관리자만 이용 가능한 페이지입니다.</p>
      </div>
    );
  }

  const pendingUsers = Object.entries(users).filter(([_, u]) => u.status === 'pending');
  const approvedUsers = Object.entries(users).filter(([_, u]) => u.status === 'approved');

  return (
    <div style={{ padding: '32px', flex: 1, overflowY: 'auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--on-surface)', fontWeight: 800, letterSpacing: '-0.02em' }}>관리자 설정 (Admin Console)</h1>
        <p style={{ color: 'var(--secondary)', fontSize: '15px', marginTop: '4px' }}>사용자 가입 승인 및 권한 부여를 관리합니다.</p>
      </header>

      <div style={{ display: 'grid', gap: '40px', maxWidth: '1000px' }}>
        {/* Pending Approvals */}
        <section>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--primary)" />
            가입 승인 대기 ({pendingUsers.length})
          </h3>
          {pendingUsers.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', background: 'var(--surface-lowest)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline-variant)' }}>
              <p style={{ color: 'var(--secondary)' }}>대기 중인 사용자가 없습니다.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {pendingUsers.map(([id, u]) => (
                <div key={id} style={{ background: 'var(--surface-lowest)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-ambient)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '16px' }}>{u.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>{u.department} | {u.role}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleApprove(id)}
                      style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle size={16} /> 승인
                    </button>
                    <button 
                      onClick={() => handleReject(id)}
                      style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <XCircle size={16} /> 거절
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Existing Users */}
        <section>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--tertiary)" />
            사용자 권한 관리 ({approvedUsers.length})
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {approvedUsers.map(([id, u]) => (
              <div key={id} style={{ background: 'var(--surface-lowest)', padding: '20px', borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--outline-variant)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px' }}>{u.name} 사역자</div>
                  <div style={{ fontSize: '13px', color: 'var(--secondary)' }}>{u.department}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <select 
                    value={u.role}
                    onChange={(e) => handleRoleChange(id, e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', fontSize: '13px' }}
                  >
                    <option value="admin">Admin</option>
                    <option value="지역장">지역장</option>
                    <option value="임원">임원</option>
                    <option value="지역서기">지역서기</option>
                    <option value="심방팀장">심방팀장</option>
                    <option value="일반">일반</option>
                  </select>
                  <button 
                    onClick={() => handleReject(id)}
                    style={{ padding: '6px', color: 'var(--secondary)', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  >
                    <UserX size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
