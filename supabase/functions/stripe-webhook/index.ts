import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

// Initialiser Stripe avec la clé secrète
const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
});

// Clé secrète webhook pour valider les requêtes
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

// Initialiser le client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Signature manquante', { status: 400 });
  }

  try {
    // Récupérer le corps de la requête
    const body = await req.text();
    
    // Vérifier la signature du webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      return new Response(`Erreur de signature webhook: ${err.message}`, { status: 400 });
    }

    // Traiter les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id || session.client_reference_id;
        const subscriptionId = session.subscription;
        
        if (userId && subscriptionId) {
          // Récupérer les détails de l'abonnement
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          
          // Mettre à jour l'abonnement de l'utilisateur dans la base de données
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: subscriptionId,
              status: subscription.status,
              plan: session.metadata?.plan || 'pro',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            });
            
          if (error) {
            console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
          }
        }
        break;
      }
        
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        
        if (userId) {
          // Mettre à jour l'abonnement dans la base de données
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id);
            
          if (error) {
            console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
          }
        }
        break;
      }
        
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Marquer l'abonnement comme annulé dans la base de données
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: false,
          })
          .eq('stripe_subscription_id', subscription.id);
          
        if (error) {
          console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
        }
        break;
      }
        
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          // Mettre à jour la date de la dernière facture
          const { error } = await supabase
            .from('subscriptions')
            .update({
              last_invoice_date: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
            
          if (error) {
            console.error('Erreur lors de la mise à jour de la facture:', error);
          }
        }
        break;
      }
        
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          // Marquer l'abonnement comme ayant un problème de paiement
          const { error } = await supabase
            .from('subscriptions')
            .update({
              payment_issue: true,
            })
            .eq('stripe_subscription_id', subscriptionId);
            
          if (error) {
            console.error('Erreur lors de la mise à jour de l\'état de paiement:', error);
          }
        }
        break;
      }
    }

    // Répondre avec succès
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erreur webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
}); 