import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


const SUPABASE_URL =
    "https://vgqmsehfwanxcwvgaqgk.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_rMa35GMwQyFTppX4119kBA_Gv83y9Sp";


export const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );