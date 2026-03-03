import { useState, useRef, useEffect } from 'react';

export const STAGES = [
  { key: 'extraction',    label: 'Extraction',    duration: 5 },
  { key: 'filtration',    label: 'Filtration',    duration: 5 },
  { key: 'formulation',   label: 'Formulation',   duration: 5 },
  { key: 'film_formation',label: 'Film Formation',duration: 5 },
];

export default function useDemoMachine() {
  const [demoMode,   setDemoMode]   = useState(false);
  const [demoStatus, setDemoStatus] = useState('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [temps,      setTemps]      = useState({ c1: 25.0, c3: 24.5 });
  const timerRef  = useRef(null);
  const pausedRef = useRef(false);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const startStage = (idx) => {
    clearTimer();
    if (idx >= STAGES.length) {
      setDemoStatus('idle'); setStageIndex(0); setTimeLeft(0); return;
    }
    setStageIndex(idx);
    setTimeLeft(STAGES[idx].duration);
    pausedRef.current = false;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft(t => {
        if (t <= 1) { startStage(idx + 1); return 0; }
        setTemps(p => ({
          c1: +(p.c1 + (Math.random() * 0.4 - 0.1)).toFixed(1),
          c3: +(p.c3 + (Math.random() * 0.3 - 0.1)).toFixed(1),
        }));
        return t - 1;
      });
    }, 1000);
  };

  const demoCommand = (cmd) => {
    switch (cmd) {
      case 'start':
        setDemoStatus('running'); startStage(0); break;
      case 'pause':
        pausedRef.current = true; setDemoStatus('paused'); break;
      case 'continue':
        pausedRef.current = false; setDemoStatus('running'); break;
      case 'stop':
        clearTimer(); setDemoStatus('idle');
        setStageIndex(0); setTimeLeft(0); setTemps({ c1: 25.0, c3: 24.5 }); break;
      case 'cleaning':
        setDemoStatus('cleaning'); setTimeLeft(5);
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) { clearTimer(); setDemoStatus('idle'); return 0; }
            return t - 1;
          });
        }, 1000); break;
      case 'end_cleaning':
        clearTimer(); setDemoStatus('idle'); setTimeLeft(0); break;
    }
  };

  useEffect(() => () => clearTimer(), []);

  return { demoMode, setDemoMode, demoStatus, demoCommand, stageIndex, timeLeft, temps };
}