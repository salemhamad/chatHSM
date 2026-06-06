'use client';

import React, { useEffect } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { useTranslation } from '../../hooks/useTranslation';
import { formatFileSize, formatRelativeTime } from '../../lib/utils';
import { Trash2, FileText, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

export const DocumentsTable: React.FC = () => {
  const { documents, fetchDocuments, toggleDocument, deleteDocument, isLoading } = useKnowledgeStore();
  const { t } = useTranslation();

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Set up auto-polling if any document is in PENDING status
  useEffect(() => {
    const hasPending = documents.some((doc) => doc.status === 'PENDING');
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchDocuments();
    }, 3000);

    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PROCESSED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('admin.statusProcessed')}
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 gap-1 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            {t('admin.statusPending')}
          </span>
        );
      case 'ERROR':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('admin.statusError')}
          </span>
        );
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('admin.deleteConfirm'))) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-xl">
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          {t('admin.documentsTableTitle')}
        </h3>
        <button
          onClick={() => fetchDocuments()}
          disabled={isLoading}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-right md:text-left">
          <thead>
            <tr className="border-b border-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.01]">
              <th className="px-6 py-4 text-start">{t('admin.fileNameCol')}</th>
              <th className="px-6 py-4">{t('admin.fileSizeCol')}</th>
              <th className="px-6 py-4">{t('admin.uploadedCol')}</th>
              <th className="px-6 py-4">{t('admin.statusCol')}</th>
              <th className="px-6 py-4 text-center">{t('admin.contextCol')}</th>
              <th className="px-6 py-4 text-center">{t('admin.actionsCol')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm text-gray-300">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  {t('admin.emptyDocuments')}
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-white/[0.01] transition-colors"
                >
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center space-x-3 gap-2">
                      <FileText className="w-5 h-5 text-cyan-400 shrink-0" />
                      <span className="font-medium text-white truncate max-w-[200px] md:max-w-[320px]">
                        {doc.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {formatFileSize(doc.fileSize)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {formatRelativeTime(doc.createdAt)}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => toggleDocument(doc.id)}
                        disabled={doc.status !== 'PROCESSED'}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-30 disabled:pointer-events-none ${
                          doc.isEnabled ? 'bg-cyan-500 shadow-sm shadow-cyan-500/35' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            doc.isEnabled
                              ? 'translate-x-6 rtl:-translate-x-6'
                              : 'translate-x-1 rtl:-translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
