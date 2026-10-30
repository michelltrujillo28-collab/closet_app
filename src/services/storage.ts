import { supabase } from '../lib/supabase';
import { base64ToBuffer, PickedImage } from '../lib/images';

// Sube la foto al bucket "garments" dentro de la carpeta del usuario y devuelve la URL pública
export async function uploadGarmentImage(userId: string, img: PickedImage): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from('garments')
    .upload(path, base64ToBuffer(img.base64), { contentType: 'image/jpeg' });
  if (error) throw new Error(error.message);
  return supabase.storage.from('garments').getPublicUrl(path).data.publicUrl;
}
