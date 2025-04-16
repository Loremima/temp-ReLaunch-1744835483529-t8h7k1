import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialiser Stripe avec la clé secrète
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

// Prix Stripe pour chaque forfait
const PRICES = {
  free: Deno.env.get('STRIPE_PRICE_FREE') || 'price_free',
  pro: Deno.env.get('STRIPE_PRICE_PRO') || 'price_pro',
  business: Deno.env.get('STRIPE_PRICE_BUSINESS') || 'price_business',
};

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
    const { newPlan, returnUrl } = await req.json();

    // Vérifier les données requises
    if (!newPlan) {
      throw new Error('Données manquantes. Veuillez fournir un nouveau plan.');
    }

    // Vérifier que le plan est valide
    if (!['free', 'pro', 'business'].includes(newPlan)) {
      throw new Error('Plan invalide. Les plans disponibles sont: free, pro, business.');
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

    const returnUrlWithParams = new URL(returnUrl || `${req.headers.get('origin')}/app/settings/account`);
    returnUrlWithParams.searchParams.set('update', 'success');

    // Créer une session de paiement pour changer d'abonnement
    const session = await stripe.billingPortal.sessions.create({
      customer: subscriptions.stripe_customer_id,
      return_url: returnUrlWithParams.toString(),
      flow_data: {
        type: 'subscription_update',
        subscription_update: {
          subscription: subscriptions.stripe_subscription_id,
          items: [
            {
              id: subscriptions.stripe_subscription_item_id,
              price: PRICES[newPlan as keyof typeof PRICES],
            },
          ],
        },
      },
    });

    // Retourner l'URL de la session
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erreur dans update-subscription:', error);
    
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