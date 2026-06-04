'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useKnowledgeStore } from '../../../stores/knowledgeStore';
import { useTranslation } from '../../../hooks/useTranslation';
import { Dropzone } from '../../../components/admin/Dropzone';
import { DocumentsTable } from '../../../components/admin/DocumentsTable';
import { FactsInput } from '../../../components/admin/FactsInput';
import { ArrowLeft, ArrowRight, ShieldCheck, Database, HelpCircle } from 'lucide-react';
import { getToken } from '../../../lib/api';

export default function AdminKnowledgePage() {
  const { error } = useKnowledgeStore();
  const { t, direction } = useTranslation();
  const router = useRouter();

  const isRtl = direction === 'rtl';

  // Check login status on mount
  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex flex-col font-sans" dir={direction}>
      {/* Glow decorative backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="w-full border-b border-white/5 bg-[#0d0d14]/70 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 gap-2">
          <Database className="w-6 h-6 text-cyan-400" />
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">
            ChatHSM ADMIN
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            RAG ACTIVE
          </span>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/5"
        >
          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {t('admin.backToChat')}
        </Link>
      </header>

      {/* Main Admin Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:px-6 space-y-6">
        {/* Banner Section */}
        <div className="space-y-2 text-start">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            {t('admin.adminTitle')}
          </h1>
          <p className="text-gray-400 text-sm max-w-3xl leading-relaxed">
            {t('admin.adminSubtitle')}
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-3 animate-fadeIn">
            <ShieldCheck className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-start flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Two-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main Column (Uploader & Documents List) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-xl space-y-4">
              <Dropzone />
            </div>
            
            <DocumentsTable />
          </div>

          {/* Right Column (Direct Facts & Guidelines) */}
          <div className="space-y-6">
            <FactsInput />

            {/* Quick Informational / FAQ Widget */}
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-950/10 to-purple-950/10 backdrop-blur-md p-6 shadow-xl text-start">
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                {t('admin.faqTitle')}
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t('admin.faqDesc')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="w-full py-6 text-center text-xs text-gray-600 border-t border-white/5 bg-[#07070a] mt-12">
        <p>© 2026 ChatHSM. All rights reserved. RAG Infrastructure & Local Fallbacks Enabled.</p>
      </footer>
    </div>
  );
}
