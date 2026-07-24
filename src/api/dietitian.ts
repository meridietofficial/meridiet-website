import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import apiClient from './client'
import ENDPOINTS from './endpoints'

// ── Types ────────────────────────────────────────────────────

type AwsKeyApiResponse = {
  success: boolean
  message: string
  data: {
    access_key_id: string
    secret_access_key: string
    region: string
    bucket: string
    base_url: string
  }
}

type AwsCredentials = {
  accessKeyId: string
  secretAccessKey: string
  region: string
  bucket: string
  baseUrl: string
}

type DocKeys = 'profilePhoto' | 'degreeCert' | 'regCert' | 'idProof'

export type DietitianRegistrationBody = {
  fullName: string
  email: string
  phone: string
  state: string
  city: string
  password: string
  registrationNumber: string
  experience: string
  specialization: string[]
  degrees: { degree: string; institute: string; year: string }[]
  documents: {
    profilePhoto: string
    degreeCertificate: string
    registrationCertificate: string
    idProof: string
  }
}

// ── Get AWS credentials from your API ────────────────────────
async function getAwsKeys(): Promise<AwsCredentials> {
  const secret = import.meta.env.VITE_AWS_REVEAL_SECRET
  console.log('[AWS Keys] Fetching credentials, secret present:', !!secret)
  try {
    const res = await apiClient.apiPost<AwsKeyApiResponse>(ENDPOINTS.dietitian.awsKeys, { secret })
    const creds: AwsCredentials = {
      accessKeyId:     res.data.access_key_id,
      secretAccessKey: res.data.secret_access_key,
      region:          res.data.region,
      bucket:          res.data.bucket,
      baseUrl:         res.data.base_url,
    }
    console.log('[AWS Keys] Credentials received:', { region: creds.region, bucket: creds.bucket })
    return creds
  } catch (err) {
    console.error('[AWS Keys] Failed to fetch credentials:', err)
    throw err
  }
}

async function detectExtension(file: File): Promise<string> {
  const buf  = await file.slice(0, 12).arrayBuffer()
  const u8   = new Uint8Array(buf)
  const hex  = Array.from(u8).map(b => b.toString(16).padStart(2, '0')).join('')
  const ftyp = new TextDecoder().decode(u8.slice(4, 12))

  if (hex.startsWith('ffd8ff'))   return 'jpg'
  if (hex.startsWith('89504e47')) return 'png'
  if (hex.startsWith('25504446')) return 'pdf'
  if (hex.startsWith('47494638')) return 'gif'

  // HEIC/HEIF that the browser couldn't convert — allow through
  if (ftyp.includes('heic') || ftyp.includes('heix') ||
      ftyp.includes('mif1') || ftyp.includes('msf1') ||
      ftyp.includes('heif')) return 'heic'

  // Trust the MIME type set by normalizeImageFile as last resort
  if (file.type === 'image/heic' || file.type === 'image/heif') return 'heic'
  if (file.type === 'image/jpeg') return 'jpg'
  if (file.type === 'image/png')  return 'png'

  throw new Error(`File "${file.name}" is not a valid image or PDF. Please upload a JPG, PNG, or PDF file.`)
}

// ── Upload one file to S3, returns public URL ─────────────────
async function uploadFileToS3(
  file: File,
  folder: string,
  credentials: AwsCredentials
): Promise<string> {
  console.log(`[S3 Upload] Starting upload — file: ${file.name}, size: ${file.size} bytes, folder: ${folder}`)

  const ext = await detectExtension(file)

  const client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId:     credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })

  const key = `dietitians/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  try {
    const buffer = await file.arrayBuffer()
    const MIME: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf', gif: 'image/gif', heic: 'image/heic' }
    await client.send(new PutObjectCommand({
      Bucket:      credentials.bucket,
      Key:         key,
      Body:        new Uint8Array(buffer),
      ContentType: MIME[ext] ?? 'application/octet-stream',
    }))
    const url = `${credentials.baseUrl}/${key}`
    console.log(`[S3 Upload] ✓ Uploaded ${file.name} → ${url}`)
    return url
  } catch (err) {
    console.error(`[S3 Upload] ✗ Failed to upload ${file.name}:`, err)
    throw err
  }
}

// ── Upload a single file to S3, return its public URL ────────
export async function uploadSingleDocument(file: File, folder: string): Promise<string> {
  const credentials = await getAwsKeys()
  return uploadFileToS3(file, folder, credentials)
}

// ── Delete a file from S3 by its public URL (best-effort, never throws) ──
export async function deleteDocument(url: string | null | undefined): Promise<void> {
  if (!url) return
  try {
    const credentials = await getAwsKeys()
    // Only touch objects that actually live in our bucket
    if (!url.startsWith(credentials.baseUrl)) return
    const key = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, '')
    if (!key) return
    const client = new S3Client({
      region: credentials.region,
      credentials: {
        accessKeyId:     credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    })
    await client.send(new DeleteObjectCommand({ Bucket: credentials.bucket, Key: key }))
    console.log('[S3 Delete] ✓ Deleted old file:', key)
  } catch (err) {
    console.warn('[S3 Delete] Could not delete old file:', err)
  }
}

// ── Upload all documents, return S3 URLs ─────────────────────
export async function uploadDocuments(
  docs: Record<DocKeys, File | null>
): Promise<Record<DocKeys, string>> {
  console.log('[Upload Docs] Starting document uploads...')
  console.log('[Upload Docs] Files:', Object.entries(docs).map(([k, v]) => `${k}: ${v ? v.name : 'null'}`))

  let credentials: AwsCredentials
  try {
    credentials = await getAwsKeys()
  } catch (err) {
    console.error('[Upload Docs] Aborting — could not get AWS credentials:', err)
    throw err
  }

  const folderMap: Record<DocKeys, string> = {
    profilePhoto: 'profile-photos',
    degreeCert:   'degree-certificates',
    regCert:      'registration-certificates',
    idProof:      'id-proofs',
  }

  const results = await Promise.all(
    (Object.keys(docs) as DocKeys[]).map(async (key) => {
      const file = docs[key]
      if (!file) {
        console.log(`[Upload Docs] Skipping ${key} — no file selected`)
        return { key, url: '' }
      }
      try {
        const url = await uploadFileToS3(file, folderMap[key], credentials)
        return { key, url }
      } catch (err) {
        console.error(`[Upload Docs] ✗ Failed for ${key}:`, err)
        throw err
      }
    })
  )

  console.log('[Upload Docs] ✓ All uploads complete:', results.map(r => `${r.key}: ${r.url}`))
  return Object.fromEntries(results.map(r => [r.key, r.url])) as Record<DocKeys, string>
}

// ── Dietitian profile (GET, JWT-protected) ───────────────────
export type DietitianProfile = {
  id: number
  user_id: number
  full_name: string
  email: string
  phone_code: string | null
  phone_number: string | null
  avatar_url: string | null
  is_active: number
  date_of_birth: string | null
  gender: string | null
  bio: string | null
  state: string | null
  city: string | null
  registration_number: string | null
  experience: string | null
  specialization: string[]
  languages: string[]
  services: string[]
  degrees: { year: string | null; degree: string; institute: string }[]
  awards: { title?: string; organization?: string; year?: string }[]
  availability: Record<string, string[]> | null
  is_verified: number
  is_online: number
  documents: {
    profile_photo: string | null
    logo_url: string | null
    degree_certificate: string | null
    registration_certificate: string | null
    id_proof: string | null
    experience_certificate: string | null
  }
  appointment_fee: number | null
  appointment_currency: string | null
  sync_offline_slots?: boolean
  created_at: string
  updated_at: string
}

type DietitianProfileResponse = {
  success: boolean
  message: string
  data: DietitianProfile
}

// ── Specializations (public, for filters/tabs) ───────────────
export type Specialization = {
  value: string        // canonical value stored on dietitians (use for filtering)
  label: string        // short display label (use for chips/tabs)
  slug: string
  icon: string | null
  image_url: string | null
  count: number        // how many dietitians have this specialization
  is_active: boolean
  is_custom: boolean
}

type SpecializationsResponse = {
  success: boolean
  message: string
  data: Specialization[]
}

// ── Dietitian list (public, card shape) ──────────────────────
export type AvailableDate = {
  date: string          // ISO date, e.g. "2026-06-05"
  day: string           // e.g. "Friday"
  slots: string[]       // working-hour ranges, e.g. ["09:00-18:00"]
  booked_slots?: string[] // slot start times already booked, e.g. ["09:00"]
}

export type NextAvailable = {
  date: string
  day: string
  slot: string          // a single range, e.g. "09:00-18:00"
}

export type DietitianCard = {
  id: number
  full_name: string
  title: string
  avatar_url: string | null
  profile_photo: string | null
  rating: number
  reviews: number
  experience: string
  location: string
  city?: string
  state?: string
  gender?: string
  about?: string | null
  specialization: string[]
  languages: string[]
  services?: string[]
  education?: { year: string | null; degree: string; institute: string }[]
  awards?: { title?: string; organization?: string; year?: string }[]
  consultations?: number
  fee?: number | null
  appointment_fee?: number | null
  appointment_currency?: string | null
  next_available: NextAvailable | null
  available_dates: AvailableDate[]
  availability: string
  is_verified: number | boolean
}

export type DietitianListParams = {
  search?: string
  specialization?: string
  gender?: string
  location?: string
  language?: string
  experience?: string            // bucket: 0-2 | 3-5 | 5-10 | 10+
  min_years?: number
  max_years?: number
  available_now?: boolean
  min_fee?: number
  max_fee?: number
  sort?: 'top_rated' | 'most_reviewed' | 'available_now' | 'experience'
  page?: number
  limit?: number
}

export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number }

type DietitianListResponse = {
  success: boolean
  message: string
  data: DietitianCard[]
  meta: PaginationMeta
}

type ConsultationFeeResponse = {
  success: boolean
  message: string
  data: { amount?: number; fee?: number; consultation_fee?: number; currency?: string }
}

// ── Submit registration to your backend ──────────────────────
const dietitianApi = {
  register(body: DietitianRegistrationBody) {
    return apiClient.apiPost(ENDPOINTS.dietitian.register, body)
  },

  async getSpecializations(): Promise<Specialization[]> {
    const res = await apiClient.apiGet<SpecializationsResponse>(ENDPOINTS.dietitian.specializations)
    return res.data
  },

  async getConsultationFee(): Promise<number> {
    const res = await apiClient.apiGet<ConsultationFeeResponse>(ENDPOINTS.consultation.fee)
    const d = res.data
    // Tolerate a few likely field names until the exact shape is confirmed
    return Number(d.amount ?? d.fee ?? d.consultation_fee ?? 0)
  },

  async getDietitianById(id: number): Promise<DietitianCard> {
    const res = await apiClient.apiGet<{ success: boolean; message: string; data: DietitianCard }>(
      `${ENDPOINTS.dietitian.list}/${id}`
    )
    return res.data
  },

  async listDietitians(params: DietitianListParams = {}): Promise<{ data: DietitianCard[]; meta: PaginationMeta }> {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === false) return
      qs.append(key, String(val))
    })
    const query = qs.toString()
    const res = await apiClient.apiGet<DietitianListResponse>(
      `${ENDPOINTS.dietitian.list}${query ? `?${query}` : ''}`
    )
    return { data: res.data, meta: res.meta }
  },

  async getProfile(): Promise<DietitianProfile> {
    const res = await apiClient.apiGet<DietitianProfileResponse>(ENDPOINTS.dietitian.profile)
    return res.data
  },

  async updateProfile(body: Record<string, unknown>): Promise<DietitianProfile> {
    const res = await apiClient.apiPut<DietitianProfileResponse>(ENDPOINTS.dietitian.profile, body)
    return res.data
  },

  changePassword(body: { current_password: string; new_password: string }) {
    return apiClient.apiPut<{ success: boolean; message: string }>(ENDPOINTS.dietitian.changePassword, body)
  },

  async setOnlineStatus(is_online: boolean): Promise<boolean> {
    const res = await apiClient.apiPatch<{ success: boolean; data: { is_online: boolean } }>(
      ENDPOINTS.dietitian.onlineStatus,
      { is_online }
    )
    return res.data.is_online
  },

  async setSyncOfflineSlots(enabled: boolean): Promise<void> {
    await apiClient.apiPatch(ENDPOINTS.dietitian.syncOfflineSlots, { enabled })
  },

  deleteAccount(password: string) {
    return apiClient.apiDeleteWithBody<{ success: boolean; message: string }>(
      ENDPOINTS.dietitian.deleteAccount,
      { password }
    )
  },
}

export default dietitianApi
