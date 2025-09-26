import { createClient } from '@supabase/supabase-js'

// For demo purposes, we'll use placeholder values
// In production, replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database Types
export interface User {
  id: string
  name: string
  phone: string
  created_at: string
  is_verified: boolean
}

export interface VerificationCode {
  id: string
  phone: string
  code: string
  expires_at: string
  is_used: boolean
  created_at: string
}

export interface CropPrediction {
  id: string
  user_id: string
  prediction_type: 'manual' | 'ai'
  location?: {
    latitude: number
    longitude: number
    address: string
  }
  soil_data?: {
    nitrogen: number
    phosphorus: number
    potassium: number
    ph: number
  }
  soilgrids_data?: {
    organic_carbon: number
    clay_content: number
    sand_content: number
    silt_content: number
    bulk_density: number
  }
  prediction_result: {
    crop_type: string
    yield_prediction: number
    confidence: number
    recommendations: string[]
    expected_harvest_date: string
    estimated_yield: string
  }
  created_at: string
}

// Initialize database tables (run this once)
export const initializeDatabase = async () => {
  // Users table
  const { error: usersError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        is_verified BOOLEAN DEFAULT FALSE
      );
    `
  })

  // Verification codes table
  const { error: codesError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS verification_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        phone TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  // Crop predictions table
  const { error: predictionsError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS crop_predictions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id),
        prediction_type TEXT CHECK (prediction_type IN ('manual', 'ai')),
        location JSONB,
        soil_data JSONB,
        soilgrids_data JSONB,
        prediction_result JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  if (usersError) console.error('Users table error:', usersError)
  if (codesError) console.error('Codes table error:', codesError)
  if (predictionsError) console.error('Predictions table error:', predictionsError)
}