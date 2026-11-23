import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const bucket = formData.get('bucket') as string || 'books'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('Uploading file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      bucket: bucket
    })

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Max size is ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Validate file type par bucket
    const allowedTypes: Record<string, string[]> = {
      covers: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
      books: ['application/pdf', 'application/epub+zip', 'application/zip', 'text/plain'],
      audio: ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a'],
      videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
    }

    const allowed = allowedTypes[bucket] || []
    if (allowed.length > 0 && !allowed.includes(file.type) && !file.type.includes('octet-stream')) {
      return NextResponse.json(
        { 
          error: `File type "${file.type}" not allowed for bucket "${bucket}". Allowed types: ${allowed.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const extension = file.name.split('.').pop()
    const filename = `${uuidv4()}.${extension}`
    const filePath = `${user.id}/${filename}`

    console.log('Uploading to:', bucket, filePath)

    // Upload to Supabase Storage
    const supabase = createClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) {
      console.error('Upload error:', error)
      
      if (error.message?.includes('Bucket not found')) {
        return NextResponse.json(
          { error: `Bucket "${bucket}" does not exist. Please create it in Supabase Storage.` },
          { status: 400 }
        )
      }
      
      if (error.message?.includes('row-level security policy')) {
        return NextResponse.json(
          { error: 'Access denied. Please configure RLS policies in Supabase Storage.' },
          { status: 403 }
        )
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('Upload successful:', publicUrl)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      bucket: bucket
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}