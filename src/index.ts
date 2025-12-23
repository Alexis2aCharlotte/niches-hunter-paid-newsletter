import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { generatePaidNewsletter } from './generate';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Niches Hunter Paid Newsletter',
    description: 'Premium newsletter for paid users - fetches latest niches',
    cronSchedule: '8h00 Paris time (7h UTC)',
    timestamp: new Date().toISOString()
  });
});

// Manual trigger endpoint (pour tests)
app.post('/generate', async (req, res) => {
  console.log('📰 Manual paid newsletter generation triggered');
  
  // Respond immediately
  res.json({ 
    success: true, 
    message: 'Paid newsletter generation started...' 
  });

  // Generate in background
  generatePaidNewsletter().catch(err => {
    console.error('❌ Paid newsletter generation failed:', err);
  });
});

// ⏰ CRON JOB - Tous les jours à 8h (heure de Paris)
// 0 7 * * * = 7h UTC = 8h Paris (hiver) / 9h Paris (été)
cron.schedule('0 7 * * *', () => {
  console.log('');
  console.log('⏰ CRON triggered at', new Date().toISOString());
  generatePaidNewsletter().catch(err => {
    console.error('❌ CRON newsletter generation failed:', err);
  });
}, {
  timezone: 'Europe/Paris'
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Niches Hunter Paid Newsletter Service`);
  console.log(`═══════════════════════════════════════════`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`⏰ CRON: Tous les jours à 8h00 (Paris)`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Generate: POST http://localhost:${PORT}/generate`);
  console.log(`═══════════════════════════════════════════\n`);
});

