import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wcpilbmiflxnjfhnhgob.supabase.co";
const supabaseAnonKey = "sb_publishable_vOHOjDriIwBEOuq4si_kSw_J4VoK_oM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
