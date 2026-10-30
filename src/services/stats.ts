import { supabase } from '../lib/supabase';
import { Stats } from '../types';

async function count(table: string): Promise<number> {
  const { count: total, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return total ?? 0;
}

export async function getStats(): Promise<Stats> {
  const [users, garments, outfits, wishlist] = await Promise.all([
    count('profiles'), count('garments'), count('outfits'), count('wishlist'),
  ]);
  return { users, garments, outfits, wishlist };
}
