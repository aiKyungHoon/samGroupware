import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

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
  department: string;
  role: string;
  isApproved: boolean;
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
const getPermissionsByDept = (dept: string): UserPermissions => {
  const p = { ...defaultPermissions };

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
    case '전도교관':
    case '문화팀장':
    case '문화부팀장':
    case '양때팀장':
      // These are admins but specific write access wasn't defined for all 
      // I'll grant them base write for their areas if implied, but for now following user list
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
        // Fetch profile from RTDB
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            // Inject dynamic permissions based on department
            const permissions = getPermissionsByDept(data.department);
            
            setUser({
              ...data,
              permissions
            });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
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
