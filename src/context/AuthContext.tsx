
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getCurrentUser, initializeUserDataAfterLogin } from '@/services/auth/supabaseAuth';
import { toast } from 'sonner';
import { PlanType, getUserPlan } from '@/services/plan/userPlanService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [redirectInProgress, setRedirectInProgress] = useState<boolean>(false);

  useEffect(() => {
    // Set up auth state listener first
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        // Update state with current session data
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && currentSession?.user && !redirectInProgress) {
          console.log('User signed in:', currentSession.user.email);
          toast.success(`Bem-vindo, ${currentSession.user.email}`);
          
          setRedirectInProgress(true);
          
          // Initialize user data after login
          // Use setTimeout to avoid blocking the UI thread
          setTimeout(() => {
            initializeUserDataAfterLogin().then(() => {
              // Additional logic can go here
              setRedirectInProgress(false);
            });
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          toast.info('Você saiu do sistema');
        }
      }
    );

    // Check for initial session
    const checkSession = async () => {
      setIsLoading(true);
      try {
        // Get current session first
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If we have a session, initialize user data
        if (currentSession?.user) {
          console.log('Found existing session for:', currentSession.user.email);
          await initializeUserDataAfterLogin();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
