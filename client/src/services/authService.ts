import { api } from './api';
import { ApiResponse, IUser } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<ApiResponse<{ user: IUser; token: string }>> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }

  static async sendOtp(email: string, purpose: 'register' | 'forgot_password' | 'profile_update' = 'register', name?: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/send-otp', { email, purpose, name });
    return response.data;
  }

  static async verifyOtp(email: string, otp: string, purpose?: 'register' | 'forgot_password' | 'profile_update'): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  }

  static async register(name: string, email: string, password: string, otp: string, role?: string): Promise<ApiResponse<{ user: IUser; token: string }>> {
    const response = await api.post('/auth/register', { name, email, password, otp, role });
    return response.data;
  }

  static async getMe(): Promise<ApiResponse<{ user: IUser }>> {
    const response = await api.get('/auth/me');
    return response.data;
  }

  static async updateProfile(data: { name?: string; email?: string; avatar?: string; password?: string }): Promise<ApiResponse<{ user: IUser }>> {
    const response = await api.put('/auth/profile', data);
    return response.data;
  }

  static async resetPassword(email: string, password: string, otp?: string): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/reset-password', { email, password, otp });
    return response.data;
  }
}
