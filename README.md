# Niches Hunter Paid Newsletter 🏆

Newsletter premium pour les utilisateurs payants de Niches Hunter. Pas de CTA, données complètes.

## 🏗️ Architecture

- **Récupère les dernières niches** depuis la table `niches`
- **Génère une newsletter premium** sans CTAs marketing
- **Envoie aux paid subscribers** (table `paid_newsletter_subscribers`)
- **Décalé dans le temps** par rapport à la newsletter gratuite

## 📊 Tables Supabase utilisées

### Table `niches` (source)
```sql
-- Les niches analysées et publiées
SELECT * FROM niches ORDER BY created_at DESC LIMIT 2;
```

### Table `paid_newsletter_subscribers`
```sql
-- Synchronisée automatiquement avec customers via trigger
SELECT * FROM paid_newsletter_subscribers WHERE is_active = true;
```

### Table `paid_newsletters` (optionnel - historique)
```sql
CREATE TABLE paid_newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔧 Variables d'environnement

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# OpenAI (pour les résumés IA)
OPENAI_API_KEY=sk-xxx

# Email (Resend)
RESEND_API_KEY=xxx
EMAIL_FROM=Niches Hunter <support@arianeconcept.fr>

# Telegram (optionnel)
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx

# Site URL (pour les liens vers les niches)
SITE_URL=https://nicheshunter.app

# Server
PORT=3002

# Test Mode (true = utilise la table paid_newsletter_subscribers_test)
TEST_MODE=true
```

## 🚀 Déploiement

### Railway
1. Connecter le repo GitHub
2. Ajouter les variables d'environnement
3. Configurer un CRON job pour déclencher `/generate`

### CRON suggéré
- Newsletter FREE : 8h00
- Newsletter PAID : 9h00 (1h après pour avoir les dernières niches)

## 📝 Développement local

```bash
# Installer les dépendances
npm install

# Lancer en mode dev
npm run dev

# Générer manuellement
npm run generate
```

## 📡 Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/generate` | Déclenche la génération |

## 🔄 Workflow

```
1. CRON trigger (9h00)
       ↓
2. POST /generate
       ↓
3. Récupère les 2 dernières niches
       ↓
4. Génère résumés IA (Market Overview, Gap, Actions)
       ↓
5. Génère HTML premium avec liens vers le site
       ↓
6. Envoie aux paid_newsletter_subscribers
       ↓
7. Notification Telegram
```

## 📧 Différences avec la newsletter FREE

| Feature | FREE | PAID |
|---------|------|------|
| CTAs "Unlock" | ✅ Oui | ❌ Non |
| Données complètes | ❌ Teaser | ✅ Tout |
| Badge | 🎯 NICHES HUNTER | 🏆 NICHES HUNTER PRO |
| "Your Move" section | ✅ Avec CTA | ❌ Remplacé par Pro Tip |

