import api from './client';
// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  signup:          (data: object)                                              => api.post('/api/auth/signup', data),
  login:           (data: { email: string; password: string })                 => api.post('/api/auth/login', data),
  loginPhone:      (data: { phone: string; password: string })                 => api.post('/api/auth/login/phone', data),
  // OTP login — POST /api/auth/send-otp   → { message, email, expiryMinutes }
  // OTP verify — POST /api/auth/verify-otp → { accessToken, refreshToken, user }
  sendOtp:         (data: { email: string })                                   => api.post('/api/auth/send-otp', data),
  verifyOtp:       (data: { email: string; otp: string })                      => api.post('/api/auth/verify-otp', data),
  logout:          (data: object)                                              => api.post('/api/auth/logout', data),
  refresh:         (data: object)                                              => api.post('/api/auth/refresh', data),
  forgotSendOtp:   (data: { email: string })                                   => api.post('/api/auth/forgot-password/send-otp', data),
  forgotVerifyOtp: (data: { email: string; otp: string })                      => api.post('/api/auth/forgot-password/verify-otp', data),
  resetPassword:   (data: { resetToken: string; newPassword: string })         => api.post('/api/auth/reset-password', data),
};
