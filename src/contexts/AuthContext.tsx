import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type UserRole = "admin" | "customer" | "seller";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  loading: boolean;
  isSellerApproved: boolean | null;
  isBlocked: boolean | null;
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSellerApproved, setIsSellerApproved] = useState<boolean | null>(null);
  const [isBlocked, setIsBlocked] = useState<boolean | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch role and profile status after auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchUserRoleAndStatus(session.user.id);
          }, 0);
        } else {
          setRole(null);
          setIsSellerApproved(null);
          setIsBlocked(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRoleAndStatus(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRoleAndStatus = async (userId: string) => {
    try {
      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        return;
      }

      const userRole = roleData?.role as UserRole || null;
      setRole(userRole);

      // Fetch profile status
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("seller_approved, is_blocked")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      setIsSellerApproved(profileData?.seller_approved ?? false);
      setIsBlocked(profileData?.is_blocked ?? false);

      // If user is blocked, sign them out
      if (profileData?.is_blocked) {
        toast.error("Your account has been blocked. Please contact support.");
        await supabase.auth.signOut();
        return;
      }

      // If seller is not approved, sign them out
      if (userRole === "seller" && !profileData?.seller_approved) {
        toast.error("Your seller account is pending approval. Please wait for admin approval.");
        await supabase.auth.signOut();
        return;
      }
    } catch (error) {
      console.error("Error fetching user role and status:", error);
    }
  };

  const signUp = async (email: string, password: string, name: string, userRole: UserRole) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: name,
            role: userRole,
          },
        },
      });

      if (error) {
        return { error };
      }

      // If registering as seller, inform them about pending approval
      if (userRole === "seller") {
        toast.info("Your seller account has been created and is pending admin approval. You will be able to sign in once approved.");
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Check if user is blocked or seller not approved
      if (data.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("is_blocked, seller_approved")
          .eq("user_id", data.user.id)
          .maybeSingle();

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (profileData?.is_blocked) {
          await supabase.auth.signOut();
          return { error: new Error("Your account has been blocked. Please contact support.") };
        }

        if (roleData?.role === "seller" && !profileData?.seller_approved) {
          await supabase.auth.signOut();
          return { error: new Error("Your seller account is pending approval. Please wait for admin approval.") };
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setIsSellerApproved(null);
    setIsBlocked(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, loading, isSellerApproved, isBlocked, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
