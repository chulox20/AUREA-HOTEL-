import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if URL is valid HTTP/HTTPS
const isValidUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl : 'https://placeholder.supabase.co';

if (!rawUrl || !supabaseAnonKey || !isValidUrl(rawUrl)) {
  console.warn(
    'Supabase credentials are not configured or are invalid. Please set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. Using demo mock fallback.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-key'
);

