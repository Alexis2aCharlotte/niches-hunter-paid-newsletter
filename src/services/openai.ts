import OpenAI from 'openai';

// Lazy initialization
let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required');
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

/**
 * Niche data from database (extended type)
 */
export interface NicheData {
  id: string;
  title: string;
  category: string;
  tags: string[];
  score: number;
  opportunity: string;
  gap: string;
  move: string;
  stats: any; // JSON object or string
  market_analysis: any; // JSON object or string
  key_learnings: string[];
  improvements: string[];
  risks: string[];
  tech_stack: string[];
  trending: any; // JSON array or string with app examples
  display_code: string;
  created_at: string;
}

/**
 * Safely parse JSON that might already be an object
 */
function safeJsonParse(value: any, fallback: any = {}): any {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Summarized niche for newsletter
 */
export interface NicheSummary {
  title: string;
  emoji: string;
  category: string;
  marketOverview: string;
  theGap: string;
  actionsToDo: string[];
  appExamples: Array<{
    name: string;
    description: string;
    mrr: string;
  }>;
  displayCode: string;
  score: number;
}

/**
 * Generate concise summaries for niches using OpenAI
 */
export async function generateNicheSummaries(niches: NicheData[]): Promise<NicheSummary[]> {
  const summaries: NicheSummary[] = [];

  for (const niche of niches) {
    try {
      // Parse JSON fields (might already be objects)
      const stats = safeJsonParse(niche.stats, {});
      const marketAnalysis = safeJsonParse(niche.market_analysis, {});
      const trending = safeJsonParse(niche.trending, []);

      // Build context for AI
      const context = `
NICHE: ${niche.title}
CATEGORY: ${niche.category}
SCORE: ${niche.score}/100

MARKET DATA:
- Total Market Size: ${marketAnalysis.totalMarketSize || 'N/A'}
- Growth Rate: ${marketAnalysis.growthRate || 'N/A'}
- Target Audience: ${marketAnalysis.targetAudience || 'N/A'}
- Revenue Potential: ${stats.revenue || 'N/A'}
- Competition: ${stats.competition || 'N/A'}
- Time to MVP: ${stats.timeToMVP || 'N/A'}

OPPORTUNITY: ${niche.opportunity}

GAP TO EXPLOIT: ${niche.gap}

RECOMMENDED MOVE: ${niche.move}

KEY LEARNINGS:
${niche.key_learnings?.map((l, i) => `${i + 1}. ${l}`).join('\n') || 'N/A'}

TOP APPS IN THIS NICHE:
${trending.map((app: any) => `- ${app.name}: ${app.description} (MRR: ${app.estimatedMRR})`).join('\n') || 'N/A'}
`;

      const prompt = `You are a startup analyst writing for a premium newsletter for indie app developers.

Based on this niche data, create a CONCISE and ACTIONABLE summary in JSON format.

${context}

Return a JSON object with:
{
  "emoji": "single relevant emoji for this niche",
  "marketOverview": "2-3 sentences max. Key market facts: size, growth, who needs it, why now. Be specific with numbers.",
  "theGap": "2-3 sentences max. What's missing in current solutions? What pain point isn't solved?",
  "actionsToDo": ["action 1", "action 2", "action 3"] // Exactly 3 concrete, specific actions to start building this
}

Rules:
- Be CONCISE and PUNCHY. No fluff.
- Use specific numbers when available
- Actions must be concrete and actionable (not vague like "do market research")
- Write in a direct, confident tone
- Focus on what makes this opportunity unique NOW`;

      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a concise mobile app analyst. Always respond with valid JSON only, no markdown.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      });

      const content = response.choices[0]?.message?.content || '{}';
      
      // Parse AI response
      let aiSummary;
      try {
        // Remove potential markdown code blocks
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        aiSummary = JSON.parse(cleanContent);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        aiSummary = {
          emoji: '🎯',
          marketOverview: niche.opportunity,
          theGap: niche.gap,
          actionsToDo: [niche.move]
        };
      }

      // Build app examples from trending data
      const appExamples = trending.slice(0, 3).map((app: any) => ({
        name: app.name || 'Unknown App',
        description: app.description || '',
        mrr: app.estimatedMRR || 'N/A'
      }));

      summaries.push({
        title: niche.title,
        emoji: aiSummary.emoji || '🎯',
        category: niche.category,
        marketOverview: aiSummary.marketOverview,
        theGap: aiSummary.theGap,
        actionsToDo: aiSummary.actionsToDo || [],
        appExamples,
        displayCode: niche.display_code,
        score: niche.score
      });

      console.log(`   ✅ Generated summary for: ${niche.title}`);

    } catch (error) {
      console.error(`Failed to generate summary for ${niche.title}:`, error);
      
      // Fallback: use raw data
      const trending = safeJsonParse(niche.trending, []);
      summaries.push({
        title: niche.title,
        emoji: '🎯',
        category: niche.category,
        marketOverview: niche.opportunity,
        theGap: niche.gap,
        actionsToDo: [niche.move],
        appExamples: trending.slice(0, 3).map((app: any) => ({
          name: app.name || 'Unknown',
          description: app.description || '',
          mrr: app.estimatedMRR || 'N/A'
        })),
        displayCode: niche.display_code,
        score: niche.score
      });
    }
  }

  return summaries;
}

