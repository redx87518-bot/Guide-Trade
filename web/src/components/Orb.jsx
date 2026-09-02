import { useState, useEffect, useRef, useCallback } from 'react';
import { useResearch } from '@/hooks/useResearch';
import { useAuth } from '@/hooks/useAuth';

const ORB_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  THINKING: 'thinking',
  SPEAKING: 'speaking',
  ERROR: 'error',
};

export default function Orb({ onResearchComplete }) {
  const [state, setState] = useState(ORB_STATES.IDLE);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const orbRef = useRef(null);
  const { user } = useAuth();
  const { startResearch, results, loading, progress, error } = useResearch();

  const handleOrbClick = useCallback(async () => {
    if (loading) return;
    if (state === ORB_STATES.LISTENING) {
      setState(ORB_STATES.IDLE);
      return;
    }

    const query = prompt('What would you like to research?') || '';
    if (!query.trim()) return;

    setState(ORB_STATES.THINKING);
    const symbol = query.match(/\b([A-Z]{1,5})\b/i)?.[1]?.toUpperCase() || null;
    
    await startResearch(query, symbol);
    
    if (results) {
      if (voiceEnabled) {
        setState(ORB_STATES.SPEAKING);
      }
      if (onResearchComplete) {
        onResearchComplete(results);
      }
    } else if (error) {
      setState(ORB_STATES.ERROR);
    } else {
      setState(ORB_STATES.IDLE);
    }
  }, [state, loading, startResearch, results, error, voiceEnabled, onResearchComplete]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(!voiceEnabled);
  }, [voiceEnabled]);

  const orbClass = `orb orb--${state}`;
  const pulseClass = `orb__pulse orb__pulse--${state}`;

  return (
    <div className="orb-container">
      <div 
        ref={orbRef}
        className={orbClass}
        onClick={handleOrbClick}
        role="button"
        aria-label={`Orb in ${state} state. Click to ${state === 'listening' ? 'stop' : 'research'}.`}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOrbClick(); }}
      >
        <div className={pulseClass}></div>
      </div>
      
      <div className="orb-controls">
        <button
          className={`voice-toggle ${voiceEnabled ? 'active' : ''}`}
          onClick={toggleVoice}
          aria-label={voiceEnabled ? 'Voice on' : 'Voice off'}
          title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
        >
          {voiceEnabled ? '🔊' : '🔇'}
        </button>
      </div>
      
      {progress && <div className="orb-status">{progress}</div>}
      {error && <div className="orb-error">{error}</div>}
    </div>
  );
}
