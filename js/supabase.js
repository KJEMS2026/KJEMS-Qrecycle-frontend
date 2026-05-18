import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

export const supabase = createClient(
    'https://euctvsxdeiqqrpezyydr.supabase.co/',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Y3R2c3hkZWlxcXJwZXp5eWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDQwMjQsImV4cCI6MjA5MzcyMDAyNH0.HH9Tlcnv06o5T97_9Gc27BS2Ze0U4gf_OleSEVCW0XA')
