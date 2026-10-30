import * as ImagePicker from 'expo-image-picker';
import { notify } from './notify';

export type PickedImage = { uri: string; base64: string };

// Abre la galería (celular) o el selector de archivos (web)
export async function pickImage(): Promise<PickedImage | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    notify('Permiso necesario', 'Permite el acceso a tus fotos para subir una imagen.');
    return null;
  }
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [3, 4],
    quality: 0.5,
    base64: true,
  });
  if (res.canceled || !res.assets[0]?.base64) return null;
  return { uri: res.assets[0].uri, base64: res.assets[0].base64 };
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Convierte base64 a bytes (funciona igual en celular y en web)
export function base64ToBuffer(input: string): ArrayBuffer {
  const b64 = (input.includes(',') ? input.split(',')[1] : input).replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((b64.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < b64.length; i += 4) {
    const a = ALPHABET.indexOf(b64[i]);
    const b = ALPHABET.indexOf(b64[i + 1]);
    const c = i + 2 < b64.length ? ALPHABET.indexOf(b64[i + 2]) : -1;
    const d = i + 3 < b64.length ? ALPHABET.indexOf(b64[i + 3]) : -1;
    bytes[p++] = (a << 2) | (b >> 4);
    if (c !== -1) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (d !== -1) bytes[p++] = ((c & 3) << 6) | d;
  }
  return bytes.buffer.slice(0, p) as ArrayBuffer;
}
