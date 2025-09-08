export interface User {
  id: string;
  email: string;
  name: string;
  profilePhoto?: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface MagicLinkCredentials {
  email: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
}

export interface ProfileUpdateCredentials {
  name?: string;
  email?: string;
  profilePhoto?: string;
}
