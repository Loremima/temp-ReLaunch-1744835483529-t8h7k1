import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialiser Stripe avec la clé secrète
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

// Prix Stripe pour chaque forfait
const PRICES = {
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
    const { plan, returnUrl } = await req.json();

    // Vérifier les données requises
    if (!plan) {
      throw new Error('Données manquantes. Veuillez fournir un plan.');
    }

    // Vérifier que le plan est valide
    if (!['pro', 'business'].includes(plan)) {
      throw new Error('Plan invalide. Les plans disponibles sont: pro, business.');
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      throw new Error(`Erreur lors de la récupération du profil: ${profileError.message}`);
    }

    // Créer ou récupérer le client Stripe
    const stripeCustomers = await stripe.customers.list({
      email: profile.email || user.email,
      limit: 1,
    });

    let stripeCustomerId: string;

    if (stripeCustomers.data.length > 0) {
      // Utiliser le client existant
      stripeCustomerId = stripeCustomers.data[0].id;
    } else {
      // Créer un nouveau client
      const newCustomer = await stripe.customers.create({
        email: profile.email || user.email,
        name: profile.full_name || undefined,
        metadata: {
          user_id: user.id,
        },
      });
      stripeCustomerId = newCustomer.id;
    }

    // URL de succès et d'annulation
    const success_url = returnUrl || `${req.headers.get('origin')}/app/settings/account?checkout=success`;
    const cancel_url = `${req.headers.get('origin')}/app/settings/account?checkout=canceled`;

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
      success_url,
      cancel_url,
      client_reference_id: user.id,
      subscription_data: {
        metadata: {
          user_id: user.id,
        },
      },
      metadata: {
        user_id: user.id,
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
  } catch (error: any) {
    console.error('Erreur dans create-checkout:', error);
    
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