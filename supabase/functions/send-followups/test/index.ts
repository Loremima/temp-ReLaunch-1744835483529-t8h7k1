import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.39.7';
import SendGrid from 'npm:@sendgrid/mail@8.1.1';
import { MailerSend, EmailParams } from 'npm:mailersend@2.2.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to validate UUID format
function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  try {
    console.log('[TEST FUNCTION] Received request'); // Log initial
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('[TEST FUNCTION] Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Extract parameters with type checking
    const { user_id, prospect_id, email_provider, email_api_key, recipient } = body;
    console.log('[TEST FUNCTION] Received user_id:', user_id);
    console.log('[TEST FUNCTION] Received prospect_id:', prospect_id);
    console.log('[TEST FUNCTION] Received email_provider:', email_provider);
    console.log('[TEST FUNCTION] Received recipient email:', recipient?.email);

    // Validate required parameters received from frontend
    if (!isValidUUID(user_id)) {
      throw new Error('Invalid or missing user ID from request');
    }
    if (!email_provider) {
      throw new Error('Missing email provider from request');
    }
    if (!email_api_key) {
      throw new Error('Missing email API key from request');
    }
    if (!recipient?.email) {
      throw new Error('Missing recipient email from request');
    }

    console.log('[TEST FUNCTION] All required parameters received directly. Proceeding to send email.');

    const emailSettings = { email_provider, email_api_key };
    const userEmail = recipient.email;
    const targetProspect = recipient; // Contains name and email

    // Send test email
    const emailContent = {
      to: userEmail,
      subject: 'ReLaunch Test Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>ReLaunch Test Email</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f7f7f7;
                padding: 20px;
              }
              .container {
                background-color: #ffffff;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.05);
              }
              .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #888;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Test Email from ReLaunch</h2>
              <p>
                This is a test email to confirm your email provider configuration is working correctly.
                If you're seeing this, everything is set up properly!
              </p>
              ${targetProspect ? `
              <p>
                <strong>Prospect test info:</strong><br>
                Name: ${targetProspect.name || 'Not provided'}<br>
                Email: ${targetProspect.email || 'Not provided'}
              </p>
              ` : ''}
              <p>
                You can now start using ReLaunch to send automated follow-up emails to your prospects.
              </p>
              <p>Best regards,<br />The ReLaunch Team</p>
            </div>
            <div class="footer">
              This is a test email from ReLaunch. You can safely ignore it.
            </div>
          </body>
        </html>
      `
    };

    try {
      console.log(`[TEST FUNCTION] Sending test email to ${userEmail} using ${emailSettings.email_provider}`);

      if (emailSettings.email_provider === 'sendgrid') {
        SendGrid.setApiKey(emailSettings.email_api_key);
        await SendGrid.send({
          ...emailContent,
          from: 'noreply@relaunchapp.com' // Consider making this configurable
        });
      } else if (emailSettings.email_provider === 'mailersend') {
        const mailerSend = new MailerSend({ apiKey: emailSettings.email_api_key });
        const emailParams = new EmailParams()
          .setFrom({ email: 'noreply@relaunchapp.com', name: 'ReLaunch App' }) // Adjusted based on potential library requirements
          .setTo([{ email: userEmail }]) // Adjusted based on potential library requirements
          .setSubject(emailContent.subject)
          .setHtml(emailContent.html);

        await mailerSend.email.send(emailParams);
      } else {
        throw new Error(`Unsupported email provider: ${emailSettings.email_provider}`);
      }

      console.log('[TEST FUNCTION] Test email sent successfully');
      return new Response(
        JSON.stringify({ message: 'Test email sent successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error('[TEST FUNCTION] Email provider error:', error);
      throw error;
    }
  } catch (error) {
    console.error('[TEST FUNCTION] Error sending test email:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});