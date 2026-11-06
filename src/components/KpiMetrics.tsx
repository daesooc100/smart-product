import React from 'react';
import { useProduction } from '../context/ProductionContext';
import { Gauge, AlertOctagon, CheckCircle2, TrendingUp, Clock, Factory } from 'lucide-react';

export const KpiMetrics: React.FC = () => {
  const { lines } = useProduction();

  // Computations
  const totalTarget = lines.reduce((acc, l) => acc + l.targetCount, 0);
  const totalActual = lines.reduce((acc, l) => acc + l.actualCount, 0);
  const totalGood = lines.reduce((acc, l) => acc + l.goodCount, 0);
  const totalDefects = lines.reduce((acc, l) => acc + l.defectCount, 0);

  const avgOpRate = lines.length > 0
    ? (lines.reduce((acc, l) => acc + l.operationRate, 0) / lines.length).toFixed(1)
    : '0.0';

  const overallDefectRate = totalActual > 0
    ? ((totalDefects / totalActual) * 100).toFixed(2)
    : '0.00';

  const targetAchievementRate = totalTarget > 0
    ? ((totalActual / totalTarget) * 100).toFixed(1)
    : '0.0';

  const runningCount = lines.filter(l => l.status === 'running').length;
  const warningCount = lines.filter(l => l.status === 'warning').length;
  const stoppedCount = lines.filter(l => l.status === 'stopped' || l.status === 'maintenance').length;

  const avgTactTime = lines.length > 0
    ? (lines.reduce((acc, l) => acc + l.tactTimeSec, 0) / lines.length).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. 종합 가동률 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">5개 라인 평균 가동률</span>
          <Gauge className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {avgOpRate}
            </span>
            <span className="text-sm font-semibold text-cyan-400 font-mono">%</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <span>목표 기준</span>
            <span className="font-mono tabular-nums text-slate-200">91.2%</span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">(+0.4%p 달성)</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, Number(avgOpRate)))}%` }}
          />
        </div>
      </div>

      {/* 2. 종합 불량률 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">5개 라인 평균 불량률</span>
          <AlertOctagon className={`w-4 h-4 ${Number(overallDefectRate) > 1.5 ? 'text-amber-400' : 'text-emerald-400'}`} />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-mono tabular-nums ${
              Number(overallDefectRate) > 2.0 ? 'text-rose-400' : Number(overallDefectRate) > 1.5 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {overallDefectRate}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-mono">%</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <span>불량 건수</span>
            <span className="font-mono tabular-nums text-slate-200">{totalDefects} EA</span>
            <span className="text-slate-500 text-[11px]">(상한 1.50%)</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              Number(overallDefectRate) > 2.0 ? 'bg-rose-500' : Number(overallDefectRate) > 1.5 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, Number(overallDefectRate) * 20))}%` }}
          />
        </div>
      </div>

      {/* 3. 총 생산량 & 달성률 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">일일 총 생산량 (달성률)</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {totalActual.toLocaleString()}
            </span>
            <span className="text-sm font-mono text-slate-400">/ {totalTarget.toLocaleString()} EA</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <span>현재 달성률</span>
            <span className="font-mono tabular-nums text-emerald-400 font-semibold">{targetAchievementRate}%</span>
            <span className="text-slate-500 text-[11px]">(양품 {totalGood.toLocaleString()})</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, Number(targetAchievementRate)))}%` }}
          />
        </div>
      </div>

      {/* 4. 라인 가동 상태 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">5개 라인 가동 상태</span>
          <Factory className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {runningCount}
            </span>
            <span className="text-sm font-medium text-slate-400">/ 5 라인 가동</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
            <span className="text-emerald-400 font-medium">정상 {runningCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-medium">주의 {warningCount}</span>
            <span className="text-slate-600">·</span>
            <span className="text-rose-400 font-medium">정지 {stoppedCount}</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(runningCount / 5) * 100}%` }} />
          <div className="bg-amber-500 h-full transition-all" style={{ width: `${(warningCount / 5) * 100}%` }} />
          <div className="bg-rose-500 h-full transition-all" style={{ width: `${(stoppedCount / 5) * 100}%` }} />
        </div>
      </div>

      {/* 5. 평균 택트타임 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">평균 사이클 타임(Tact)</span>
          <Clock className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="my-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-white">
              {avgTactTime}
            </span>
            <span className="text-sm font-semibold text-cyan-400 font-mono">초/개</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
            <span>표준 목표</span>
            <span className="font-mono tabular-nums text-slate-200">36.4s</span>
            <span className="text-emerald-400 font-mono text-[11px] font-medium">(-0.8s 단축)</span>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, (36.4 / Number(avgTactTime)) * 80))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
