import { supabase } from '../lib/supabase';
import { unwrap } from './db';
import { Outfit } from '../types';

export type OutfitInput = { id?: string; name: string; occasion: string; garmentIds: string[] };

export const listOutfits = async (): Promise<Outfit[]> =>
  unwrap(
    await supabase
      .from('outfits')
      .select('*, outfit_items(garment_id, garments(name, image_url))')
      .order('created_at', { ascending: false })
  );

// Crea o edita un outfit y reemplaza sus prendas (tabla intermedia outfit_items)
export async function saveOutfit(input: OutfitInput): Promise<void> {
  let outfitId = input.id;
  if (outfitId) {
    unwrap(await supabase.from('outfits').update({ name: input.name, occasion: input.occasion }).eq('id', outfitId));
    unwrap(await supabase.from('outfit_items').delete().eq('outfit_id', outfitId));
  } else {
    const row = unwrap<{ id: string }>(
      await supabase.from('outfits').insert({ name: input.name, occasion: input.occasion }).select('id').single()
    );
    outfitId = row.id;
  }
  if (input.garmentIds.length > 0) {
    const id = outfitId as string;
    unwrap(
      await supabase.from('outfit_items').insert(input.garmentIds.map((g) => ({ outfit_id: id, garment_id: g })))
    );
  }
}

export const deleteOutfit = async (id: string) =>
  unwrap(await supabase.from('outfits').delete().eq('id', id));
