import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../stores/uiStore';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceRecorder() {
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const { isRecording, setRecording, language } = useUIStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        
        rec.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setRecording(false);
        };

        rec.onend = () => {
          setRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, [setRecording]);

  useEffect(() => {
    if (recognition) {
      // Update language when it changes
      recognition.lang = language === 'ar' ? 'ar-SA' : 'en-US';
    }
  }, [language, recognition]);

  const startRecording = useCallback(() => {
    if (recognition && !isRecording) {
      setTranscript('');
      recognition.start();
      setRecording(true);
    }
  }, [recognition, isRecording, setRecording]);

  const stopRecording = useCallback(() => {
    if (recognition && isRecording) {
      recognition.stop();
      setRecording(false);
    }
  }, [recognition, isRecording, setRecording]);

  return { isSupported, isRecording, transcript, startRecording, stopRecording };
}
