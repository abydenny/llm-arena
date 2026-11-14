# 🏆 Multi-Model LLM Arena & Automated Judge

A modern, full-stack Next.js 14 & Supabase application that enables users to query multiple Large Language Models simultaneously through **OpenRouter**, inspect real-time performance and cost telemetry (tokens, latency, USD cost), and receive automated benchmark evaluations from an **LLM Judge**.

---

## ✨ Key Functionalities

1. **🔒 Secure PIN Authentication**:
   - Access is gated behind a numeric PIN stored in `.env.local` (`APP_PIN`).
   - Generates an HMAC-signed secure HTTP-only session cookie.
   - Interactive on-screen keypad and auto-submit.

2. **⚡ Multi-Model Concurrent Chat**:
   - Multi-select contender models from top providers: OpenAI, Anthropic, Google, Meta, DeepSeek, and Mistral.
   - User prompts are broadcast in parallel (`Promise.allSettled`) across all selected LLMs via **OpenRouter API**.
   - Custom model support allows testing any arbitrary model identifier on OpenRouter.

3. **📊 Granular Telemetry & Cost Per Message**:
   - Each model response features a telemetry icon that opens an in-depth performance inspection modal.
   - Displays **Prompt Tokens (Input)**, **Completion Tokens (Output)**, **Total Tokens**, **Latency (ms/seconds)**, **Exact Cost in USD**, and **Throughput (Tokens/sec)**.
   - Includes cross-model comparison tables for every turn, highlighting the fastest and lowest-cost models.

4. **⚖️ Automated LLM Judge Verdict**:
   - Automatically analyzes and evaluates candidate outputs for accuracy, depth, structure, and clarity.
   - Declares the **Winner / Best Response** with an extensive explanation.
   - Provides an itemized scorecard (1-100 rating), rank, strengths, weaknesses, and comparative critique.
   - Highlight crown badge displayed on the winning response card.

5. **🗄️ Full Supabase Persistence**:
   - Automatically stores all conversations, user prompts, candidate model responses, token & cost telemetry, and LLM Judge evaluations.
   - Works seamlessly in demo mode without Supabase, and automatically syncs to cloud database when configured.

6. **🎨 Clean Soft Gradient Aesthetic**:
   - Built with Tailwind CSS featuring dark mode, soft radial background gradients, glassmorphism card surfaces, and responsive grids.

7. **🚀 Vercel Deployment Ready**:
   - Next.js App Router architecture ready to import and deploy directly to Vercel with zero modifications.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer
- **LLM Gateway**: OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`)
- **Database & Sync**: Supabase (`@supabase/supabase-js`, `@supabase/ssr`)
- **Markdown & Code**: `react-markdown`, `remark-gfm`
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
cd llm-arena
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure your credentials:

```env
# 1. PIN Authentication (Default is 1234)
APP_PIN=1234

# 2. OpenRouter API Key (Get from https://openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx

# Optional: OpenRouter site metadata
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="LLM Arena & Multi-Model Judge"

# 3. Supabase Credentials (Get from Supabase Dashboard -> Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# 4. LLM Judge Model
JUDGE_MODEL=openai/gpt-4o-mini

# 5. Session Secret for Cookie Signing
PIN_SESSION_SECRET=your_super_secret_session_salt
```

### 3. Setup Supabase Database

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and paste the contents of `supabase/schema.sql`.
4. Click **Run**. This will create the required tables (`conversations`, `messages`, `model_responses`, `judge_evaluations`), indexes, and RLS policies.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Enter your configured PIN (default: `1234`) to unlock the Arena.

---

## ☁️ Deploying to Vercel

1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LLM Arena & Judge"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Go to [Vercel](https://vercel.com) and click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository.
4. Under **Environment Variables**, add:
   - `APP_PIN`
   - `OPENROUTER_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JUDGE_MODEL`
   - `PIN_SESSION_SECRET`
5. Click **Deploy**. Vercel will build and deploy your application worldwide!
