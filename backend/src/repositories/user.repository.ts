import { supabaseAdmin } from '../config/supabase';
import { UserProfile } from '../types/auth.types';

export class UserRepository {
  async findAll(): Promise<any[]> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, seller_profiles(*)');

    if (error) throw error;
    return data || [];
  }

  async findById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*, seller_profiles(*)')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as UserProfile;
  }

  async createProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert(profile)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as UserProfile;
  }

  async updateSellerStatus(userId: string, status: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('seller_profiles')
      .upsert({ user_id: userId, approval_status: status }, { onConflict: 'user_id' });

    if (error) throw error;
  }
}

export const userRepository = new UserRepository();
