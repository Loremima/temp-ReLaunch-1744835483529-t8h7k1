import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuration des en-têtes CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("=== DÉBUT FONCTION ===");
  console.log("Headers reçus:", JSON.stringify(Object.fromEntries(req.headers), null, 2));
  
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === 'OPTIONS') {
    console.log("Requête OPTIONS détectée");
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Création du client Supabase SIMPLE avec SERVICE_ROLE_KEY...");
    // Créer un client Supabase simple, comme dans send-email-direct
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      // Pas d'options supplémentaires ici
    );
    console.log("Client Supabase créé");

    // Structure pour suivre les résultats
    const results = {
      success: 0,
      failed: 0,
      duplicates: 0,
      details: [],
    };

    // Récupérer TOUS les prospects
    console.log("Récupération de TOUS les prospects (sans filtre de statut)...");
    const { data: prospects, error: prospectsError } = await supabaseClient
      .from('prospects')
      .select('*');

    if (prospectsError) {
      console.error("Erreur lors de la récupération de tous les prospects:", prospectsError);
      throw prospectsError;
    }

    console.log(`${prospects ? prospects.length : 0} prospects trouvés au total`);
    
    // Afficher les statuts distincts pour aider au débogage
    const statuses = prospects ? [...new Set(prospects.map(p => p.status))] : [];
    console.log(`Statuts distincts trouvés: ${JSON.stringify(statuses)}`);
    
    if (!prospects || prospects.length === 0) {
      console.warn("Aucun prospect trouvé dans la table");
      // Journaliser le résultat vide
      await supabaseClient
        .from('scheduled_job_logs')
        .insert({
          job_type: 'email_sending',
          results: { error: "Aucun prospect trouvé dans la table" },
          executed_at: new Date().toISOString()
        });
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Aucun prospect trouvé dans la table",
          results: results
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Récupérer tous les templates disponibles
    console.log("Récupération de tous les templates...");
    const { data: allTemplates, error: templatesError } = await supabaseClient
      .from('templates')
      .select('*')
      .order('stage', { ascending: true });

    if (templatesError) {
      console.error("Erreur lors de la récupération des templates:", templatesError);
      throw templatesError;
    }

    console.log(`${allTemplates ? allTemplates.length : 0} templates trouvés`);

    if (!allTemplates || allTemplates.length === 0) {
      console.warn("Aucun template disponible");
      await supabaseClient
        .from('scheduled_job_logs')
        .insert({
          job_type: 'email_sending',
          results: { error: "Aucun template disponible" },
          executed_at: new Date().toISOString()
        });
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Aucun template disponible",
          results: results
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Récupérer tous les paramètres d'email
    console.log("Récupération des paramètres d'email...");
    const { data: allSettings, error: settingsError } = await supabaseClient
      .from('settings')
      .select('*');

    if (settingsError) {
      console.error("Erreur lors de la récupération des paramètres:", settingsError);
      throw settingsError;
    }

    console.log(`${allSettings ? allSettings.length : 0} configurations trouvées`);

    // Traiter chaque prospect
    console.log("Traitement des prospects...");
    const processResults = await Promise.all(
      prospects.map(async (prospect) => {
        console.log(`Traitement du prospect: ${prospect.email} (user_id: ${prospect.user_id}, followup_stage: ${prospect.followup_stage})`);
        
        // Trouver les templates pour l'utilisateur du prospect
        const templates = allTemplates.filter(t => t.user_id === prospect.user_id);
        if (templates.length === 0) {
          console.warn(`Pas de template disponible pour l'utilisateur ${prospect.user_id}`);
          return {
            success: false,
            prospect: prospect.email,
            error: "Aucun template disponible pour cet utilisateur"
          };
        }
        
        // Trouver les paramètres pour l'utilisateur du prospect
        const settings = allSettings.find(s => s.user_id === prospect.user_id);
        if (!settings) {
          console.warn(`Pas de paramètres d'email pour l'utilisateur ${prospect.user_id}`);
          return {
            success: false,
            prospect: prospect.email,
            error: "Aucun paramètre d'email configuré pour cet utilisateur"
          };
        }
        
        // Trouver le template correspondant à l'étape du prospect
        const template = templates.find(t => t.stage === prospect.followup_stage) || templates[0];
        console.log(`Envoi à ${prospect.email} (étape ${prospect.followup_stage}) avec template ${template.id}`);

        // Vérifier si ce template spécifique a déjà été envoyé à ce prospect
        const { data: templateHistory } = await supabaseClient
          .from('history')
          .select('*')
          .eq('prospect_id', prospect.id)
          .eq('template_id', template.id)
          .maybeSingle();
          
        if (templateHistory) {
          console.log(`DOUBLON DÉTECTÉ: Template ${template.id} déjà envoyé au prospect ${prospect.id} le ${templateHistory.sent_at}`);
          return {
            success: false,
            prospect: prospect.email,
            error: "Template déjà envoyé à ce prospect",
            duplicate: true
          };
        }

        try {
          console.log(`Appel de la fonction send-email-direct pour ${prospect.email}...`);
          const response = await fetch(
            `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email-direct`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                email_provider: settings.email_provider,
                email_api_key: settings.email_api_key,
                to: prospect.email,
                name: prospect.name,
                project: prospect.project || 'votre entreprise',
                company: prospect.company || 'votre entreprise',
                subject: template.subject,
                html: template.body,
                prospect_id: prospect.id,
                template_id: template.id,
                user_id: prospect.user_id
              })
            }
          );

          const responseData = await response.json();
          console.log(`Réponse pour ${prospect.email}:`, responseData);
          
          if (response.ok) {
            results.success++;
            console.log(`Email envoyé avec succès à ${prospect.email}`);
          } else {
            results.failed++;
            console.error(`Échec de l'envoi à ${prospect.email}:`, responseData);
          }
          
          if (responseData.duplicate) {
            results.duplicates++;
            console.log(`Email à ${prospect.email} marqué comme doublon`);
          }

          return {
            success: response.ok,
            prospect: prospect.email,
            error: !response.ok ? responseData.message || 'Échec de l\'envoi' : null,
            duplicate: responseData.duplicate || false
          };
        } catch (error) {
          console.error(`Exception lors de l'envoi à ${prospect.email}:`, error);
          results.failed++;
          return {
            success: false,
            prospect: prospect.email,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          };
        }
      })
    );

    // Organiser les résultats par utilisateur
    const userResults = {};
    processResults.forEach(result => {
      const prospect = prospects.find(p => p.email === result.prospect);
      if (prospect) {
        const userId = prospect.user_id;
        if (!userResults[userId]) {
          userResults[userId] = {
            user_id: userId,
            prospects_processed: 0,
            success: 0,
            failed: 0,
            duplicates: 0
          };
        }
        
        userResults[userId].prospects_processed++;
        if (result.success) userResults[userId].success++;
        if (!result.success) userResults[userId].failed++;
        if (result.duplicate) userResults[userId].duplicates++;
      }
    });

    // Ajouter les résultats organisés par utilisateur
    results.details = Object.values(userResults);

    // Journaliser les résultats dans Supabase
    console.log("Enregistrement des résultats dans scheduled_job_logs...");
    await supabaseClient
      .from('scheduled_job_logs')
      .insert({
        job_type: 'email_sending',
        results: results,
        executed_at: new Date().toISOString()
      });
    console.log("Résultats enregistrés");

    console.log("=== FIN FONCTION ===");
    return new Response(
      JSON.stringify({
        success: true,
        message: `Traitement terminé: ${results.success} emails envoyés, ${results.failed} échecs, ${results.duplicates} emails déjà envoyés`,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error("=== ERREUR FONCTION ===", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}); 