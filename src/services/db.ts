// Convierte la respuesta de Supabase en datos o lanza un Error (control de errores centralizado)
export function unwrap<T = any>(res: { data: any; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}
