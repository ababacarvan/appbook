import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export interface UploadOptions {
  bucket: string
  path?: string
  allowedTypes?: string[]
  maxSize?: number
}

export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<{ url: string; path: string }> {
  const supabase = createClient()
  
  const { bucket, path = '', allowedTypes = [], maxSize = 10 * 1024 * 1024 } = options
  
  // Validate file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`)
  }
  
  // Validate file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} not allowed`)
  }
  
  // Generate unique filename
  const extension = file.name.split('.').pop()
  const filename = `${uuidv4()}.${extension}`
  const filePath = path ? `${path}/${filename}` : filename
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type
    })
  
  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath)
  
  return {
    url: publicUrl,
    path: filePath
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient()
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }
  
  return data.signedUrl
}