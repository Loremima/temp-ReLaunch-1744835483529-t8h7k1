import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { format, addDays } from 'npm:date-fns@3.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Validate request
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      throw new Error('API key is required');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from API key
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('user_id, followup_timing')
      .eq('api_key', apiKey)
      .single();

    if (settingsError || !settings) {
      throw new Error('Invalid API key');
    }

    // Parse request body
    const { name, email, project, first_contact } = await req.json();

    if (!name || !email) {
      throw new Error('Name and email are required');
    }

    // Calculate next follow-up date
    const firstFollowupDays = settings.followup_timing['1'] || 3;
    const nextFollowup = format(
      addDays(first_contact ? new Date(first_contact) : new Date(), firstFollowupDays),
      'yyyy-MM-dd'
    );

    // Create prospect
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .insert({
        user_id: settings.user_id,
        name,
        email,
        project,
        first_contact: first_contact || format(new Date(), 'yyyy-MM-dd'),
        next_followup: nextFollowup,
        followup_stage: 1,
        status: 'Pending'
      })
      .select()
      .single();

    if (prospectError) {
      throw prospectError;
    }

    return new Response(JSON.stringify(prospect), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: error.message === 'Invalid API key' ? 401 : 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});