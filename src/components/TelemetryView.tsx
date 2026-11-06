import React from 'react';
import { useProduction } from '../context/ProductionContext';
import { Thermometer, Gauge, Zap, Activity, AlertOctagon, RefreshCw } from 'lucide-react';

export const TelemetryView: React.FC = () => {
  const { lines, lastUpdated, triggerSimulatedAnomaly } = useProduction();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>5개 라인 설비 센서 텔레메트리 (Equipment Telemetry)</span>
            <span className="text-xs font-mono text-cyan-400">IoT 센서 실시간 수신</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            모터 진동 가속도, 베어링 온도, 공압 공급 압력, 유효 소비전력 센서 지표를 실시간 모니터링합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerSimulatedAnomaly('line-2')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>L02 진동 이상 주입</span>
          </button>
        </div>
      </div>

      {/* Grid of 5 lines telemetry cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {lines.map(line => {
          const isVibrationHigh = line.sensors.vibrationMmS > 3.0;
          const isTempHigh = line.sensors.temperatureC > 70;

          return (
            <div
              key={line.id}
              className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                isVibrationHigh || isTempHigh
                  ? 'border-amber-600/80 shadow-md shadow-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                      {line.code}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{line.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{line.category}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    line.status === 'running'
                      ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                      : 'bg-amber-950/80 border-amber-800 text-amber-400'
                  }`}>
                    {line.status.toUpperCase()}
                  </span>
                </div>

                {/* 4 Sensor Meters */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Temperature */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                        설비 온도
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">정상: &lt;70°C</span>
                    </div>
                    <div className={`text-xl font-bold font-mono tabular-nums ${isTempHigh ? 'text-rose-400' : 'text-white'}`}>
                      {line.sensors.temperatureC}°C
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isTempHigh ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, (line.sensors.temperatureC / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Vibration */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                        진동 가속도
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">경보: &gt;3.0</span>
                    </div>
                    <div className={`text-xl font-bold font-mono tabular-nums ${isVibrationHigh ? 'text-rose-400 font-extrabold animate-pulse' : 'text-white'}`}>
                      {line.sensors.vibrationMmS} <span className="text-xs text-slate-400 font-normal">mm/s</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isVibrationHigh ? 'bg-rose-500' : 'bg-cyan-500'}`}
                        style={{ width: `${Math.min(100, (line.sensors.vibrationMmS / 5.0) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Power */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        소비 전력
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">부하율</span>
                    </div>
                    <div className="text-xl font-bold font-mono tabular-nums text-white">
                      {line.sensors.powerKw} <span className="text-xs text-slate-400 font-normal">kW</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{ width: `${Math.min(100, (line.sensors.powerKw / 70) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Pressure / RPM */}
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        공압 공급
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">0.5~0.8</span>
                    </div>
                    <div className="text-xl font-bold font-mono tabular-nums text-white">
                      {line.sensors.pressureMpa} <span className="text-xs text-slate-400 font-normal">MPa</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(100, (line.sensors.pressureMpa / 1.0) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Subtext info */}
                <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-xs text-slate-400 font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <span>스핀들/모터 회전수:</span>
                    <span className="text-slate-200 font-bold">{line.sensors.rpm ? `${line.sensors.rpm.toLocaleString()} RPM` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>현재 공정 가동률:</span>
                    <span className="text-cyan-400 font-bold">{line.operationRate}%</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                <span>센서 노드: NODE-{line.code}-01</span>
                <span>수신 양호 (0.2s 지연)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
