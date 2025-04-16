import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialiser Stripe avec la clé secrète
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

// Prix Stripe pour chaque forfait
const PRICES = {
  starter: Deno.env.get('STRIPE_PRICE_STARTER') || 'price_starter',
  pro: Deno.env.get('STRIPE_PRICE_PRO') || 'price_pro',
  enterprise: Deno.env.get('STRIPE_PRICE_ENTERPRISE') || 'price_enterprise',
};

serve(async (req) => {
  // Définir les headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // Gérer les requêtes OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Récupérer les données de la requête
    const { plan, customer_email, customer_name, user_id, success_url, cancel_url } = await req.json();

    // Vérifier les données requises
    if (!plan || !customer_email || !user_id || !success_url || !cancel_url) {
      throw new Error('Données manquantes. Veuillez fournir un plan, email, user_id, et URLs de redirection.');
    }

    // Vérifier que le plan est valide
    if (!['starter', 'pro', 'enterprise'].includes(plan)) {
      throw new Error('Plan invalide. Les plans disponibles sont: starter, pro, enterprise.');
    }

    // Créer ou récupérer le client Stripe
    const stripeCustomers = await stripe.customers.list({
      email: customer_email,
      limit: 1,
    });

    let stripeCustomerId: string;

    if (stripeCustomers.data.length > 0) {
      // Utiliser le client existant
      stripeCustomerId = stripeCustomers.data[0].id;
    } else {
      // Créer un nouveau client
      const newCustomer = await stripe.customers.create({
        email: customer_email,
        name: customer_name || undefined,
        metadata: {
          user_id: user_id,
        },
      });
      stripeCustomerId = newCustomer.id;
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES[plan as keyof typeof PRICES],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      client_reference_id: user_id,
      subscription_data: {
        metadata: {
          user_id: user_id,
        },
      },
      metadata: {
        user_id: user_id,
        plan: plan,
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
  } catch (error) {
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