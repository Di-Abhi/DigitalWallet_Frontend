import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

function loadUserFromSession(): User | null {
  try {
    const u = sessionStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
}

const initialUser = loadUserFromSession();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  isAdmin: initialUser?.role === 'ADMIN',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ userData: User; tokens: Tokens }>) {
      const { userData, tokens } = action.payload;
      sessionStorage.setItem('accessToken', tokens.accessToken);
      sessionStorage.setItem('refreshToken', tokens.refreshToken);
      sessionStorage.setItem('userId', String(userData.id));
      sessionStorage.setItem('userRole', userData.role);
      sessionStorage.setItem('userEmail', userData.email);
      sessionStorage.setItem('user', JSON.stringify(userData));
      state.user = userData;
      state.isAuthenticated = true;
      state.isAdmin = userData.role === 'ADMIN';
    },
    logoutSuccess(state) {
      sessionStorage.clear();
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
    },
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
