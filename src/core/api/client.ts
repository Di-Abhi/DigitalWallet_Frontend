import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'http://localhost:8080';

// ─── Auth endpoints that must NEVER trigger the refresh interceptor ───────────
// A 401 from these endpoints means bad credentials / bad OTP — not an expired
// session — so we must let the error propagate to the caller unchanged.
const AUTH_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/login/phone',
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/auth/signup',
  '/api/auth/refresh',
  '/api/auth/forgot-password/send-otp',
  '/api/auth/forgot-password/verify-otp',
  '/api/auth/reset-password',
];

const isAuthEndpoint = (url: string | undefined): boolean =>
  AUTH_ENDPOINTS.some((path) => url?.includes(path));

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request interceptor — attach session tokens to every request ─────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token     = sessionStorage.getItem('accessToken');
    const userId    = sessionStorage.getItem('userId');
    const userRole  = sessionStorage.getItem('userRole');
    const userEmail = sessionStorage.getItem('userEmail');

    if (token)     config.headers.Authorization = `Bearer ${token}`;
    if (userId)    config.headers['X-UserId']    = userId;
    if (userRole)  config.headers['X-UserRole']  = userRole;
    if (userEmail) config.headers['X-UserEmail'] = userEmail;

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Token refresh queue ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

// ─── Response interceptor — handle 401s ──────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status          = error.response?.status;

    // ── Not a 401, or already retried — propagate as-is ──────────────────────
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // ── Auth endpoints: a 401 means wrong credentials / bad OTP.
    //    Never attempt a refresh — just let the error reach the component
    //    so it can show "Invalid credentials" to the user. ──────────────────────
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    // ── Protected endpoint 401: session expired — try to refresh ──────────────
    if (isRefreshing) {
      // Queue this request until the refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }).catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing           = true;

    const refreshToken = sessionStorage.getItem('refreshToken');

    if (!refreshToken) {
      // No refresh token — session is truly gone; redirect cleanly
      isRefreshing = false;
      processQueue(error, null);
      sessionStorage.clear();
      window.location.href = '/login';
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
      const newToken: string = data.accessToken;

      sessionStorage.setItem('accessToken', newToken);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh itself failed — session truly expired; log out and redirect
      processQueue(refreshError, null);
      sessionStorage.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
