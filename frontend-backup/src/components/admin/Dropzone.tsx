'use client';

import React, { useState, useRef } from 'react';
import { useKnowledgeStore } from '../../stores/knowledgeStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Upload, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Dropzone: React.FC = () => {
  const { uploadDocument, uploadProgress, isUploading } = useKnowledgeStore();
  const { t } = useTranslation();
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      await processFiles(files);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      await processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    const allowedExtensions = ['.pdf', '.txt', '.docx', '.md'];
    for (const file of files) {
      const hasAllowedExtension = allowedExtensions.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      const isUnderLimit = file.size <= 25 * 1024 * 1024; // 25MB

      if (hasAllowedExtension && isUnderLimit) {
        uploadDocument(file);
      } else {
        alert(t('admin.fileAlert', { name: file.name }));
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const activeUploads = Object.entries(uploadProgress);

  return (
    <div className="w-full space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={cn(
          'w-full min-h-[220px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 relative overflow-hidden',
          isDragActive
            ? 'border-cyan-400 bg-cyan-950/15 shadow-inner shadow-cyan-500/10'
            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.txt,.docx,.md"
          onChange={handleFileInput}
        />

        <div className="p-4 rounded-full bg-white/[0.03] text-cyan-400 mb-4 border border-white/5 shadow-md">
          <Upload className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">{t('admin.adminTitle')}</h3>
        <p className="text-gray-400 text-sm mb-3">{t('admin.dropzoneTitle')}</p>
        <p className="text-xs text-gray-500">{t('admin.dropzoneSubtitle')}</p>

        {isDragActive && (
          <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-[2px] pointer-events-none" />
        )}
      </div>

      {activeUploads.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t('admin.uploading')}
          </h4>
          {activeUploads.map(([fileId, percentage]) => {
            const fileName = fileId.slice(0, fileId.lastIndexOf('-'));
            return (
              <div
                key={fileId}
                className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col space-y-2 animate-fadeIn"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 gap-2">
                    <FileText className="w-5 h-5 text-purple-400 shrink-0" />
                    <span className="text-sm font-medium text-white truncate max-w-[250px] md:max-w-[450px]">
                      {fileName}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-cyan-400">{percentage}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 transition-all duration-300 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
