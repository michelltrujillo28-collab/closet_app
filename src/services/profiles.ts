import { supabase } from '../lib/supabase';
import { unwrap } from './db';
import { Profile, Role } from '../types';

export const listProfiles = async (): Promise<Profile[]> =>
  unwrap(await supabase.from('profiles').select('*').order('created_at', { ascending: false }));

export const updateProfileName = async (id: string, full_name: string) =>
  unwrap(await supabase.from('profiles').update({ full_name }).eq('id', id));

export const setRole = async (id: string, role: Role) =>
  unwrap(await supabase.from('profiles').update({ role }).eq('id', id));
