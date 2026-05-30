import { createClient } from '@supabase/supabase-js';

// Reemplaza con tus valores reales de tu proyecto de Supabase
const supabaseUrl = 'https://tceebgtgazwxkehtbmml.supabase.co'; 
const supabaseAnonKey = 'sb_publishable_XKmgTy_rVTW8pSYCeD7XUQ_oYp5UQ0F';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);