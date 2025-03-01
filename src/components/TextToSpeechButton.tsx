'use client';

import { useState } from 'react';
import { textToSpeechApi } from '@/utils/api';

interface TextToSpeechButtonProps {
  text: string;
  className?: string;
}

export default function TextToSpeechButton({ text, className = '' }: TextToSpeechButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleSpeak = async () => {
    try {
      // If already playing, stop it
      if (isPlaying && audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      
      // Get the audio URL
      const audioUrl = await textToSpeechApi.speak(text);
      
      // Create and play audio
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
      
      newAudio.onended = () => {
        setIsPlaying(false);
      };
      
      newAudio.onerror = (e) => {
        console.error('Error playing audio:', e);
        setIsPlaying(false);
        setIsLoading(false);
      };
      
      // Wait for audio to be loaded
      newAudio.oncanplaythrough = async () => {
        setIsLoading(false);
        setIsPlaying(true);
        try {
          await newAudio.play();
        } catch (playError) {
          console.error('Error playing audio:', playError);
          setIsPlaying(false);
        }
      };
      
      // Set a timeout in case the audio never loads
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false);
          console.error('Audio loading timed out');
        }
      }, 5000);
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      title={isPlaying ? "Stop speaking" : "Listen to pronunciation"}
      disabled={isLoading}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : isPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
} 