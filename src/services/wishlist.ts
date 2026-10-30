import { supabase } from '../lib/supabase';
import { unwrap } from './db';
import { WishItem } from '../types';

export type WishInput = { name: string; store: string; price: number | null };

export const listWishlist = async (): Promise<WishItem[]> =>
  unwrap(await supabase.from('wishlist').select('*').order('created_at', { ascending: false }));

export const createWish = async (w: WishInput) => unwrap(await supabase.from('wishlist').insert(w));

export const updateWish = async (id: string, w: WishInput) =>
  unwrap(await supabase.from('wishlist').update(w).eq('id', id));

export const setBought = async (id: string, bought: boolean) =>
  unwrap(await supabase.from('wishlist').update({ bought }).eq('id', id));

export const deleteWish = async (id: string) =>
  unwrap(await supabase.from('wishlist').delete().eq('id', id));
