import { Resend } from 'resend';

// Initialize Resend client (lazy loading)
let resend: Resend | null = null;

function getResendClient(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'support@arianeconcept.fr';

/**
 * Helper function to delay execution
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send paid newsletter to multiple subscribers (sequential to respect rate limits)
 * Resend allows only 2 requests per second, so we send 1 email every 600ms to be safe
 */
export async function sendPaidNewsletterBatch(
  emails: string[], 
  htmlContent: string,
  title: string
): Promise<{ success: number; failed: number }> {
  const subject = `🎯 ${title}`;

  let success = 0;
  let failed = 0;

  console.log(`📧 Sending newsletter to ${emails.length} subscribers (sequential, 600ms delay)...`);

  // Send emails one by one with delay to respect Resend rate limit (2 req/sec)
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    
    try {
      await getResendClient().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: subject,
        html: htmlContent
      });
      success++;
      console.log(`✅ [${i + 1}/${emails.length}] Sent to ${email}`);
    } catch (err: any) {
      console.error(`❌ [${i + 1}/${emails.length}] Failed to send to ${email}:`, err?.message || err);
      failed++;
    }

    // Wait 600ms between each email to stay under 2 requests/second limit
    if (i < emails.length - 1) {
      await delay(600);
    }
  }

  console.log(`📊 Newsletter sent: ${success} success, ${failed} failed`);
  return { success, failed };
}

