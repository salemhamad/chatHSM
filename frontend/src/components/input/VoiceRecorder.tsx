import React, { useEffect, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder';
import { useTranslation } from '../../hooks/useTranslation';

interface VoiceRecorderProps {
  onResult: (text: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onResult }) => {
  const { transcript, stopRecording } = useVoiceRecorder();
  const { t } = useTranslation();
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleStop = () => {
    if (transcript.trim()) {
      onResult(transcript);
    }
    stopRecording();
  };

  return (
    <div className="absolute inset-0 z-20 glass-panel rounded-2xl flex items-center justify-between px-4 animate-slideUp">
      <div className="flex items-center gap-4 flex-1 overflow-hidden">
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-2 bg-red-500 rounded-full animate-pulse opacity-40" />
          <Mic className="w-5 h-5 text-red-500 relative z-10" />
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium text-red-400">
            {t('input.recording')}{dots}
          </span>
          <span className="text-xs text-white/60 truncate">
            {transcript || t('input.speakNow')}
          </span>
        </div>
      </div>

      <button 
        onClick={handleStop}
        className="shrink-0 p-3 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-2"
      >
        <Square className="w-4 h-4 fill-current" />
        <span className="text-sm font-medium hidden sm:inline">
          {t('input.stop')}
        </span>
      </button>
    </div>
  );
};
