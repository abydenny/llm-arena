import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LLM Arena & Automated Judge | OpenRouter & Supabase',
  description: 'Simultaneously query top foundation models via OpenRouter, analyze token telemetry, latency, and cost, with automated LLM Judge evaluations stored in Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
