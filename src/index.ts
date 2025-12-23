import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Niches Hunter Paid Newsletter Service`);
  console.log(`═══════════════════════════════════════════`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`⏰ CRON géré par Railway`);
  console.log(`📍 Health: http://localhost:${PORT}/health`);
  console.log(`📍 Generate: POST http://localhost:${PORT}/generate`);
  console.log(`═══════════════════════════════════════════\n`);
});

