import React from 'react';
import { ProductionLine, LineStatus } from '../types/production';
import { useProduction } from '../context/ProductionContext';
import { 
  CheckCircle, 
  AlertTriangle, 
  PauseCircle, 
  Wrench, 
  Clock, 
  Layers, 
  User, 
  ExternalLink,
  PlusCircle,
  MoreVertical
} from 'lucide-react';

interface LineCardProps {
  line: ProductionLine;
  onOpenDetail: (lineId: string) => void;
  onOpenDefectRegister: (lineId: string) => void;
}

export const LineCard: React.FC<LineCardProps> = ({
  line,
  onOpenDetail,
  onOpenDefectRegister,
}) => {
  const { updateLineStatus } = useProduction();

  const getStatusBadge = (status: LineStatus) => {
    switch (status) {
      case 'running':
        return {
          bg: 'bg-emerald-950/60 border-emerald-800 text-emerald-400',
          icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
          label: '정상 가동',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/60 border-amber-800 text-amber-400',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
          label: '공정 주의',
        };
      case 'stopped':
        return {
          bg: 'bg-rose-950/60 border-rose-800 text-rose-400',
          icon: <PauseCircle className="w-3.5 h-3.5 text-rose-400" />,
          label: '설비 정지',
        };
      case 'maintenance':
        return {
          bg: 'bg-blue-950/60 border-blue-800 text-blue-400',
          icon: <Wrench className="w-3.5 h-3.5 text-blue-400" />,
          label: '계획 점검',
        };
    }
  };

  const statusInfo = getStatusBadge(line.status);
  const achievementRate = Number(((line.actualCount / Math.max(1, line.targetCount)) * 100).toFixed(1));
  const isOpRateAhead = line.operationRate >= line.targetOperationRate;
  const isDefectOver = line.defectRate > line.targetDefectRate;

  // Total WIP across steps
  const totalWip = line.steps.reduce((acc, s) => acc + s.wipCount, 0);

  return (
    <div className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 ${
      line.status === 'warning'
        ? 'border-amber-600/60 hover:border-amber-500 shadow-md shadow-amber-950/30'
        : line.status === 'stopped'
        ? 'border-rose-600/60 hover:border-rose-500 shadow-md shadow-rose-950/30'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Top Section: Line Code, Name, Status, and Controls */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
              {line.code}
            </span>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                {line.name}
              </h4>
              <p className="text-[11px] text-slate-400">{line.category}</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium font-mono ${statusInfo.bg}`}>
            {statusInfo.icon}
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Status Alert Message if any */}
        <div className="text-xs text-slate-300 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/80 mb-4 flex items-center justify-between">
          <span className="truncate pr-2">{line.statusMessage}</span>
          <span className="text-[11px] font-mono text-slate-500 shrink-0">{line.currentLot}</span>
        </div>

        {/* 2 Primary Metrics: 가동률 & 불량률 Side-by-side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* 가동률 Meter */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>실시간 가동률</span>
              <span className="font-mono text-[11px]">목표 {line.targetOperationRate}%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono tabular-nums ${
                isOpRateAhead ? 'text-cyan-400' : 'text-amber-400'
              }`}>
                {line.operationRate}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOpRateAhead ? 'bg-cyan-500' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, line.operationRate))}%` }}
              />
            </div>
          </div>

          {/* 불량률 Meter */}
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>실시간 불량률</span>
              <span className="font-mono text-[11px]">상한 {line.targetDefectRate}%</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl font-bold font-mono tabular-nums ${
                isDefectOver ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {line.defectRate}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isDefectOver ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, (line.defectRate / 4.0) * 100))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Production Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">생산 실적 (달성률)</span>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-white font-bold tabular-nums">{line.actualCount.toLocaleString()}</span>
              <span className="text-slate-500">/</span>
              <span className="text-slate-400 tabular-nums">{line.targetCount.toLocaleString()} EA</span>
              <span className="text-emerald-400 font-bold ml-1">({achievementRate}%)</span>
            </div>
          </div>
          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, achievementRate))}%` }}
            />
          </div>
        </div>

        {/* Operational Telemetry Highlights: Tact time & WIP */}
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 mb-4 font-mono">
          <div>
            <div className="text-[10px] text-slate-500">택트타임</div>
            <div className="text-slate-200 font-semibold">{line.tactTimeSec}s <span className="text-[10px] text-slate-500">({line.targetTactTimeSec}s)</span></div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">재공품(WIP)</div>
            <div className="text-slate-200 font-semibold">{totalWip} EA</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500">작업자/반장</div>
            <div className="text-slate-200 font-semibold truncate">{line.operatorCount}명 · {line.managerName.split(' ')[0]}</div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {/* Status quick switch dropdown */}
        <select
          value={line.status}
          onChange={(e) => updateLineStatus(line.id, e.target.value as LineStatus)}
          className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="running">가동 재개 (Running)</option>
          <option value="warning">주의 전환 (Warning)</option>
          <option value="stopped">설비 정지 (Stop)</option>
          <option value="maintenance">점검 상태 (Maint)</option>
        </select>

        <div className="flex items-center gap-2">
          {/* Quick Defect Add */}
          <button
            onClick={() => onOpenDefectRegister(line.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors"
            title="이 라인에 불량 즉시 등록"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>불량 등록</span>
          </button>

          {/* Deep-dive Detail Button */}
          <button
            onClick={() => onOpenDetail(line.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <span>상세 공정</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
