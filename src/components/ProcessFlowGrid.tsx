import React, { useState } from 'react';
import { useProduction } from '../context/ProductionContext';
import { ChevronRight, AlertCircle, Cpu, Thermometer, Gauge, Clock } from 'lucide-react';

interface ProcessFlowGridProps {
  onOpenLineDetail: (lineId: string) => void;
}

export const ProcessFlowGrid: React.FC<ProcessFlowGridProps> = ({ onOpenLineDetail }) => {
  const { lines } = useProduction();
  const [selectedLineFilter, setSelectedLineFilter] = useState<string>('all');

  const filteredLines = selectedLineFilter === 'all'
    ? lines
    : lines.filter(l => l.id === selectedLineFilter);

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>라인별 세부 공정 흐름도 (Process Flow Map)</span>
            <span className="text-xs font-mono text-cyan-400">실시간 버퍼(WIP) 및 병목 감지</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            각 라인의 단위 공정별 장비 가동률, 사이클 타임, 대기 재공품(WIP) 현황을 추적합니다.
          </p>
        </div>

        {/* Line Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-800/80 rounded-lg border border-slate-700">
          <button
            onClick={() => setSelectedLineFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              selectedLineFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            전체 5개 라인
          </button>
          {lines.map(line => (
            <button
              key={line.id}
              onClick={() => setSelectedLineFilter(line.id)}
              className={`px-2.5 py-1.5 text-xs font-mono font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedLineFilter === line.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {line.code}
            </button>
          ))}
        </div>
      </div>

      {/* Lines Flow View */}
      <div className="space-y-6">
        {filteredLines.map(line => {
          const bottleneckStep = line.steps.find(s => s.status === 'bottleneck' || s.wipCount > 25);

          return (
            <div
              key={line.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all"
            >
              {/* Line Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                    {line.code}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{line.name}</span>
                      <span className="text-xs font-normal text-slate-400">({line.steps.length}개 공정 단위)</span>
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span>로트번호: <span className="font-mono text-slate-300">{line.currentLot}</span></span>
                      <span>·</span>
                      <span>가동률: <span className="font-mono text-cyan-400 font-semibold">{line.operationRate}%</span></span>
                      <span>·</span>
                      <span>불량률: <span className={`font-mono font-semibold ${line.defectRate > line.targetDefectRate ? 'text-rose-400' : 'text-emerald-400'}`}>{line.defectRate}%</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {bottleneckStep && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>{bottleneckStep.stepNumber}번 {bottleneckStep.name} 병목 감지 (WIP {bottleneckStep.wipCount}EA)</span>
                    </div>
                  )}

                  <button
                    onClick={() => onOpenLineDetail(line.id)}
                    className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                  >
                    공정 제어
                  </button>
                </div>
              </div>

              {/* Step Flow Pipeline */}
              <div className="pt-4 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-[780px] pb-2">
                  {line.steps.map((step, idx) => {
                    const isBottleneck = step.status === 'bottleneck' || step.wipCount > 25;
                    const isBusy = step.status === 'busy';

                    return (
                      <React.Fragment key={step.id}>
                        {/* Step Card */}
                        <div
                          className={`flex-1 min-w-[150px] p-3 rounded-lg border transition-all ${
                            isBottleneck
                              ? 'bg-rose-950/20 border-rose-800/80 shadow-md shadow-rose-950/30'
                              : isBusy
                              ? 'bg-amber-950/20 border-amber-800/60'
                              : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Step Index & Name */}
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                              STEP {step.stepNumber}
                            </span>
                            <span className={`text-[10px] font-mono px-1 rounded ${
                              isBottleneck
                                ? 'bg-rose-900/60 text-rose-300'
                                : isBusy
                                ? 'bg-amber-900/60 text-amber-300'
                                : 'bg-emerald-900/40 text-emerald-400'
                            }`}>
                              {isBottleneck ? '병목주의' : isBusy ? '부하높음' : '정상작동'}
                            </span>
                          </div>

                          <div className="font-semibold text-xs text-white truncate mb-2" title={step.name}>
                            {step.name}
                          </div>

                          <div className="text-[11px] text-slate-400 mb-2 truncate" title={step.equipmentName}>
                            설비: <span className="text-slate-300">{step.equipmentName}</span>
                          </div>

                          {/* Telemetry data */}
                          <div className="space-y-1 text-[11px] font-mono border-t border-slate-800/80 pt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">재공품(WIP)</span>
                              <span className={`font-bold tabular-nums ${isBottleneck ? 'text-rose-400' : 'text-slate-200'}`}>
                                {step.wipCount} EA
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">사이클</span>
                              <span className="text-slate-300 tabular-nums">
                                {step.cycleTimeSec}s <span className="text-slate-500">({step.targetCycleTimeSec}s)</span>
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">가동률</span>
                              <span className="text-cyan-400 font-semibold tabular-nums">
                                {step.utilization}%
                              </span>
                            </div>

                            {step.temperature && (
                              <div className="flex items-center justify-between text-amber-400">
                                <span>온도</span>
                                <span className="tabular-nums">{step.temperature}°C</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector arrow */}
                        {idx < line.steps.length - 1 && (
                          <div className="shrink-0 flex items-center justify-center text-slate-600">
                            <ChevronRight className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Line Sensor Summary Footer */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-4 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    온도 {line.sensors.temperatureC}°C
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    진동 {line.sensors.vibrationMmS} mm/s
                  </span>
                  <span>·</span>
                  <span>압력 {line.sensors.pressureMpa} MPa</span>
                  <span>·</span>
                  <span>소비전력 {line.sensors.powerKw} kW</span>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
                  실시간 Tact Time: <span className="text-white font-bold">{line.tactTimeSec}초</span> / 목표: {line.targetTactTimeSec}초
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
