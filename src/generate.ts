/**
 * Paid Newsletter Generator
 * 
 * Fetches latest niches from database, generates AI summaries, and sends premium newsletter.
 * 
 * WORKFLOW:
 * 1. Get latest niches from 'niches' table
 * 2. Generate AI summaries (concise, actionable)
 * 3. Generate premium HTML
 * 4. Get active paid subscribers
 * 5. Send emails
 * 6. Notify Telegram
 */

import dotenv from 'dotenv';
dotenv.config();

import { getLatestNiches, getActivePaidSubscribers, Niche } from './services/supabase';
import { generateNicheSummaries, NicheSummary } from './services/openai';
import { generatePaidNewsletterHTML } from './templates/newsletter';
import { sendPaidNewsletterBatch } from './services/email';
import { notifyTelegram } from './services/telegram';

/**
 * Main paid newsletter generation function
 */
export async function generatePaidNewsletter(): Promise<void> {
  console.log('');
  console.log('═'.repeat(60));
  console.log('📰 NICHES HUNTER - Paid Newsletter Generator');
  console.log('═'.repeat(60));
  console.log('');


  try {
    // =========================================
    // Step 1: Get latest niches
    // =========================================
    console.log('📥 Step 1: Fetching latest niches from database...');
    const niches = await getLatestNiches(2);
    
    if (niches.length === 0) {
      console.log('⚠️  No niches found. Skipping newsletter generation.');
      await notifyTelegram('⚠️ Paid Newsletter skipped: No niches available');
      return;
    }
    
    console.log('   📋 Niches found:');
    for (const niche of niches) {
      console.log(`      • ${niche.title} (Score: ${niche.score})`);
    }
    console.log('');

    // =========================================
    // Step 2: Generate AI summaries
    // =========================================
    console.log('🤖 Step 2: Generating AI summaries...');
    const summaries = await generateNicheSummaries(niches as any);
    console.log(`   ✅ Generated ${summaries.length} summaries`);
    console.log('');

    // =========================================
    // Step 3: Generate title
    // =========================================
    const title = summaries.length === 1 
      ? `${summaries[0].emoji} ${summaries[0].title}`
      : `${summaries[0].emoji} ${summaries[0].title} & ${summaries[1].emoji} ${summaries[1].title}`;
    console.log(`📌 Title: "${title}"`);
    console.log('');

    // =========================================
    // Step 4: Generate premium HTML
    // =========================================
    console.log('🎨 Step 3: Generating premium newsletter HTML...');
    const html = generatePaidNewsletterHTML(summaries, title);
    console.log(`   ✅ HTML generated (${html.length} characters)`);
    console.log('');

    // =========================================
    // Step 5: Get active paid subscribers
    // =========================================
    console.log('👥 Step 4: Fetching active paid subscribers...');
    const subscribers = await getActivePaidSubscribers();
    const emails = subscribers.map(s => s.email);
    console.log(`   ✅ Found ${emails.length} active paid subscribers`);
    console.log('');

    if (emails.length === 0) {
      console.log('⚠️  No paid subscribers found. Skipping email send.');
      await notifyTelegram('⚠️ Paid Newsletter generated but no subscribers to send to');
      return;
    }

    // =========================================
    // Step 6: Send emails
    // =========================================
    console.log('📧 Step 5: Sending emails...');
    const { success, failed } = await sendPaidNewsletterBatch(emails, html, title);
    console.log(`   ✅ Sent: ${success} | ❌ Failed: ${failed}`);
    console.log('');

    // =========================================
    // Step 7: Notify via Telegram
    // =========================================
    console.log('📱 Step 6: Sending Telegram notification...');
    const telegramMessage = `📰 Paid Newsletter Sent! 🏆

📌 ${title}

🎯 Niches:
${summaries.map(n => `• ${n.emoji} ${n.title} (Score: ${n.score})`).join('\n')}

📊 Stats:
• Paid Subscribers: ${emails.length}
• Sent: ${success}
• Failed: ${failed}

${failed > 0 ? '⚠️ Check logs for failed emails' : '✅ All sent!'}`;

    await notifyTelegram(telegramMessage);
    console.log('   ✅ Telegram notification sent');

    // Done!
    console.log('');
    console.log('═'.repeat(60));
    console.log('🎉 Paid Newsletter generation complete!');
    console.log('═'.repeat(60));
    console.log('');

  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error);
    
    await notifyTelegram(`❌ Paid Newsletter generation FAILED!\n\nError: ${error}`);
    
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  generatePaidNewsletter()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}
