
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
          
          const adminStatus = await checkAdminStatus(userId);
          
          if (adminStatus.isAdmin) {
            console.log("User confirmed as admin");
            setIsAdmin(true);
            setCurrentUserAdminId(adminStatus.adminId || null);
            setCurrentUserAdminLevel(adminStatus.adminLevel || null);
          } else {
            console.log("User is not an admin");
            setAdminSessionInStorage(false);
            setIsAdmin(false);
          }
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
        
        // Delay admin check to avoid recursive policies
        if (session?.user) {
          // Check user metadata first for admin flag
          if (session.user.user_metadata?.role === 'admin') {
            console.log("User confirmed as admin via metadata");
            setIsAdmin(true);
            setAdminSessionInStorage(true);
            return;
          }
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
