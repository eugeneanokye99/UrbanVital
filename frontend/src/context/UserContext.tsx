
import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchUserProfile } from '../services/api';

type UserType = {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  [key: string]: any;
};

interface UserContextType {
  user: UserType | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserProfile();
        setUser(data);
      } catch {}
      setLoading(false);
    };
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
