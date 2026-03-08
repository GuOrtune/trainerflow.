import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Real user type from Supabase
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  subscriptionTier: 'free' | 'pro';
  emailConfirmed: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string, role?: 'admin' | 'student') => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (supabaseUser: any) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (data) {
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: data.name || 'Usuário',
        role: data.role || 'student',
        subscriptionTier: (data.subscription_tier as 'free' | 'pro') || 'free',
        emailConfirmed: !!supabaseUser.email_confirmed_at
      });
    } else {
      // Fallback in case profile doesn't exist yet
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || 'Usuário',
        role: supabaseUser.user_metadata?.role || 'student',
        subscriptionTier: 'free',
        emailConfirmed: !!supabaseUser.email_confirmed_at
      });
    }
    setIsLoading(false);
  };

  const login = async (email: string, password?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '123456',
    });
    
    if (error) {
      console.error('Supabase Login Error:', error);
      throw error;
    }

    if (data.user && !data.user.email_confirmed_at) {
      // Allow them to log in but maybe the UI should restrict them? 
      // Supabase by default might block login if confirmation is required.
    }
  };

  const register = async (name: string, email: string, password?: string, role: 'admin' | 'student' = 'admin') => {
    // 1. Normalize email to prevent case-sensitivity issues
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if a profile already exists with this normalized email
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      throw new Error('User already registered');
    }

    // 3. Attempt to sign up
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password || '123456',
      options: {
        data: { name, role },
        emailRedirectTo: window.location.origin
      }
    });

    // 4. Handle specific Supabase error for already registered users
    if (error) {
      const isDuplicate = error.message?.toLowerCase().includes('already registered') || 
                          (error as any).status === 422 ||
                          (error as any).code === '23505';

      if (isDuplicate) {
        throw new Error('User already registered');
      }
      throw error;
    }

    // 5. Bypass Supabase enumeration protection: 
    // If identities array is empty, it means the email is already taken.
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw new Error('User already registered');
    }

    // 6. Create profile if user was successfully created
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: data.user.id, name, email: normalizedEmail, role, subscription_tier: 'free' }
      ]);
      
      if (profileError) {
        // Code 23505 is unique_violation (checking ID or Email if unique)
        if (profileError.code === '23505') {
          throw new Error('User already registered');
        }
        console.error('Error creating profile after signup:', profileError);
        throw profileError;
      }
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.subscriptionTier) dbUpdates.subscription_tier = updates.subscriptionTier;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) throw error;
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const deleteAccount = async () => {
    if (!user) return;
    
    // In a real app, you'd call an Edge Function to delete from auth.users
    // For now, we delete the profile and logout. 
    // Data cascades from profiles to other tables if set up correctly.
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) throw profileError;

    await logout();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, register, updateProfile, deleteAccount, resetPassword,
      isAuthenticated: !!user, isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
