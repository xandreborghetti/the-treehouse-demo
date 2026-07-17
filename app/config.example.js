// config.example.js — template for Supabase credentials.
//
// When you wire the real backend (see data.js), copy this file to config.js:
//
//     cp config.example.js config.js
//
// then fill in the two values below from your Supabase project settings
// (Project Settings → API). config.js is gitignored so your keys never get
// committed. The anon key is safe for the browser ONLY when Row Level
// Security is enabled and the three members' emails are allowlisted — never
// paste the service_role key here.

export const SUPABASE_URL = 'https://YOUR-PROJECT-ref.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-PUBLIC-ANON-KEY';
