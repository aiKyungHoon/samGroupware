import React, { useState } from 'react';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { auth, firestore } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface AuthProps {
  onLoginSuccess?: (user: unknown) => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const email = `${id.trim().toLowerCase()}@churchware.app`;
    const pwd = password.trim();

    try {
      // Special case: Master Admin Account Auto-creation
      if (id.trim().toLowerCase() === 'admin' && pwd === 'admin12345!@') {
        try {
          await signInWithEmailAndPassword(auth, email, pwd);
          if (onLoginSuccess) onLoginSuccess(auth.currentUser);
          setLoading(false);
          return;
        } catch (_authErr: unknown) {
          // If login fails, try to create it
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
            await setDoc(doc(firestore, 'users', userCredential.user.uid), {
              uid: userCredential.user.uid,
              id: 'admin',
              name: '마스터 관리자',
              nickname: 'admin',
              status: 'approved',
              role: 'admin',
              createdAt: new Date().toISOString()
            });
            if (onLoginSuccess) onLoginSuccess(userCredential.user);
            setLoading(false);
            return;
          } catch (createErr: unknown) {
            const err = createErr as { code?: string };
            console.error("Admin creation failed:", err.code);
            // If it already exists, let it fall through to the final signIn attempt
            // which will provide the correct error message if the password is wrong
          }
        }
      }

      await signInWithEmailAndPassword(auth, email, pwd);
      if (onLoginSuccess) onLoginSuccess(auth.currentUser);
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else {
        setError(`오류: ${error.message}`);
      }
      console.error("Login Error:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const email = `${id.trim().toLowerCase()}@churchware.app`;
      const pwd = password.trim();
      const userCredential = await createUserWithEmailAndPassword(auth, email, pwd);
      
      // Create user profile in Firestore
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        id,
        name,
        nickname,
        status: 'pending',
        role: 'user',
        createdAt: new Date().toISOString()
      });

      alert('가입 신청이 완료되었습니다! 관리자 승인 후 이용 가능합니다.');
      setIsLogin(true);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('이미 존재하는 아이디입니다.');
      } else {
        setError('가입 도중 오류가 발생했습니다.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      maxWidth: '400px', 
      background: 'white', 
      padding: '40px', 
      borderRadius: 'var(--radius-xl)', 
      boxShadow: 'var(--shadow-elevated)',
      textAlign: 'center',
      position: 'relative',
      zIndex: 1001
    }}>
      <div style={{ 
        width: '64px', 
        height: '64px', 
        background: 'var(--primary-container)', 
        borderRadius: 'var(--radius-lg)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 24px'
      }}>
        <ShieldCheck size={32} color="var(--primary)" />
      </div>

      <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
        {isLogin ? '그룹웨어 로그인' : '사역 신청 (회원가입)'}
      </h1>
      <p style={{ color: 'var(--secondary)', marginBottom: '32px', fontSize: '14px' }}>
        {isLogin ? '상암지역 통합 관리 시스템' : '정보를 입력하여 가입을 신청하세요'}
      </p>

      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '20px', 
          fontSize: '14px' 
        }}>
          {error}
        </div>
      )}

      <form onSubmit={isLogin ? handleLogin : handleSignup} style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>아이디 (ID)</label>
          <input 
            required
            type="text" 
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디를 입력하세요" 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--outline-variant)',
              outline: 'none'
            }} 
          />
        </div>

        {!isLogin && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>이름</label>
              <input 
                required
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="본명을 입력하세요" 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--outline-variant)',
                  outline: 'none'
                }} 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>닉네임</label>
              <input 
                required
                type="text" 
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용할 닉네임 (활동명)을 입력하세요" 
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--outline-variant)',
                  outline: 'none'
                }} 
              />
            </div>
          </>
        )}

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--secondary)', marginBottom: '6px' }}>비밀번호</label>
          <input 
            required
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요" 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--outline-variant)',
              outline: 'none'
            }} 
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          style={{ 
            width: '100%', 
            padding: '14px', 
            background: 'var(--primary)', 
            color: 'white', 
            border: 'none', 
            borderRadius: 'var(--radius-md)', 
            fontWeight: 700, 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? '처리 중...' : (isLogin ? <><LogIn size={18} /> 로그인</> : <><UserPlus size={18} /> 가입 신청</>)}
        </button>
      </form>

      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--outline-variant)' }}>
        <p style={{ fontSize: '14px', color: 'var(--secondary)' }}>
          {isLogin ? '시스템 사용이 처음이신가요?' : '이미 계정이 있으신가요?'}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              fontWeight: 700, 
              marginLeft: '8px', 
              cursor: 'pointer' 
            }}
          >
            {isLogin ? '가입 신청하기' : '로그인하러 가기'}
          </button>
        </p>
      </div>
    </div>
  );
}
