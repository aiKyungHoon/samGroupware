import { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export interface UserPermissions {
  worship: 'read' | 'write';
  education: 'read' | 'write';
  accounting: 'read' | 'write';
  visits: 'read' | 'write';
  evangelism: 'read' | 'write';
  orgChart: 'read' | 'write';
}

export interface UserProfile {
  uid: string;
  id: string;
  name: string;
  nickname?: string;
  department: string;
  role: string;
  roles?: string[];
  status: 'pending' | 'approved' | 'rejected';
  permissions: UserPermissions;
}

const defaultPermissions: UserPermissions = {
  worship: 'read',
  education: 'read',
  accounting: 'read',
  visits: 'read',
  evangelism: 'read',
  orgChart: 'read',
};

// Helper to determine permissions based on department/role
const getPermissionsByDept = (dept: string, role: string): UserPermissions => {
  const p = { ...defaultPermissions };

  if (role === 'admin') {
    return {
      worship: 'write',
      education: 'write',
      accounting: 'write',
      visits: 'write',
      evangelism: 'write',
      orgChart: 'write',
    };
  }

  // 총괄 - admin, 임원, 지역장 (전체 권한)
  const superAdminDepts = ['admin', '임원', '지역장'];
  if (superAdminDepts.includes(dept)) {
    return {
      worship: 'write',
      education: 'write',
      accounting: 'write',
      visits: 'write',
      evangelism: 'write',
      orgChart: 'write',
    };
  }

  // 관리자 권한 매핑
  switch (dept) {
    case '지역서기':
    case '지역부서기':
      p.worship = 'write';
      p.orgChart = 'write';
      break;
    case '심방팀장':
    case '심방부팀장':
      p.worship = 'write';
      p.visits = 'write';
      break;
    case '교육팀장':
      p.education = 'write';
      break;
    case '회계팀장':
    case '회계부팀장':
      p.accounting = 'write';
      break;
  }

  return p;
};

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Fetch profile from Firestore
        const userDocRef = doc(firestore, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const permissions = getPermissionsByDept(data.department || '', data.role || 'user');
            
            setUser({
              uid: firebaseUser.uid,
              id: data.id || '',
              name: data.name || '',
              nickname: data.nickname || '',
              department: data.department || '',
              role: data.role || 'user',
              roles: data.roles || [],
              status: data.status || 'pending',
              permissions
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUser(null);
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return { user, loading, logout };
}
