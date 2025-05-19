import { createClient } from '@supabase/supabase-js';

// Supabase URL과 Anon Key는 환경 변수에서 가져옵니다
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Supabase 클라이언트 생성
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
