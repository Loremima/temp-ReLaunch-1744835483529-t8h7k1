import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import { format } from 'npm:date-fns@3.3.1';
import SendGrid from 'npm:@sendgrid/mail@8.1.1';
import { MailerSend, EmailParams } from 'npm:mailersend@2.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Prospect {
  id: string;
  user_id: string;
  name: string;
  email: string;
  project: string;
  company: string;
  followup_stage: number;
  next_followup: string;
}

interface Template {
  id: string;
  subject: string;
  body: string;
}

interface Settings {
  email_provider: string;
  email_api_key: string;
  followup_timing: Record<string, number>;
}

interface EmailResult {
  success: boolean;
  error?: string;
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    if (req.method === 'POST') {
      const { prospect_id } = await req.json();

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: prospect, error: prospectError } = await supabase
        .from('prospects')
        .select('*')
        .eq('id', prospect_id)
        .single();

      if (prospectError) throw prospectError;

      const { data: settings, error: settingsError } = await supabase
        .from('settings')
        .select('email_provider, email_api_key, followup_timing')
        .eq('user_id', prospect.user_id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (!settings) {
        throw new Error('No email configuration found for this user');
      }

      const { data: template, error: templateError } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', prospect.user_id)
        .eq('stage', prospect.followup_stage)
        .single();

      if (templateError) throw templateError;

      await processProspect(prospect, template, settings, supabase);

      return new Response(
        JSON.stringify({ message: 'Test email sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: prospects, error: prospectsError } = await supabase
      .from('prospects')
      .select(`
        id,
        user_id,
        name,
        email,
        project,
        company,
        followup_stage,
        next_followup
      `)
      .eq('status', 'Pending')
      .lte('followup_stage', 3)
      .eq('next_followup', format(new Date(), 'yyyy-MM-dd'));

    if (prospectsError) throw prospectsError;

    if (!prospects?.length) {
      return new Response(
        JSON.stringify({ message: 'No follow-ups due today' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = await Promise.all(
      prospects.map(async (prospect) => {
        try {
          const { data: settings, error: settingsError } = await supabase
            .from('settings')
            .select('email_provider, email_api_key, followup_timing')
            .eq('user_id', prospect.user_id)
            .maybeSingle();

          if (settingsError) {
            throw new Error(`Failed to fetch settings: ${settingsError.message}`);
          }

          if (!settings) {
            throw new Error('No email configuration found for this user');
          }

          if (!settings?.email_api_key) {
            throw new Error('No email API key configured');
          }

          const { data: template, error: templateError } = await supabase
            .from('templates')
            .select('id, subject, body')
            .eq('user_id', prospect.user_id)
            .eq('stage', prospect.followup_stage)
            .single();

          if (templateError) {
            const defaultTemplates = {
              1: {
                subject: "Just following up on {project}",
                body: "Hi {name}, just checking in on our project {project} — happy to answer any questions."
              },
              2: {
                subject: "Quick follow-up on our exchange",
                body: "Hey {name}, wanted to follow up again. Let me know if you'd like to move forward with {project}."
              },
              3: {
                subject: "Final follow-up – let me know!",
                body: "Just one last check-in {name} — if you're still interested in {project}, I'm here!"
              }
            };

            const defaultTemplate = defaultTemplates[prospect.followup_stage as keyof typeof defaultTemplates];

            const { data: newTemplate, error: createError } = await supabase
              .from('templates')
              .insert({
                user_id: prospect.user_id,
                stage: prospect.followup_stage,
                ...defaultTemplate
              })
              .select()
              .single();

            if (createError) throw createError;

            await processProspect(prospect, newTemplate, settings, supabase);
            return { success: true, prospect: prospect.email };
          }

          await processProspect(prospect, template, settings, supabase);
          return { success: true, prospect: prospect.email };
        } catch (error) {
          return { success: false, prospect: prospect.email, error: error.message };
        }
      })
    );

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} follow-ups`,
        summary: {
          total: results.length,
          successful,
          failed
        },
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processProspect(
  prospect: Prospect,
  template: Template,
  settings: Settings,
  supabase: any
): Promise<void> {
  // Vérifier si un email a déjà été envoyé récemment (dernières 24 heures)
  const { data: recentHistory, error: historyCheckError } = await supabase
    .from('history')
    .select('*')
    .eq('prospect_id', prospect.id)
    .gt('sent_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .maybeSingle();
  
  if (historyCheckError) {
    console.error('Erreur lors de la vérification de l\'historique:', historyCheckError);
  }
  
  if (recentHistory) {
    console.log(`Email déjà envoyé au prospect ${prospect.id} dans les dernières 24h, envoi annulé`);
    return; // Sortir de la fonction sans envoyer d'email
  }

  // Vérifier si le template actuel a déjà été envoyé pour ce prospect
  const { data: templateHistory, error: templateHistoryError } = await supabase
    .from('history')
    .select('*')
    .eq('prospect_id', prospect.id)
    .eq('template_id', template.id)
    .maybeSingle();
  
  if (templateHistoryError) {
    console.error('Erreur lors de la vérification de l\'historique des templates:', templateHistoryError);
  }
  
  if (templateHistory) {
    console.log(`Le template ${template.id} (stage ${prospect.followup_stage}) a déjà été envoyé au prospect ${prospect.id}, passage au template suivant`);
    
    // Mettre à jour le prospect pour passer au template suivant sans envoyer d'email
    const nextStage = prospect.followup_stage + 1;
    const daysToAdd = settings.followup_timing[nextStage] || null;
    
    const updates = {
      followup_stage: nextStage,
      next_followup: daysToAdd ?
        format(new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') :
        null,
      status: daysToAdd ? 'Pending' : 'Completed'
    };
    
    await supabase
      .from('prospects')
      .update(updates)
      .eq('id', prospect.id);
      
    return; // Sortir de la fonction sans envoyer d'email
  }
  
  // Vérifier si on a dépassé le nombre maximum d'étapes (3)
  if (prospect.followup_stage > 3) {
    console.log(`Toutes les étapes de suivi ont été complétées pour le prospect ${prospect.id}, aucun email envoyé`);
    
    // Marquer le prospect comme complété
    await supabase
      .from('prospects')
      .update({
        status: 'Completed',
        next_followup: null
      })
      .eq('id', prospect.id);
      
    return; // Sortir de la fonction sans envoyer d'email
  }

  // Replace placeholders in subject and body
  const subject = template.subject
    .replace(/{name}/g, prospect.name)
    .replace(/{project}/g, prospect.project || 'your project')
    .replace(/{company}/g, prospect.company || 'your company');

  const body = template.body
    .replace(/{name}/g, prospect.name)
    .replace(/{project}/g, prospect.project || 'your project')
    .replace(/{company}/g, prospect.company || 'your company');

  // Send email
  const emailResult = await sendEmail(
    prospect.email, // Envoyer à l'email du prospect réel
    subject,
    body,
    settings
  );

  if (!emailResult.success) {
    throw new Error(`Failed to send email: ${emailResult.error}`);
  }

  // Update prospect
  const nextStage = prospect.followup_stage + 1;
  const daysToAdd = settings.followup_timing[nextStage] || null;

  const updates = {
    followup_stage: nextStage,
    next_followup: daysToAdd ?
      format(new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000), 'yyyy-MM-dd') :
      null,
    status: daysToAdd ? 'Pending' : 'Completed'
  };

  const { error: updateError } = await supabase
    .from('prospects')
    .update(updates)
    .eq('id', prospect.id);

  if (updateError) {
    throw new Error(`Failed to update prospect: ${updateError.message}`);
  }

  // Log to history
  const { error: historyError } = await supabase
    .from('history')
    .insert({
      prospect_id: prospect.id,
      template_id: template.id,
      user_id: prospect.user_id,
      status: 'Sent',
      sent_at: new Date().toISOString()
    });

  if (historyError) {
    throw new Error(`Failed to log to history: ${historyError.message}`);
  }
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  settings: Settings
): Promise<EmailResult> {
  try {
    const emailContent = {
      to,
      subject,
      from: 'info@trial-r9084zvr6jegw63d.mlsender.net',
      html
    };

    if (settings.email_provider === 'sendgrid') {
      SendGrid.setApiKey(settings.email_api_key);
      await SendGrid.send(emailContent);
    } else if (settings.email_provider === 'mailersend') {
      const mailerSend = new MailerSend({ apiKey: settings.email_api_key });
      const emailParams = new EmailParams()
        .setFrom('info@trial-r9084zvr6jegw63d.mlsender.net')
        .setTo([to])
        .setSubject(subject)
        .setHtml(html);

      await mailerSend.email.send(emailParams);
    } else {
      throw new Error(`Unsupported email provider: ${settings.email_provider}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}