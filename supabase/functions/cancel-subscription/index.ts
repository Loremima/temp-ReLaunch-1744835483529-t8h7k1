import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialiser Stripe avec la clé secrète
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

// Initialiser le client Supabase
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  // Définir les headers CORS pour autoriser toutes les origines pendant le développement
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentification requise');
    }

    // Extraire le token JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Vérifier le token et récupérer les informations utilisateur
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié');
    }

    // Récupérer les données de la requête
    const { cancelAtPeriodEnd } = await req.json();

    // Vérifier les données requises
    if (cancelAtPeriodEnd === undefined) {
      throw new Error('Données manquantes. Veuillez préciser cancelAtPeriodEnd (true/false).');
    }

    // Récupérer l'abonnement actuel de l'utilisateur
    const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (subscriptionError) {
      throw new Error(`Erreur lors de la récupération de l'abonnement: ${subscriptionError.message}`);
    }

    if (!subscriptions || !subscriptions.stripe_subscription_id) {
      throw new Error('Aucun abonnement actif trouvé');
    }

    // Mettre à jour l'abonnement dans Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      subscriptions.stripe_subscription_id,
      { cancel_at_period_end: cancelAtPeriodEnd }
    );

    // Mise à jour de la base de données Supabase
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptions.id);

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour de l'abonnement dans la base de données: ${updateError.message}`);
    }

    // Retourner le statut mis à jour
    return new Response(
      JSON.stringify({ 
        success: true,
        cancel_at_period_end: cancelAtPeriodEnd,
        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erreur dans cancel-subscription:', error);
    
    // Gérer les erreurs
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 