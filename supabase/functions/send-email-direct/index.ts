import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.7";

// Utilisation directe de la clé API Resend
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? "re_NURjAxUc_GScRdZAeas9bKYdoKUkbuu2Y"; // Préférer la variable d'environnement
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_EMAIL = "main@relaunch.fr"; // Adresse vérifiée par défaut de Resend
const FROM_NAME = "ReLaunch App";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', // Ajouter d'autres en-têtes si nécessaire
};

const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #2D3748;
      margin: 0;
      padding: 0;
      background-color: #F7FAFC;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-content {
      display: inline-flex;
      align-items: center;
      padding: 8px 16px;
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .logo-icon {
      width: 32px;
      height: 32px;
      margin-right: 8px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #4A5568;
    }
    .logo-text span {
      color: #4299E1;
    }
    .card {
      background: #FFFFFF;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 32px;
      margin-bottom: 30px;
    }
    .content {
      color: #4A5568;
      font-size: 16px;
      line-height: 1.8;
    }
    .signature {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #E2E8F0;
      color: #718096;
      font-style: italic;
    }
    .footer {
      text-align: center;
      color: #A0AEC0;
      font-size: 12px;
      margin-top: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(to right, #4299E1, #667EEA);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin: 24px 0;
    }
    .button:hover {
      background: linear-gradient(to right, #3182CE, #5A67D8);
    }
    @media only screen and (max-width: 600px) {
      .container {
        padding: 20px;
      }
      .card {
        padding: 24px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <div class="logo-content">
        <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6V21H11V6H13Z" fill="#4299E1"/>
          <path d="M22.8776 9.5C22.7609 9.18138 22.5171 8.93759 22.2076 8.84812L16.8076 7.34812C16.5804 7.28198 16.3391 7.28925 16.1161 7.36903C15.8931 7.44881 15.7007 7.59721 15.5676 7.79812L11.9976 13.0881L8.42762 7.79812C8.29459 7.59721 8.10221 7.44881 7.87919 7.36903C7.65616 7.28925 7.41488 7.28198 7.18762 7.34812L1.78762 8.84812C1.47813 8.93759 1.23438 9.18138 1.11762 9.5C1.00087 9.81863 1.02091 10.1738 1.17262 10.4781L5.67262 18.4781C5.81196 18.756 6.05415 18.9675 6.34761 19.0617C6.64107 19.156 6.96219 19.1249 7.23762 18.9781C7.51305 18.8314 7.71772 18.5824 7.80262 18.2881L8.99762 14.4981L11.5776 18.2081C11.7066 18.3922 11.8863 18.5358 12.0938 18.6217C12.3014 18.7075 12.5284 18.7321 12.7484 18.6926C12.9683 18.653 13.1718 18.5509 13.3347 18.3978C13.4976 18.2447 13.6136 18.0468 13.6701 17.8287C13.7266 17.6106 13.7212 17.3816 13.6544 17.1664C13.5876 16.9512 13.4621 16.7591 13.2917 16.613C13.1213 16.4669 12.9125 16.3726 12.6906 16.3404C12.4687 16.3082 12.2427 16.3394 12.0376 16.4312L11.9976 16.4481L9.41762 12.7381L11.9976 8.91813L14.5776 12.7381L12.0076 16.4312L11.9676 16.4081C11.7624 16.3172 11.5366 16.2867 11.3148 16.3195C11.0931 16.3523 10.8845 16.447 10.7143 16.5934C10.5442 16.7397 10.4189 16.9319 10.3523 17.1471C10.2857 17.3623 10.2805 17.5912 10.3371 17.8092C10.3937 18.0272 10.5098 18.2249 10.6726 18.378C10.8355 18.531 11.039 18.633 11.2588 18.6726C11.4787 18.7121 11.7056 18.6876 11.9132 18.6018C12.1207 18.516 12.3004 18.3725 12.4294 18.1885L15.0076 14.4781L16.1976 18.2681C16.2825 18.5624 16.4872 18.8114 16.7626 18.9581C17.038 19.1049 17.3591 19.136 17.6526 19.0417C17.946 18.9475 18.1882 18.7356 18.3276 18.4581L22.8276 10.4581C22.9793 10.1538 22.9944 9.79863 22.8776 9.5Z" fill="#4299E1"/>
        </svg>
        <div class="logo-text">
          <span>Re</span>Launch
        </div>
      </div>
    </div>
    <div class="card">
      <div class="content">
        {content}
      </div>
      <div class="signature">
        Best regards,<br>
        The ReLaunch Team
      </div>
    </div>
    <div class="footer">
      <p>This email was sent automatically from the ReLaunch platform.</p>
      <p>© {year} ReLaunch. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Fonction pour envoyer un email via Resend
async function sendEmailViaResend(recipientEmail, subject, formattedHtml) {
  const resendPayload = {
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: [recipientEmail],
    subject: subject,
    html: formattedHtml
  };

  console.log('Contenu du payload Resend (sans HTML):', JSON.stringify({
    from: resendPayload.from,
    to: resendPayload.to,
    subject: resendPayload.subject
  }));

  const resendResponse = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(resendPayload)
  });

  console.log('Statut de réponse Resend:', resendResponse.status);

  if (!resendResponse.ok) {
    const errorJson = await resendResponse.json().catch(() => ({ message: `HTTP Error ${resendResponse.status}` }));
    console.error('Erreur Resend détaillée:', errorJson);
    throw new Error(`Erreur Resend: ${errorJson.message || resendResponse.statusText}`);
  }

  return await resendResponse.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { 
      to,
      name,
      subject: rawSubject, 
      html: rawHtml, 
      prospect_id, 
      template_id, 
      user_id,
      project,
      company,
      force_send,
      next_stage
    } = body;

    // Vérifications importantes
    if (!to) throw new Error('Recipient email (to) is required');
    if (!rawSubject) throw new Error('Subject is required');
    if (!rawHtml) throw new Error('HTML content is required');
    if (!RESEND_API_KEY) throw new Error('Resend API key is not configured');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const recipientEmail = to;
    
    console.log('Envoi d\'email via Resend:');
    console.log('- Destinataire:', recipientEmail);

    // Préparation du contenu
    const nameValue = name || 'there';
    const projectValue = project || 'votre entreprise';
    const companyValue = company || 'votre entreprise';

    // Vérifier si un email a déjà été envoyé (si prospect_id est fourni et pas de force_send)
    if (prospect_id && user_id && template_id && !force_send) {
      // Vérifier si ce template spécifique a déjà été envoyé à ce prospect
      const { data: templateHistory, error: templateHistoryError } = await supabase
        .from('history')
        .select('*')
        .eq('prospect_id', prospect_id)
        .eq('template_id', template_id)
        .maybeSingle();
        
      if (templateHistoryError) {
        console.error('Erreur lors de la vérification de l\'historique des templates:', templateHistoryError);
      }
      
      if (templateHistory) {
        // Si un template a déjà été envoyé, on cherche le template suivant
        console.log(`DOUBLON DÉTECTÉ: Template ${template_id} déjà envoyé au prospect ${prospect_id} le ${templateHistory.sent_at}`);
        
        // Récupérer TOUS les templates de l'utilisateur pour plus de fiabilité
        const { data: allTemplates, error: templatesError } = await supabase
          .from('templates')
          .select('*')
          .eq('user_id', user_id)
          .order('stage', { ascending: true });
        
        if (templatesError) {
          console.error('Erreur lors de la récupération de tous les templates:', templatesError);
          return new Response(JSON.stringify({
            success: false,
            message: 'Ce template a déjà été envoyé à ce prospect',
            duplicate: true,
            has_next_template: false,
            current_stage: 0
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Trouver le template actuel dans la liste des templates
        const currentTemplateIndex = allTemplates.findIndex(t => t.id === template_id);
        
        // Si on a trouvé le template actuel et qu'il existe un template suivant
        if (currentTemplateIndex !== -1 && currentTemplateIndex < allTemplates.length - 1) {
          const nextTemplate = allTemplates[currentTemplateIndex + 1];
          console.log(`Template suivant trouvé par index: ${nextTemplate.id} (étape ${nextTemplate.stage}), envoi en cours...`);
          
          // Vérifier si ce template suivant a également déjà été envoyé
          const { data: nextTemplateHistory } = await supabase
            .from('history')
            .select('*')
            .eq('prospect_id', prospect_id)
            .eq('template_id', nextTemplate.id)
            .maybeSingle();
            
          if (nextTemplateHistory) {
            console.log(`Le template suivant ${nextTemplate.id} a aussi déjà été envoyé au prospect ${prospect_id}, recherche du prochain template disponible...`);
            
            // Au lieu de s'arrêter, chercher s'il y a des templates suivants disponibles
            let nextAvailableTemplate = null;
            let nextAvailableTemplateIndex = -1;
            
            // Vérifier tous les templates après le template actuel
            for (let i = currentTemplateIndex + 2; i < allTemplates.length; i++) {
              const potentialTemplate = allTemplates[i];
              
              // Vérifier si ce template a déjà été envoyé
              const { data: alreadySent } = await supabase
                .from('history')
                .select('id')
                .eq('prospect_id', prospect_id)
                .eq('template_id', potentialTemplate.id)
                .maybeSingle();
                
              if (!alreadySent) {
                nextAvailableTemplate = potentialTemplate;
                nextAvailableTemplateIndex = i;
                console.log(`Template disponible trouvé: ${potentialTemplate.id} (étape ${potentialTemplate.stage})`);
                break;
              }
            }
            
            // Si on a trouvé un template disponible, l'envoyer
            if (nextAvailableTemplate) {
              console.log(`Envoi du prochain template disponible ${nextAvailableTemplate.id} (étape ${nextAvailableTemplate.stage})...`);
              
              // Préparer le contenu du template suivant
              const nextSubject = nextAvailableTemplate.subject
                .replace(/{name}/gi, nameValue)
                .replace(/{project}/gi, projectValue)
                .replace(/{company}/gi, companyValue);

              const nextHtml = nextAvailableTemplate.body
                .replace(/{name}/gi, nameValue)
                .replace(/{project}/gi, projectValue)
                .replace(/{company}/gi, companyValue);

              // Transformer en HTML formaté
              const formattedHtml = emailTemplate
                .replace('{content}', nextHtml)
                .replace('{year}', new Date().getFullYear().toString());

              try {
                // Envoyer l'email avec le template suivant (avec force_send=true pour éviter boucle infinie)
                console.log(`Envoi du template disponible ${nextAvailableTemplate.id} au prospect ${prospect_id}...`);
                const responseData = await sendEmailViaResend(recipientEmail, nextSubject, formattedHtml);
                console.log(`Template disponible ${nextAvailableTemplate.id} envoyé avec succès, ID Resend:`, responseData.id);

                // Enregistrer dans l'historique
                const { error: historyError } = await supabase
                  .from('history')
                  .insert({
                    prospect_id,
                    template_id: nextAvailableTemplate.id,
                    user_id,
                    status: 'Sent',
                    sent_at: new Date().toISOString()
                  });

                if (historyError) {
                  console.error(`Erreur lors de la création de l'entrée historique pour le template ${nextAvailableTemplate.id}:`, historyError);
                } else {
                  console.log(`Historique créé pour le template ${nextAvailableTemplate.id} et prospect ${prospect_id}`);
                }

                // Mettre à jour l'étape du prospect au niveau suivant
                const nextStageValue = nextAvailableTemplate.stage + 1;
                const { error: updateError } = await supabase
                  .from('prospects')
                  .update({
                    followup_stage: nextStageValue,
                    last_contact: new Date().toISOString()
                  })
                  .eq('id', prospect_id);

                if (updateError) {
                  console.error(`Erreur lors de la mise à jour du prospect ${prospect_id} à l'étape ${nextStageValue}:`, updateError);
                } else {
                  console.log(`Prospect ${prospect_id} mis à jour à l'étape ${nextStageValue}`);
                }

                return new Response(JSON.stringify({
                  success: true,
                  message: 'Un template disponible a été envoyé automatiquement',
                  original_template_id: template_id,
                  next_template_id: nextAvailableTemplate.id,
                  next_template_stage: nextAvailableTemplate.stage,
                  skipped_templates: [nextTemplate.id],
                  id: responseData.id
                }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
              } catch (error) {
                console.error(`Erreur lors de l'envoi du template disponible ${nextAvailableTemplate.id}:`, error);
                return new Response(JSON.stringify({
                  success: false,
                  message: `Erreur lors de l'envoi du template disponible: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
                  has_next_template: true,
                  next_template_id: nextAvailableTemplate.id
                }), {
                  status: 500,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
              }
            }
            
            // Si tous les templates ont déjà été envoyés
            return new Response(JSON.stringify({
              success: false,
              message: 'Tous les templates ont déjà été envoyés à ce prospect',
              duplicate: true,
              has_next_template: false,
              all_templates_sent: true
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Préparer le contenu du template suivant
          const nextSubject = nextTemplate.subject
            .replace(/{name}/gi, nameValue)
            .replace(/{project}/gi, projectValue)
            .replace(/{company}/gi, companyValue);

          const nextHtml = nextTemplate.body
            .replace(/{name}/gi, nameValue)
            .replace(/{project}/gi, projectValue)
            .replace(/{company}/gi, companyValue);

          // Transformer en HTML formaté
          const formattedHtml = emailTemplate
            .replace('{content}', nextHtml)
            .replace('{year}', new Date().getFullYear().toString());

          try {
            // Envoyer l'email avec le template suivant (avec force_send=true pour éviter boucle infinie)
            console.log(`Envoi du template suivant ${nextTemplate.id} au prospect ${prospect_id}...`);
            const responseData = await sendEmailViaResend(recipientEmail, nextSubject, formattedHtml);
            console.log(`Template suivant ${nextTemplate.id} envoyé avec succès, ID Resend:`, responseData.id);

            // Enregistrer dans l'historique
            const { error: historyError } = await supabase
              .from('history')
              .insert({
                prospect_id,
                template_id: nextTemplate.id,
                user_id,
                status: 'Sent',
                sent_at: new Date().toISOString()
              });

            if (historyError) {
              console.error(`Erreur lors de la création de l'entrée historique pour le template suivant ${nextTemplate.id}:`, historyError);
            } else {
              console.log(`Historique créé pour le template suivant ${nextTemplate.id} et prospect ${prospect_id}`);
            }

            // Mettre à jour l'étape du prospect au niveau suivant
            const nextStageValue = nextTemplate.stage + 1;
            const { error: updateError } = await supabase
              .from('prospects')
              .update({
                followup_stage: nextStageValue,
                last_contact: new Date().toISOString()
              })
              .eq('id', prospect_id);

            if (updateError) {
              console.error(`Erreur lors de la mise à jour du prospect ${prospect_id} à l'étape ${nextStageValue}:`, updateError);
            } else {
              console.log(`Prospect ${prospect_id} mis à jour à l'étape ${nextStageValue}`);
            }

            return new Response(JSON.stringify({
              success: true,
              message: 'Le template suivant a été envoyé automatiquement',
              original_template_id: template_id,
              next_template_id: nextTemplate.id,
              next_template_stage: nextTemplate.stage,
              id: responseData.id
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } catch (error) {
            console.error(`Erreur lors de l'envoi du template suivant ${nextTemplate.id}:`, error);
            return new Response(JSON.stringify({
              success: false,
              message: `Erreur lors de l'envoi du template suivant: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
              has_next_template: true,
              next_template_id: nextTemplate.id
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        } else {
          // Si on n'a pas trouvé le template ou qu'il n'y a pas de template suivant
          const currentStage = currentTemplateIndex !== -1 ? allTemplates[currentTemplateIndex].stage : 0;
          console.log(`Pas de template suivant trouvé pour le template ${template_id} (étape ${currentStage})`);
          
          return new Response(JSON.stringify({
            success: false,
            message: 'Ce template a déjà été envoyé à ce prospect et il n\'y a pas de template suivant',
            duplicate: true,
            has_next_template: false,
            current_stage: currentStage
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Vérification du délai entre les envois
      const { data: recentHistory, error: historyCheckError } = await supabase
        .from('history')
        .select('*')
        .eq('prospect_id', prospect_id)
        .gt('sent_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()) // 10 minutes
        .maybeSingle();
      
      if (historyCheckError) {
        console.error('Erreur lors de la vérification de l\'historique récent:', historyCheckError);
      }
      
      if (recentHistory) {
        // Récupérer le template qui a été récemment envoyé
        const { data: recentTemplate, error: recentTemplateError } = await supabase
          .from('templates')
          .select('*')
          .eq('id', recentHistory.template_id)
          .single();
          
        if (recentTemplateError) {
          console.error('Erreur lors de la récupération du template récent:', recentTemplateError);
        }
        
        return new Response(JSON.stringify({
          success: false,
          message: 'Un email a déjà été envoyé à ce prospect dans les 10 dernières minutes',
          duplicate: true,
          cooldown: true,
          recent_email: {
            sent_at: recentHistory.sent_at,
            template: recentTemplate || { id: recentHistory.template_id }
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Préparer l'email à envoyer
    const subject = rawSubject
      .replace(/{name}/gi, nameValue)
      .replace(/{project}/gi, projectValue)
      .replace(/{company}/gi, companyValue);

    const processedHtml = rawHtml
      .replace(/{name}/gi, nameValue)
      .replace(/{project}/gi, projectValue)
      .replace(/{company}/gi, companyValue);

    // Transformation finale
    const formattedHtml = emailTemplate
      .replace('{content}', processedHtml)
      .replace('{year}', new Date().getFullYear().toString());

    try {
      // Envoyer l'email
      const responseData = await sendEmailViaResend(recipientEmail, subject, formattedHtml);
      console.log('Email envoyé avec succès via Resend, ID:', responseData.id);

      // Journalisation dans l'historique si nécessaire
      if (prospect_id && user_id && template_id) {
        try {
          // Avant d'insérer dans l'historique, vérifier si le template existe déjà
          const { data: existingEntry, error: checkError } = await supabase
            .from('history')
            .select('id')
            .eq('prospect_id', prospect_id)
            .eq('template_id', template_id)
            .maybeSingle();
            
          if (checkError) {
            console.error('Erreur lors de la vérification des entrées existantes:', checkError);
          }
          
          // Si l'entrée existe déjà, ne pas insérer de doublon
          if (existingEntry) {
            console.log('Entrée historique déjà existante pour ce template et prospect, mise à jour ignorée');
      } else {
            // Insérer la nouvelle entrée
            const historyEntry = {
            prospect_id,
            template_id,
            user_id,
            status: 'Sent',
            sent_at: new Date().toISOString()
            };
            
            const { error: historyError } = await supabase
              .from('history')
              .insert(historyEntry);
              
            if (historyError) {
              console.error('Erreur lors de la création de l\'entrée historique:', historyError);
            } else {
              console.log('Entrée historique créée avec succès pour prospect:', prospect_id);
              
              // Mettre à jour l'étape du prospect
              if (next_stage) {
                const { error: updateError } = await supabase
                  .from('prospects')
                  .update({ 
                    followup_stage: next_stage,
                    last_contact: new Date().toISOString()
                  })
                  .eq('id', prospect_id);
                  
                if (updateError) {
                  console.error('Erreur lors de la mise à jour de l\'étape du prospect:', updateError);
                } else {
                  console.log(`Prospect ${prospect_id} mis à jour avec succès à l'étape ${next_stage}`);
                }
              } else {
                // Récupérer le template actuel pour connaître son étape
                const { data: currentTemplate, error: templateError } = await supabase
                  .from('templates')
                  .select('stage')
                  .eq('id', template_id)
                  .single();
                  
                if (templateError) {
                  console.error('Erreur lors de la récupération du template:', templateError);
                } else if (currentTemplate) {
                  // Incrémenter l'étape du prospect
                  const nextStage = currentTemplate.stage + 1;
                  
                  const { error: updateError } = await supabase
                    .from('prospects')
                    .update({ 
                      followup_stage: nextStage,
                      last_contact: new Date().toISOString()
                    })
                    .eq('id', prospect_id);
                    
                  if (updateError) {
                    console.error('Erreur lors de la mise à jour de l\'étape du prospect:', updateError);
                  } else {
                    console.log(`Prospect ${prospect_id} mis à jour avec succès à l'étape ${nextStage}`);
                  }
                }
              }
            }
          }
        } catch (historyError) {
          console.error('Erreur lors de la création de l\'entrée historique:', historyError);
        }
      }

      // Construire la réponse
      let enrichedResponse = {
        success: true,
        message: 'Email envoyé avec succès',
        id: responseData.id,
        email_details: {
          to: recipientEmail,
          subject: subject,
          template_id: template_id,
          sent_at: new Date().toISOString()
        }
      };
      
      // Ajouter des infos sur le prospect si disponible
      if (prospect_id && user_id) {
        try {
          // Récupérer les infos mises à jour du prospect
          const { data: updatedProspect, error: prospectError } = await supabase
            .from('prospects')
            .select('*')
            .eq('id', prospect_id)
            .single();
            
          if (!prospectError && updatedProspect) {
            enrichedResponse.prospect = {
              id: updatedProspect.id,
              name: updatedProspect.name,
              email: updatedProspect.email,
              followup_stage: updatedProspect.followup_stage,
              status: updatedProspect.status
            };
          }
        } catch (error) {
          console.error('Erreur lors de l\'enrichissement de la réponse:', error);
        }
      }

      // Renvoyer la réponse complète
      return new Response(JSON.stringify(enrichedResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (emailError) {
      console.error('Erreur lors de l\'envoi via Resend:', emailError);
      
      return new Response(JSON.stringify({
        success: false,
        error: emailError instanceof Error ? emailError.message : 'Erreur inconnue lors de l\'envoi d\'email'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de traitement de la requête'
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});