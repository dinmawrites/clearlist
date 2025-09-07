import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, SignupCredentials, ProfileUpdateCredentials } from '../types/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
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

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        throw new Error('Please check your email and click the confirmation link before signing in.');
      }

      // User will be set automatically by the auth state change listener
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    try {
      // Validate passwords match
      if (credentials.password !== credentials.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // Return the signup data so the UI can handle the confirmation flow
      return data;
    } catch (error) {
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
      // Update password if provided
      if (credentials.newPassword) {
        if (credentials.newPassword !== credentials.confirmPassword) {
          throw new Error('New passwords do not match');
        }

        const { error } = await supabase.auth.updateUser({
          password: credentials.newPassword,
        });

        if (error) {
          throw new Error(error.message);
        }
      }

      // Update user metadata (name, email, profile photo)
      const updates: any = {};
      
      if (credentials.name) {
        updates.name = credentials.name;
      }
      
      if (credentials.email && credentials.email !== user.email) {
        updates.email = credentials.email;
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
    login,
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
