import { NicheSummary } from '../services/openai';

// Site URL for niche links
const SITE_URL = process.env.SITE_URL || 'https://nicheshunter.app';

/**
 * Category colors for niches
 */
const categoryColors: Record<string, string> = {
  'Entertainment': '#9B59B6',
  'Photo & Video': '#E91E63',
  'Social Networking': '#3498DB',
  'Productivity': '#27AE60',
  'Finance': '#F39C12',
  'Health & Fitness': '#1ABC9C',
  'Games': '#E74C3C',
  'Lifestyle': '#FF6B6B',
  'Education': '#5DADE2',
  'Shopping': '#FF9F43',
  'default': '#00CC6A'
};

function getCategoryColor(category: string): string {
  for (const [key, color] of Object.entries(categoryColors)) {
    if (category?.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return categoryColors['default'];
}

/**
 * Generate niche card - PREMIUM VERSION (concise, clear, actionable)
 */
function generateNicheCard(niche: NicheSummary, index: number): string {
  const color = getCategoryColor(niche.category);
  const nicheNumber = index + 1;
  const nicheUrl = `${SITE_URL}/niches/${niche.displayCode}`;

  // Build actions list
  const actionsHtml = niche.actionsToDo.map((action, i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td width="28" style="vertical-align:top;">
              <div style="width:22px;height:22px;background:${color};border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:700;color:#fff;">${i + 1}</div>
            </td>
            <td style="padding-left:12px;font-size:14px;color:#333;line-height:1.5;">${action}</td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  // Build app examples
  const appsHtml = niche.appExamples.length > 0 ? niche.appExamples.map(app => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <div style="font-size:14px;font-weight:600;color:#111;">${app.name}</div>
        <div style="font-size:13px;color:#666;margin-top:4px;line-height:1.4;">${app.description}</div>
        <div style="font-size:12px;color:${color};font-weight:600;margin-top:6px;">💰 ${app.mrr}</div>
      </td>
    </tr>
  `).join('') : '';

  return `
    <!-- ═══════════════════════════════════════════ -->
    <!-- NICHE ${nicheNumber} -->
    <!-- ═══════════════════════════════════════════ -->
    <tr>
      <td style="padding:0 0 32px;">
        
        <!-- Niche Card -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
          
          <!-- Niche Header -->
          <tr>
            <td style="background:${color};padding:24px 28px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <div style="font-size:11px;color:rgba(255,255,255,0.7);font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Niche #${nicheNumber} • Score ${niche.score}/100</div>
                    <div style="font-size:24px;font-weight:800;color:#fff;margin-bottom:4px;">${niche.emoji} ${niche.title}</div>
                    <div style="font-size:14px;color:rgba(255,255,255,0.85);">${niche.category}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Market Overview -->
          <tr>
            <td style="padding:24px 28px 0;">
              <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">📊 Market Overview</div>
              <p style="margin:0;font-size:15px;color:#333;line-height:1.7;">${niche.marketOverview}</p>
            </td>
          </tr>

          <!-- The Gap -->
          <tr>
            <td style="padding:20px 28px;">
              <div style="background:#fef3c7;border-radius:12px;padding:20px;border-left:4px solid #f59e0b;">
                <div style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">💡 The Gap</div>
                <p style="margin:0;font-size:15px;color:#92400e;line-height:1.6;">${niche.theGap}</p>
              </div>
            </td>
          </tr>

          <!-- Actions to Do -->
          <tr>
            <td style="padding:0 28px 20px;">
              <div style="background:#f0fdf4;border-radius:12px;padding:20px;border-left:4px solid #00CC6A;">
                <div style="font-size:12px;font-weight:700;color:#00CC6A;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">🚀 Actions to Do</div>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                  ${actionsHtml}
                </table>
              </div>
            </td>
          </tr>

          <!-- App Examples -->
          ${appsHtml ? `
          <tr>
            <td style="padding:0 28px 20px;">
              <div style="font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">📱 Apps Already Doing This</div>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                ${appsHtml}
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 28px 24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${nicheUrl}" style="display:inline-block;background:${color};color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:700;">
                      View Full Analysis →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  `;
}

/**
 * Generate PREMIUM newsletter HTML - Concise, clear, actionable
 */
export function generatePaidNewsletterHTML(niches: NicheSummary[], title: string): string {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Generate niches HTML
  let nichesHtml = '';
  niches.forEach((niche, index) => {
    nichesHtml += generateNicheCard(niche, index);
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta content="width=device-width, initial-scale=1.0" name="viewport">
  <title>Niches Hunter Pro - Daily Brief</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="padding:32px 16px;background-color:#f5f5f7;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table cellpadding="0" cellspacing="0" width="100%" border="0" style="max-width:560px;">
          
          <!-- Logo - PRO Badge -->
          <tr>
            <td style="text-align:center;padding-bottom:24px;">
              <div style="display:inline-block;background:#111;padding:10px 20px;border-radius:100px;">
                <span style="letter-spacing:2px;font-size:12px;font-weight:700;color:#FFD700;">
                  🏆 NICHES HUNTER PRO
                </span>
              </div>
            </td>
          </tr>

          <!-- Header Card -->
          <tr>
            <td style="padding-bottom:24px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
                <tr>
                  <td style="padding:32px 28px;text-align:center;">
                    <div style="font-size:13px;color:#888;margin-bottom:12px;">${today}</div>
                    <h1 style="margin:0 0 16px;font-size:26px;font-weight:800;color:#111;letter-spacing:-0.5px;line-height:1.25;">
                      ${title}
                    </h1>
                    <p style="margin:0;font-size:16px;color:#444;line-height:1.6;">
                      Your daily brief with actionable opportunities.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Section Label -->
          <tr>
            <td style="padding:8px 0 20px;">
              <div style="font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:2px;text-align:center;">
                Today's Opportunities
              </div>
            </td>
          </tr>

          <!-- NICHES -->
          ${nichesHtml}

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding:16px;">
              <p style="margin:0 0 8px;font-size:14px;color:#666;">
                Happy hunting 🚀
              </p>
              <a href="${SITE_URL}" style="text-decoration:none;font-size:13px;font-weight:600;color:#00CC6A;">
                nicheshunter.app
              </a>
              <p style="margin:12px 0 0;font-size:11px;color:#999;">
                You're receiving this because you're a Niches Hunter Pro member.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
