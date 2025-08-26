// File: supabase.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://mfpwhkuojejorixvctwj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcHdoa3VvamVqb3JpeHZjdHdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTY3OTcsImV4cCI6MjA3MTc5Mjc5N30.zDS1K3dn99jr0-P3mXX4SoC6DrcMMp25tq0-kMFR1pg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});