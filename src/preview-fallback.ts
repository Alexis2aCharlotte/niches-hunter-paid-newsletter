/**
 * Preview FALLBACK - Exactement ce qui a été envoyé aux users (sans IA)
 */

import dotenv from 'dotenv';
dotenv.config();

import { getLatestNiches } from './services/supabase';
import { NicheSummary } from './services/openai';
import { generatePaidNewsletterHTML } from './templates/newsletter';
import * as fs from 'fs';

function safeJsonParse(value: any, fallback: any = {}): any {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function previewFallback() {
  console.log('📥 Fetching latest niches...');
  const niches = await getLatestNiches(2);
  
  console.log('⚠️ Simulating FALLBACK (what was actually sent)...');
  
  // Simuler le fallback exactement comme le code l'a fait
  const summaries: NicheSummary[] = niches.map((niche: any) => {
    const trending = safeJsonParse(niche.trending, []);
    
    return {
      title: niche.title,
      emoji: '🎯', // Fallback emoji
      category: niche.category,
      marketOverview: niche.opportunity, // Données brutes
      theGap: niche.gap, // Données brutes
      actionsToDo: [niche.move], // UNE SEULE action
      appExamples: trending.slice(0, 3).map((app: any) => ({
        name: app.name || 'Unknown',
        description: app.description || '',
        mrr: app.estimatedMRR || 'N/A'
      })),
      displayCode: niche.display_code,
      score: niche.score
    };
  });
  
  const title = summaries.length === 1 
    ? `${summaries[0].emoji} ${summaries[0].title}`
    : `${summaries[0].emoji} ${summaries[0].title} & ${summaries[1].emoji} ${summaries[1].title}`;
  
  console.log('🎨 Generating HTML (FALLBACK version)...');
  const html = generatePaidNewsletterHTML(summaries, title);
  
  // Save to file
  fs.writeFileSync('preview-fallback.html', html);
  console.log('✅ Saved to preview-fallback.html - C\'est ce qui a été envoyé aux 17 users!');
}

previewFallback().catch(console.error);

