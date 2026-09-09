import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Profile } from '../types/db';
import { getProfile, signOut as serviceSignOut } from '../features/auth/services/authService';
import toast from 'react-hot-toast';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  isRecoveryMode: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
  setRecoveryMode: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  onPasswordRecovery?: () => void;
}> = ({ children, onPasswordRecovery }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState<boolean>(false);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const res = await getProfile(userId);
    if (res.data) {
      setProfile(res.data);
      return res.data;
    }
    if (res.error && res.error.includes('No tienes permisos')) {
      toast.error('No tienes permisos para realizar esta acción');
    }
    return null;
  }, []);

  const refreshProfile = useCallback(async (): Promise<Profile | null> => {
    const uid = user?.id ?? (await supabase.auth.getUser()).data.user?.id;
    if (uid) {
      return fetchProfile(uid);
    }
    return null;
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          if (data.session?.user) {
            await fetchProfile(data.session.user.id);
          }
        }
      } catch (err) {
        console.warn('Error inicializando sesión de Supabase:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'PASSWORD_RECOVERY') {
          setIsRecoveryMode(true);
          if (onPasswordRecovery) {
            onPasswordRecovery();
          }
        }

        if (newSession?.user) {
          await fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [fetchProfile, onPasswordRecovery]);

  const signOut = useCallback(async () => {
    setLoading(true);
    await serviceSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsRecoveryMode(false);
    setLoading(false);
    toast.success('Sesión cerrada con éxito');
  }, []);

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isAdmin,
        loading,
        isRecoveryMode,
        signOut,
        refreshProfile,
        setRecoveryMode: setIsRecoveryMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
