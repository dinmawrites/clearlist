export interface User {
  id: string;
  email: string;
  name: string;
  profilePhoto?: string;
  createdAt: Date;
  password?: string; // For demo purposes - in real app, this would be hashed
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProfileUpdateCredentials {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  profilePhoto?: string;
}
