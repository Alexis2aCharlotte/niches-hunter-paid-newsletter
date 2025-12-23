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
 * Send paid newsletter to multiple subscribers (batch)
 */
export async function sendPaidNewsletterBatch(
  emails: string[], 
  htmlContent: string,
  title: string
): Promise<{ success: number; failed: number }> {
  const subject = `🎯 ${title}`;

  let success = 0;
  let failed = 0;

  // Send in batches of 10 to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    
    const promises = batch.map(async (email) => {
      try {
        await getResendClient().emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: subject,
          html: htmlContent
        });
        success++;
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err);
        failed++;
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return { success, failed };
}

