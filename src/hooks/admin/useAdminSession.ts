import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { checkAdminStatus, getAdminSessionFromStorage, setAdminSessionInStorage } from "@/utils/adminAuthUtils";
import { ADMIN_SESSION_KEY } from "@/context/AdminAuthContext";

export function useAdminSession() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUserAdminId, setCurrentUserAdminId] = useState<string | null>(null);
  const [currentUserAdminLevel, setCurrentUserAdminLevel] = useState<string | null>(null);

  // Check for admin session on load
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        // First check localStorage for admin flag
        const adminSession = getAdminSessionFromStorage();
        console.log("Initial check for admin session:", adminSession);
        
        if (adminSession) {
          // Verify with Supabase if session is valid
          const { data } = await supabase.auth.getSession();
          const session = data.session;
          
          if (!session) {
            console.log("No valid session found, removing admin flag");
            setAdminSessionInStorage(false);
            setIsAdmin(false);
            setIsLoading(false);
            return;
          }
          
          // We have a session, verify if user is admin
          const userId = session.user.id;
          console.log("Found authenticated user:", userId);
          
          // First check metadata for admin role
          if (session.user.user_metadata?.role === 'admin') {
            console.log("User confirmado como admin via metadata");
            setIsAdmin(true);
            setCurrentUserAdminLevel(session.user.user_metadata?.adminLevel || 'standard');
            setIsLoading(false);
            return;
          }
          
          // Se não for admin, limpa tudo
          setAdminSessionInStorage(false);
          setIsAdmin(false);
          setCurrentUserAdminId(null);
          setCurrentUserAdminLevel(null);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error in admin session check:", err);
        setAdminSessionInStorage(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminSession();
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out, removing admin status");
          setIsAdmin(false);
          setCurrentUserAdminId(null);
          setCurrentUserAdminLevel(null);
          setAdminSessionInStorage(false);
          return;
        }
        
        // Only process sign in events when we have a session
        if (event === 'SIGNED_IN' && session?.user) {
          // Check user metadata first for admin flag
          if (session.user.user_metadata?.role === 'admin') {
            console.log("User confirmed as admin via metadata");
            setIsAdmin(true);
            setAdminSessionInStorage(true);
            return;
          }
          
          // Otherwise, we don't make assumptions - the admin login flow
          // will check admin status and set the flag if needed
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    isAdmin,
    setIsAdmin,
    isLoading,
    setIsLoading,
    currentUserAdminId,
    currentUserAdminLevel,
  };
}
