import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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
  highestDegree: string
  registrationNumber: string
  experience: string
  specialization: string
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

// ── Upload one file to S3, returns public URL ─────────────────
async function uploadFileToS3(
  file: File,
  folder: string,
  credentials: AwsCredentials
): Promise<string> {
  console.log(`[S3 Upload] Starting upload — file: ${file.name}, size: ${file.size} bytes, folder: ${folder}`)

  const client = new S3Client({
    region: credentials.region,
    credentials: {
      accessKeyId:     credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  })

  const ext = file.name.split('.').pop()
  const key = `dietitians/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  try {
    const buffer = await file.arrayBuffer()
    await client.send(new PutObjectCommand({
      Bucket:      credentials.bucket,
      Key:         key,
      Body:        new Uint8Array(buffer),
      ContentType: file.type,
    }))
    const url = `${credentials.baseUrl}/${key}`
    console.log(`[S3 Upload] ✓ Uploaded ${file.name} → ${url}`)
    return url
  } catch (err) {
    console.error(`[S3 Upload] ✗ Failed to upload ${file.name}:`, err)
    throw err
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

// ── Submit registration to your backend ──────────────────────
const dietitianApi = {
  register(body: DietitianRegistrationBody) {
    return apiClient.apiPost(ENDPOINTS.dietitian.register, body)
  },
}

export default dietitianApi
