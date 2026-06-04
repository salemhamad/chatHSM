'use client';

import React, { useState, useEffect } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Trash2, PlusCircle, Bookmark, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '../../lib/utils';

export const FactsInput: React.FC = () => {
  const { facts, fetchFacts, createFact, deleteFact } = useKnowledgeStore();
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFacts();
  }, [fetchFacts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createFact(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.deleteFactConfirm'))) {
      await deleteFact(id);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-xl">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-purple-400" />
          {t('admin.factsInputTitle')}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t('admin.factsInputPlaceholder')}
            rows={4}
            className="w-full rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 focus:border-cyan-500 p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all duration-300 resize-none"
            required
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="gradient-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlusCircle className="w-4 h-4" />
              )}
              {t('admin.addFactBtn')}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 shadow-xl">
        <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
          {t('admin.factsTitle')}
        </h4>

        {facts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">{t('admin.emptyFacts')}</p>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {facts.map((fact) => (
              <div
                key={fact.id}
                className="group flex items-start justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200 animate-fadeIn"
              >
                <div className="space-y-1 text-start">
                  <p className="text-sm text-gray-200 leading-relaxed font-medium">
                    {fact.content}
                  </p>
                  <span className="text-[10px] text-gray-500 block">
                    {formatRelativeTime(fact.createdAt)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(fact.id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer shrink-0 opacity-80 md:opacity-0 md:group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
