import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, MagicLinkCredentials, SignupCredentials, ProfileUpdateCredentials } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  sendMagicLink: (credentials: MagicLinkCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<any>;
  logout: () => void;
  updateProfile: (credentials: ProfileUpdateCredentials) => Promise<void>;
  resetSignupFlag: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get initial session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user && session.user.email_confirmed_at) {
          // Convert Supabase user to our User type
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            createdAt: new Date(session.user.created_at),
            profilePhoto: session.user.user_metadata?.avatar_url,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && session.user.email_confirmed_at) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email!.split('@')[0],
            createdAt: new Date(session.user.created_at),
            profilePhoto: session.user.user_metadata?.avatar_url,
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (credentials: MagicLinkCredentials) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: credentials.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: false, // Don't create new users for login
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Magic link sent successfully - user will be redirected when they click the link
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    console.log('AuthContext signup called with:', credentials);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: credentials.email,
        options: {
          data: {
            name: credentials.name,
          },
          emailRedirectTo: `${window.location.origin}/auth`,
          shouldCreateUser: true, // Allow automatic signup
        },
      });

      console.log('Supabase signInWithOtp response:', { data, error });

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(error.message);
      }
      
      console.log('Magic link sent successfully');
      // Return success - magic link sent
      return { success: true };
    } catch (error) {
      console.error('Signup error in AuthContext:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (credentials: ProfileUpdateCredentials) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    setIsLoading(true);
    try {
      // Update user metadata (name, profile photo)
      const updates: any = {};
      
      if (credentials.name) {
        updates.name = credentials.name;
      }
      
      if (credentials.profilePhoto) {
        updates.avatar_url = credentials.profilePhoto;
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.auth.updateUser({
          data: updates,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // User will be cleared automatically by the auth state change listener
  };

  const resetSignupFlag = () => {
    // This function is kept for compatibility but no longer needed
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    sendMagicLink,
    signup,
    logout,
    updateProfile,
    resetSignupFlag,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
