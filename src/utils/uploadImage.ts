import { supabase } from '../lib/supabaseClient'

export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}
