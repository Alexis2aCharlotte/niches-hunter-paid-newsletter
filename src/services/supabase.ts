import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization
let supabaseClient: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
    }
    
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

/**
 * Niche from database (full structure)
 */
export interface Niche {
  id: string;
  title: string;
  category: string;
  tags: string[];
  score: number;
  opportunity: string;
  gap: string;
  move: string;
  stats: string;
  market_analysis: string;
  key_learnings: string[];
  improvements: string[];
  risks: string[];
  tech_stack: string[];
  trending: string;
  display_code: string;
  created_at: string;
}

/**
 * Paid subscriber
 */
export interface PaidSubscriber {
  id: string;
  email: string;
  customer_id: string;
  is_active: boolean;
  plan_type: string;
}

/**
 * Get latest niches from the database
 * Fetches the most recent niches (last 24h or last X niches)
 */
export async function getLatestNiches(limit: number = 2): Promise<Niche[]> {
  const { data, error } = await getSupabase()
    .from('niches')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest niches:', error);
    throw error;
  }

  console.log(`   ✅ Found ${data?.length || 0} niches`);
  return data || [];
}

/**
 * Get active paid subscribers
 * ⚠️ FORCÉ SUR TABLE TEST - Changer quand prêt pour prod
 */
export async function getActivePaidSubscribers(): Promise<PaidSubscriber[]> {
  // ⚠️ FORCÉ SUR TABLE TEST UNIQUEMENT
  const tableName = 'paid_newsletter_subscribers_test';
  
  console.log(`   📋 Using table: ${tableName} (🧪 TEST MODE FORCÉ)`);
  
  const { data, error } = await getSupabase()
    .from(tableName)
    .select('*')
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching paid subscribers:', error);
    return [];
  }

  return data || [];
}


