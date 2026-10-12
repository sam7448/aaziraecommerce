import { supabaseAdmin, createAuthClient } from '../config/supabase';
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
      const errMsg = (error?.message || '').toLowerCase();
      if (errMsg.includes('already') || errMsg.includes('registered') || errMsg.includes('exists')) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }

      // Fallback to regular signUp using isolated auth client
      const authClient = createAuthClient();
      const signUpRes = await authClient.auth.signUp({
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
        const signMsg = (signUpRes.error?.message || '').toLowerCase();
        if (signMsg.includes('already') || signMsg.includes('registered') || signMsg.includes('exists') || signMsg.includes('rate limit')) {
          throw new Error('An account with this email address already exists. Please sign in instead.');
        }
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

    // Auto-login to obtain session token using isolated auth client
    let token = '';
    try {
      const authClient = createAuthClient();
      const { data: sessionData } = await authClient.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (sessionData?.session) {
        token = sessionData.session.access_token;
      }
    } catch {
      // Continue even if immediate token generation fails
    }

    return {
      user: {
        id: userId,
        email: userEmail,
        role: userRole,
      },
      token,
    };
  }

  async login(credentials: LoginCredentials): Promise<any> {
    const authClient = createAuthClient();
    const { data, error } = await authClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !data.session) {
      throw new Error(error?.message || 'Invalid credentials');
    }

    // Resolve role: prefer user_metadata, then fall back to profiles table
    let role = data.user.user_metadata?.role;
    const fullName: string = data.user.user_metadata?.full_name || '';

    if (!role || role === 'customer') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      if (profile?.role) {
        role = profile.role;
      }
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email!,
        fullName,
        role: role || 'customer',
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
