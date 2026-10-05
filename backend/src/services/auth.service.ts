import { supabaseAdmin } from '../config/supabase';
import { userRepository } from '../repositories/user.repository';
import { LoginCredentials, RegisterData, AuthResult, UserProfile } from '../types/auth.types';

export class AuthService {
  async register(data: RegisterData): Promise<AuthResult> {
    let userId: string = '';
    const userEmail = data.email;
    const userRole = data.role || 'customer';

    const { data: authData, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        role: userRole,
        full_name: data.fullName,
      },
    });

    if (!error && authData?.user) {
      userId = authData.user.id;
    } else {
      // Fallback to regular signUp (works with anon key)
      const signUpRes = await supabaseAdmin.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: userRole,
            full_name: data.fullName,
          },
        },
      });

      if (signUpRes.error || !signUpRes.data?.user) {
        throw new Error(signUpRes.error?.message || error?.message || 'Registration failed');
      }
      userId = signUpRes.data.user.id;
    }

    try {
      await userRepository.createProfile({
        id: userId,
        email: userEmail,
        fullName: data.fullName,
        role: userRole,
      });
    } catch (profileErr) {
      console.warn('Profile creation note (may be handled by trigger):', profileErr);
    }

    return {
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
      },
      token: '',
    };
  }

  async login(credentials: LoginCredentials): Promise<any> {
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid credentials');
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: (data.user.user_metadata?.role as any) || 'customer',
      },
      token: data.session.access_token,
    };
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    return userRepository.findById(userId);
  }

  async logout(_authHeader?: string): Promise<void> {
    // Client handles token deletion or server invalidation
  }
}

export const authService = new AuthService();
