// js/supabase-client.js

const SUPABASE_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGNoa2JtdXB1eXhnaWRuenJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDM4MDAsImV4cCI6MjA2MzQ3OTgwMH0.fQnzfcEo3tgm6prq9tdwZyQ_fXGrNvJ_abnjs0woR1Y';

// Створюємо єдиний екземпляр клієнта для всього додатку
export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Глобальні константи, які можуть знадобитися в інших файлах
export const SUPABASE_STORAGE_BUCKET = 'public-images';
export const SEND_NOTIFICATION_URL = 'https://yslchkbmupuyxgidnzrb.supabase.co/functions/v1/send-admin-notification';