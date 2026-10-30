import { supabase } from '../lib/supabase';
import { unwrap } from './db';
import { Category } from '../types';

export const listCategories = async (): Promise<Category[]> =>
  unwrap(await supabase.from('categories').select('*').order('sort_order').order('name'));

export const createCategory = async (name: string) =>
  unwrap(await supabase.from('categories').insert({ name }));

export const updateCategory = async (id: string, name: string) =>
  unwrap(await supabase.from('categories').update({ name }).eq('id', id));

export const deleteCategory = async (id: string) =>
  unwrap(await supabase.from('categories').delete().eq('id', id));
