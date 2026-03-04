import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../constants/api';

export const STAGES = [
  { key: 'extraction',     label: 'Extraction',     duration: 5 },
  { key: 'filtration',     label: 'Filtration',     duration: 5 },
  { key: 'formulation',    label: 'Formulation',    duration: 5 },
  { key: 'film_formation', label: 'Film Formation', duration: 5 },
];

export default function useDemoMachine(onRefresh) {
  const [demoMode,   setDemoMode]   = useState(false);
  const [demoStatus, setDemoStatus] = useState('idle');
  const [stageIndex, setStageIndex] = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [temps,      setTemps]      = useState({ c1: 25.0, c3: 24.5 });
  const timerRef   = useRef(null);
  const pausedRef  = useRef(false);
  const batchIdRef = useRef(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const dbCall = (action, extra = {}) => {
    if (!batchIdRef.current) return;
    axios.post(`${API_URL}/demo_control.php`, {
      action,
      batch_id: batchIdRef.current,
      ...extra,
    }).catch(() => {});
  };

  const startStage = (idx) => {
    clearTimer();
    if (idx >= STAGES.length) {
      dbCall('complete');
      setDemoStatus('idle');
      setStageIndex(0);
      setTimeLeft(0);
      batchIdRef.current = null;
      onRefresh?.(); 
      return;
    }

    setStageIndex(idx);
    setTimeLeft(STAGES[idx].duration);
    pausedRef.current = false;
    dbCall('update_stage', { stage: STAGES[idx].key });

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

  const demoCommand = (cmd, batch_id = null) => {
    switch (cmd) {
      case 'start':
        if (batch_id) batchIdRef.current = batch_id;
        setDemoStatus('running');
        startStage(0);
        break;
      case 'pause':
        pausedRef.current = true;
        setDemoStatus('paused');
        dbCall('pause');
        break;
      case 'continue':
        pausedRef.current = false;
        setDemoStatus('running');
        dbCall('resume');
        break;
      case 'stop':
        clearTimer();
        if (batchIdRef.current) {
          axios.post(`${API_URL}/demo_control.php`, {
            action: 'stop',
            batch_id: batchIdRef.current,
          }).then(() => onRefresh?.()).catch(() => {});
          batchIdRef.current = null;
        }
        setDemoStatus('idle');
        setStageIndex(0); setTimeLeft(0); setTemps({ c1: 25.0, c3: 24.5 });
        break;
      case 'cleaning':
        setDemoStatus('cleaning');
        setTimeLeft(5);
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) { clearTimer(); setDemoStatus('idle'); return 0; }
            return t - 1;
          });
        }, 1000);
        break;
      case 'end_cleaning':
        clearTimer();
        setDemoStatus('idle');
        setTimeLeft(0);
        break;
    }
  };

  useEffect(() => () => clearTimer(), []);

  return { demoMode, setDemoMode, demoStatus, demoCommand, stageIndex, timeLeft, temps };
}