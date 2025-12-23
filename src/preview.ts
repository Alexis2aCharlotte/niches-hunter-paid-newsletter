/**
 * Preview script - Génère le HTML sans envoyer d'emails
 */

import dotenv from 'dotenv';
dotenv.config();

import { getLatestNiches } from './services/supabase';
import { generateNicheSummaries } from './services/openai';
import { generatePaidNewsletterHTML } from './templates/newsletter';
import * as fs from 'fs';

async function preview() {
  console.log('📥 Fetching latest niches...');
  const niches = await getLatestNiches(2);
  
  console.log('🤖 Generating summaries (with fallback if AI fails)...');
  const summaries = await generateNicheSummaries(niches as any);
  
  const title = summaries.length === 1 
    ? `${summaries[0].emoji} ${summaries[0].title}`
    : `${summaries[0].emoji} ${summaries[0].title} & ${summaries[1].emoji} ${summaries[1].title}`;
  
  console.log('🎨 Generating HTML...');
  const html = generatePaidNewsletterHTML(summaries, title);
  
  // Save to file
  fs.writeFileSync('preview.html', html);
  console.log('✅ Saved to preview.html - Open it in your browser!');
}

preview().catch(console.error);

