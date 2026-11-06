import React, { useState } from 'react';
import { ProductionLine, LineStatus } from '../types/production';
import { useProduction } from '../context/ProductionContext';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  PauseCircle, 
  Wrench, 
  Thermometer, 
  Gauge, 
  Zap, 
  Activity, 
  Layers, 
  Clock, 
  Target, 
  PlusCircle,
  Save
} from 'lucide-react';

interface LineDetailModalProps {
  lineId: string | null;
  onClose: () => void;
  onOpenDefectRegister: (lineId: string) => void;
}

export const LineDetailModal: React.FC<LineDetailModalProps> = ({
  lineId,
  onClose,
  onOpenDefectRegister,
}) => {
  const { lines, updateLineStatus, updateLineTarget } = useProduction();
  const line = lines.find(l => l.id === lineId);

  const [editTargetCount, setEditTargetCount] = useState<string>('');
  const [isEditingTarget, setIsEditingTarget] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string>('');

  if (!line) return null;

  const handleSaveTarget = () => {
    const num = parseInt(editTargetCount, 10);
    if (!isNaN(num) && num > 0) {
      updateLineTarget(line.id, num);
      setIsEditingTarget(false);
    }
  };

  const handleStatusChange = (newStatus: LineStatus) => {
    updateLineStatus(line.id, newStatus, statusNote.trim() || undefined);
    setStatusNote('');
  };

  const isOpRateAhead = line.operationRate >= line.targetOperationRate;
  const isDefectOver = line.defectRate > line.targetDefectRate;
  const achievementRate = Number(((line.actualCount / Math.max(1, line.targetCount)) * 100).toFixed(1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold px-2 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400">
              {line.code}
            </span>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {line.name}
                <span className="text-xs font-normal text-slate-400">({line.category})</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                현재 작업 로트: <span className="text-slate-200">{line.currentLot}</span> · 담당 책임: <span className="text-slate-200">{line.managerName}</span> (작업원 {line.operatorCount}명)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Status Alert and Quick Control Banner */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-400">공정 가동 상태:</span>
                <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded border ${
                  line.status === 'running'
                    ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400'
                    : line.status === 'warning'
                    ? 'bg-amber-950/80 border-amber-800 text-amber-400'
                    : 'bg-rose-950/80 border-rose-800 text-rose-400'
                }`}>
                  {line.status.toUpperCase()}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200">{line.statusMessage}</p>
            </div>

            {/* Status change buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleStatusChange('running')}
                disabled={line.status === 'running'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>정상 가동</span>
              </button>
              <button
                onClick={() => handleStatusChange('warning')}
                disabled={line.status === 'warning'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>주의 지정</span>
              </button>
              <button
                onClick={() => handleStatusChange('stopped')}
                disabled={line.status === 'stopped'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>설비 정지</span>
              </button>
              <button
                onClick={() => handleStatusChange('maintenance')}
                disabled={line.status === 'maintenance'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>보전 점검</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400">실시간 가동률</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-bold font-mono tabular-nums ${isOpRateAhead ? 'text-cyan-400' : 'text-amber-400'}`}>
                  {line.operationRate}
                </span>
                <span className="text-xs font-mono text-slate-400">%</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                목표 {line.targetOperationRate}% ({isOpRateAhead ? `+${(line.operationRate - line.targetOperationRate).toFixed(1)}%p` : `${(line.operationRate - line.targetOperationRate).toFixed(1)}%p`})
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400">실시간 불량률</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className={`text-2xl font-bold font-mono tabular-nums ${isDefectOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {line.defectRate}
                </span>
                <span className="text-xs font-mono text-slate-400">%</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                불량 {line.defectCount}EA / 상한 {line.targetDefectRate}%
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>일일 생산 실적</span>
                {!isEditingTarget ? (
                  <button
                    onClick={() => {
                      setEditTargetCount(String(line.targetCount));
                      setIsEditingTarget(true);
                    }}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    목표 수정
                  </button>
                ) : null}
              </div>

              {!isEditingTarget ? (
                <>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold font-mono text-white tabular-nums">
                      {line.actualCount.toLocaleString()}
                    </span>
                    <span className="text-xs font-mono text-slate-400">/ {line.targetCount.toLocaleString()} EA</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1 font-semibold">
                    달성률 {achievementRate}% (양품 {line.goodCount.toLocaleString()})
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-1.5 mt-2">
                  <input
                    type="number"
                    value={editTargetCount}
                    onChange={e => setEditTargetCount(e.target.value)}
                    className="w-20 px-2 py-1 bg-slate-900 border border-cyan-500 rounded text-xs font-mono text-white"
                  />
                  <button
                    onClick={handleSaveTarget}
                    className="p-1 bg-cyan-600 rounded text-white"
                  >
                    <Save className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsEditingTarget(false)}
                    className="p-1 bg-slate-700 rounded text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-3.5">
              <span className="text-xs text-slate-400">사이클 타임 (Tact)</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {line.tactTimeSec}
                </span>
                <span className="text-xs font-mono text-slate-400">초</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                목표 {line.targetTactTimeSec}초 · WIP {line.steps.reduce((a, b) => a + b.wipCount, 0)} EA
              </div>
            </div>
          </div>

          {/* Sub-process Steps Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>세부 공정 단계 및 설비 가동 지표</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">총 {line.steps.length}개 공정</span>
            </div>

            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">단계</th>
                      <th className="py-2.5 px-3">공정명</th>
                      <th className="py-2.5 px-3">설치 장비</th>
                      <th className="py-2.5 px-3 text-right">사이클 타임</th>
                      <th className="py-2.5 px-3 text-right">대기 재공(WIP)</th>
                      <th className="py-2.5 px-3 text-right">설비 가동률</th>
                      <th className="py-2.5 px-3 text-center">공정 상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {line.steps.map(step => (
                      <tr key={step.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-cyan-400">STEP {step.stepNumber}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">{step.name}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans">{step.equipmentName}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-200">
                          {step.cycleTimeSec}s <span className="text-slate-500 text-[10px]">({step.targetCycleTimeSec}s)</span>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-200">
                          {step.wipCount} EA
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-cyan-300">
                          {step.utilization}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                            step.status === 'bottleneck'
                              ? 'bg-rose-950 border border-rose-800 text-rose-300'
                              : step.status === 'busy'
                              ? 'bg-amber-950 border border-amber-800 text-amber-300'
                              : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          }`}>
                            {step.status === 'bottleneck' ? '병목 감지' : step.status === 'busy' ? '부하 높음' : '정상 가동'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sensor Telemetry & Defect Breakdown Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Real-time Sensors */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>설비 센서 텔레메트리 (IoT 실시간 수신)</span>
              </h5>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span>핵심 설비 온도</span>
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">
                    {line.sensors.temperatureC}°C
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    <span>모터 진동 가속도</span>
                  </div>
                  <div className={`text-lg font-bold tabular-nums ${line.sensors.vibrationMmS > 3.0 ? 'text-rose-400' : 'text-white'}`}>
                    {line.sensors.vibrationMmS} mm/s
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>라인 소비 전력</span>
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">
                    {line.sensors.powerKw} kW
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>공압 / RPM</span>
                  </div>
                  <div className="text-lg font-bold text-white tabular-nums">
                    {line.sensors.pressureMpa} MPa {line.sensors.rpm ? `/ ${line.sensors.rpm} RPM` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Defect Pareto Breakdown */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>현장 불량 유형 및 점유율</span>
                </h5>
                <button
                  onClick={() => onOpenDefectRegister(line.id)}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                >
                  <PlusCircle className="w-3 h-3" />
                  <span>+ 불량 등록</span>
                </button>
              </div>

              <div className="space-y-2">
                {line.defects.map(d => (
                  <div key={d.type} className="text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-sans text-slate-300">{d.type}</span>
                      <span className="text-slate-400">
                        {d.count} EA <span className="text-rose-400 font-bold ml-1">({d.percentage}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, d.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Line ID: {line.id} · 데이터 자동 동기화 활성화됨
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
