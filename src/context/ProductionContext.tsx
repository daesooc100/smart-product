import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ProductionLine, AlarmEvent, ViewTab, ShiftType, LineStatus } from '../types/production';
import { INITIAL_LINES, INITIAL_ALARMS } from '../data/initialData';

interface ProductionContextType {
  lines: ProductionLine[];
  alarms: AlarmEvent[];
  activeLineId: string | null;
  setActiveLineId: (id: string | null) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  shift: ShiftType;
  setShift: (shift: ShiftType) => void;
  isLive: boolean;
  toggleLive: () => void;
  updateSpeedMs: number;
  setUpdateSpeedMs: (speed: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  lastUpdated: Date;
  
  // Actions
  updateLineStatus: (lineId: string, status: LineStatus, message?: string) => void;
  registerDefect: (lineId: string, type: string, count: number, category: any) => void;
  updateLineTarget: (lineId: string, newTarget: number) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  clearAllAlarms: () => void;
  triggerSimulatedAnomaly: (lineId?: string) => void;
  resetSimulation: () => void;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

// Web Audio API simple beep synthesizer for industrial alerts (quiet & polite)
const playAlertBeep = (type: 'info' | 'warning' | 'critical') => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'critical') {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'warning') {
      osc.frequency.setValueAtTime(620, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } else {
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    }
  } catch {
    // Ignore audio context autoplay restriction
  }
};

export const ProductionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<ProductionLine[]>(INITIAL_LINES);
  const [alarms, setAlarms] = useState<AlarmEvent[]>(INITIAL_ALARMS);
  const [activeLineId, setActiveLineId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [shift, setShift] = useState<ShiftType>('all');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [updateSpeedMs, setUpdateSpeedMs] = useState<number>(3000);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const toggleLive = () => setIsLive(prev => !prev);
  const toggleMute = () => setIsMuted(prev => !prev);

  // Live real-time tick simulation
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());

      setLines(prevLines =>
        prevLines.map(line => {
          if (line.status === 'stopped' || line.status === 'maintenance') {
            return line;
          }

          // Random realistic production drift
          const producedIncrement = line.status === 'running' ? Math.floor(Math.random() * 2) + 1 : 0;
          // Small chance of 1 defect
          const defectIncrement = (line.id === 'line-2' ? Math.random() < 0.22 : Math.random() < 0.08) ? 1 : 0;

          const newActual = line.actualCount + producedIncrement;
          const newDefect = line.defectCount + defectIncrement;
          const newGood = newActual - newDefect;

          // Recompute defect rate with smooth rounding
          const newDefectRate = Number(((newDefect / Math.max(1, newActual)) * 100).toFixed(2));

          // Operation rate gentle fluctuation (-0.2% to +0.2%)
          const opRateDelta = (Math.random() - 0.48) * 0.3;
          let newOpRate = Number(Math.min(99.5, Math.max(70.0, line.operationRate + opRateDelta)).toFixed(1));

          // Tact time fluctuation
          const tactDelta = (Math.random() - 0.5) * 0.4;
          const newTactTime = Number(Math.max(15, line.tactTimeSec + tactDelta).toFixed(1));

          // Step telemetry & WIP fluctuations
          const newSteps = line.steps.map(step => {
            const wipChange = Math.floor(Math.random() * 3) - 1;
            const newWip = Math.max(4, Math.min(45, step.wipCount + wipChange));
            const newUtil = Number(Math.min(99, Math.max(75, step.utilization + (Math.random() - 0.5) * 0.8)).toFixed(1));
            return {
              ...step,
              wipCount: newWip,
              utilization: newUtil,
            };
          });

          // Defect items update if defect incremented
          let updatedDefects = line.defects;
          if (defectIncrement > 0 && line.defects.length > 0) {
            const primaryIdx = 0;
            updatedDefects = line.defects.map((d, idx) => {
              if (idx === primaryIdx) {
                const count = d.count + 1;
                return { ...d, count };
              }
              return d;
            });
            // Recalculate percentages
            const totalD = updatedDefects.reduce((acc, d) => acc + d.count, 0);
            updatedDefects = updatedDefects.map(d => ({
              ...d,
              percentage: Number(((d.count / Math.max(1, totalD)) * 100).toFixed(1)),
            }));
          }

          // Sensor micro-drifts
          const newSensors = {
            ...line.sensors,
            vibrationMmS: Number(Math.max(0.1, line.sensors.vibrationMmS + (Math.random() - 0.5) * 0.08).toFixed(2)),
            pressureMpa: Number(Math.max(0.2, line.sensors.pressureMpa + (Math.random() - 0.5) * 0.02).toFixed(2)),
            powerKw: Number(Math.max(10, line.sensors.powerKw + (Math.random() - 0.5) * 0.6).toFixed(1)),
          };

          return {
            ...line,
            actualCount: newActual,
            defectCount: newDefect,
            goodCount: newGood,
            operationRate: newOpRate,
            defectRate: newDefectRate,
            tactTimeSec: newTactTime,
            steps: newSteps,
            defects: updatedDefects,
            sensors: newSensors,
          };
        })
      );
    }, updateSpeedMs);

    return () => clearInterval(interval);
  }, [isLive, updateSpeedMs]);

  // Update line status
  const updateLineStatus = useCallback((lineId: string, status: LineStatus, message?: string) => {
    setLines(prev =>
      prev.map(line => {
        if (line.id !== lineId) return line;
        let defaultMsg = line.statusMessage;
        if (status === 'running') defaultMsg = '정상 가동 중 (작업 지시 준수)';
        if (status === 'warning') defaultMsg = '주의 요망 (공정 파라미터 점검 필요)';
        if (status === 'stopped') defaultMsg = '설비 일시 정지 (작업자 안전 확인 중)';
        if (status === 'maintenance') defaultMsg = '정기 및 긴급 설비 보전 작업 중';

        return {
          ...line,
          status,
          statusMessage: message || defaultMsg,
          operationRate: status === 'stopped' ? 0 : status === 'maintenance' ? 15.0 : line.operationRate,
        };
      })
    );

    // Add alert
    const target = lines.find(l => l.id === lineId);
    if (target) {
      const newAlarm: AlarmEvent = {
        id: `alm-${Date.now()}`,
        lineId,
        lineCode: target.code,
        severity: status === 'stopped' ? 'critical' : status === 'warning' ? 'warning' : 'info',
        title: `${target.code} 라인 상태 변경: ${status.toUpperCase()}`,
        description: message || `${target.name}의 가동 상태가 ${status}(으)로 수동 전환되었습니다.`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
        acknowledged: false,
      };
      setAlarms(prev => [newAlarm, ...prev.slice(0, 19)]);
      if (!isMuted) {
        playAlertBeep(newAlarm.severity);
      }
    }
  }, [lines, isMuted]);

  // Manual Defect Registration
  const registerDefect = useCallback((lineId: string, type: string, count: number, category: any) => {
    setLines(prev =>
      prev.map(line => {
        if (line.id !== lineId) return line;

        const newDefectCount = line.defectCount + count;
        const newGoodCount = Math.max(0, line.actualCount - newDefectCount);
        const newDefectRate = Number(((newDefectCount / Math.max(1, line.actualCount)) * 100).toFixed(2));

        // Check if defect type exists
        let exists = false;
        let updatedDefects = line.defects.map(d => {
          if (d.type === type) {
            exists = true;
            return { ...d, count: d.count + count };
          }
          return d;
        });

        if (!exists) {
          updatedDefects.push({
            type,
            count,
            percentage: 0,
            category: category || 'assembly',
          });
        }

        const totalD = updatedDefects.reduce((acc, d) => acc + d.count, 0);
        updatedDefects = updatedDefects
          .map(d => ({
            ...d,
            percentage: Number(((d.count / Math.max(1, totalD)) * 100).toFixed(1)),
          }))
          .sort((a, b) => b.count - a.count);

        return {
          ...line,
          defectCount: newDefectCount,
          goodCount: newGoodCount,
          defectRate: newDefectRate,
          defects: updatedDefects,
        };
      })
    );

    const target = lines.find(l => l.id === lineId);
    if (target) {
      const newAlarm: AlarmEvent = {
        id: `alm-${Date.now()}`,
        lineId,
        lineCode: target.code,
        severity: 'warning',
        title: `현장 불량 등록: ${target.code} (${type} +${count}건)`,
        description: `작업자에 의해 불량 현황이 갱신되었습니다. 현재 라인 불량률: ${target.defectRate}%`,
        timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
        acknowledged: false,
      };
      setAlarms(prev => [newAlarm, ...prev.slice(0, 19)]);
      if (!isMuted) playAlertBeep('warning');
    }
  }, [lines, isMuted]);

  // Target count adjustment
  const updateLineTarget = useCallback((lineId: string, newTarget: number) => {
    setLines(prev =>
      prev.map(line => (line.id === lineId ? { ...line, targetCount: newTarget } : line))
    );
  }, []);

  // Alarm acknowledgment
  const acknowledgeAlarm = useCallback((alarmId: string) => {
    setAlarms(prev =>
      prev.map(a => (a.id === alarmId ? { ...a, acknowledged: true } : a))
    );
  }, []);

  const clearAllAlarms = useCallback(() => {
    setAlarms([]);
  }, []);

  // Trigger simulated anomaly for quick interactive demo
  const triggerSimulatedAnomaly = useCallback((lineId?: string) => {
    const targetId = lineId || 'line-2';
    const target = lines.find(l => l.id === targetId) || lines[1];

    setLines(prev =>
      prev.map(line => {
        if (line.id !== targetId) return line;
        const spikeDefects = 6;
        const newDefectCount = line.defectCount + spikeDefects;
        const newDefectRate = Number(((newDefectCount / Math.max(1, line.actualCount)) * 100).toFixed(2));
        
        return {
          ...line,
          status: 'warning',
          statusMessage: '공구 마모로 인한 치수 편차 급증 감지 (긴급 툴체인지 권장)',
          defectCount: newDefectCount,
          defectRate: newDefectRate,
          sensors: {
            ...line.sensors,
            vibrationMmS: 4.65,
            temperatureC: line.sensors.temperatureC + 8.5,
          },
        };
      })
    );

    const newAlarm: AlarmEvent = {
      id: `alm-${Date.now()}`,
      lineId: target.id,
      lineCode: target.code,
      severity: 'critical',
      title: `[이상 징후 감지] ${target.code} ${target.name}`,
      description: '실시간 센서 이상 및 불량 급증 발생! 3번 스핀들 진동이 임계치를 초과했습니다.',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
      acknowledged: false,
    };
    setAlarms(prev => [newAlarm, ...prev.slice(0, 19)]);
    if (!isMuted) playAlertBeep('critical');
  }, [lines, isMuted]);

  // Reset to initial baseline
  const resetSimulation = useCallback(() => {
    setLines(INITIAL_LINES);
    setAlarms(INITIAL_ALARMS);
    setLastUpdated(new Date());
  }, []);

  return (
    <ProductionContext.Provider
      value={{
        lines,
        alarms,
        activeLineId,
        setActiveLineId,
        activeTab,
        setActiveTab,
        shift,
        setShift,
        isLive,
        toggleLive,
        updateSpeedMs,
        setUpdateSpeedMs,
        isMuted,
        toggleMute,
        lastUpdated,
        updateLineStatus,
        registerDefect,
        updateLineTarget,
        acknowledgeAlarm,
        clearAllAlarms,
        triggerSimulatedAnomaly,
        resetSimulation,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction must be used within a ProductionProvider');
  }
  return context;
};
