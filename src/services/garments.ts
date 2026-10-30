import { supabase } from '../lib/supabase';
import { unwrap } from './db';
import { GarmentWithRel } from '../types';

export type GarmentInput = {
  name: string;
  category_id: string | null;
  color: string;
  size: string;
  brand: string;
  image_url: string | null;
};

export const listGarments = async (): Promise<GarmentWithRel[]> =>
  unwrap(
    await supabase.from('garments').select('*, categories(name)').order('created_at', { ascending: false })
  );

// Solo admin: todas las prendas con el correo del dueño
export const listAllGarments = async (): Promise<GarmentWithRel[]> =>
  unwrap(
    await supabase
      .from('garments')
      .select('*, categories(name), profiles(email)')
      .order('created_at', { ascending: false })
  );

export const createGarment = async (g: GarmentInput) => unwrap(await supabase.from('garments').insert(g));

export const updateGarment = async (id: string, g: GarmentInput) =>
  unwrap(await supabase.from('garments').update(g).eq('id', id));

export const deleteGarment = async (id: string) =>
  unwrap(await supabase.from('garments').delete().eq('id', id));
