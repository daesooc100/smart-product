import React, { useState } from 'react';
import { useProduction } from '../../context/ProductionContext';
import { AlertCircle, BarChart2, PieChart, ShieldAlert } from 'lucide-react';

interface DefectRateChartProps {
  onSelectLine?: (lineId: string) => void;
  onOpenDefectRegister?: () => void;
}

export const DefectRateChart: React.FC<DefectRateChartProps> = ({
  onSelectLine,
  onOpenDefectRegister,
}) => {
  const { lines } = useProduction();
  const [defectTab, setDefectTab] = useState<'comparison' | 'pareto'>('comparison');
  const [selectedLineForPareto, setSelectedLineForPareto] = useState<string>('all');

  // Aggregated defects across all lines or selected line
  const activeDefectList = React.useMemo(() => {
    if (selectedLineForPareto === 'all') {
      const typeMap: Record<string, { count: number; category: string }> = {};
      lines.forEach(l => {
        l.defects.forEach(d => {
          if (!typeMap[d.type]) {
            typeMap[d.type] = { count: 0, category: d.category };
          }
          typeMap[d.type].count += d.count;
        });
      });

      const total = Object.values(typeMap).reduce((acc, curr) => acc + curr.count, 0);
      const sorted = Object.entries(typeMap)
        .map(([type, data]) => ({
          type,
          count: data.count,
          category: data.category,
          percentage: Number(((data.count / Math.max(1, total)) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.count - a.count);

      // Compute cumulative %
      let cum = 0;
      return sorted.map(item => {
        cum += item.percentage;
        return {
          ...item,
          cumulative: Math.min(100, Number(cum.toFixed(1))),
        };
      });
    } else {
      const line = lines.find(l => l.id === selectedLineForPareto) || lines[0];
      const total = line.defects.reduce((acc, d) => acc + d.count, 0);
      let cum = 0;
      return line.defects.map(d => {
        cum += d.percentage;
        return {
          ...d,
          cumulative: Math.min(100, Number(cum.toFixed(1))),
        };
      });
    }
  }, [lines, selectedLineForPareto]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
      {/* Header with Segmented View Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              라인별 불량률 (Defect Rate) & 파레토 분석
            </h3>
            <span className="text-xs text-rose-400 font-mono font-medium">관리 상한선 2.0%</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            5개 라인의 실시간 불량률 비교 및 주요 원인별 파레토(80/20) 분석
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setDefectTab('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              defectTab === 'comparison'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>불량률 비교</span>
          </button>
          <button
            onClick={() => setDefectTab('pareto')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              defectTab === 'pareto'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>파레토 분석</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-4">
        {defectTab === 'comparison' ? (
          /* 1. 5 Lines Defect Rate Comparison Chart */
          <div className="space-y-4">
            {lines.map((line) => {
              const isOverLimit = line.defectRate > line.targetDefectRate;
              const barColor = isOverLimit ? '#f43f5e' : line.defectRate > 1.2 ? '#f59e0b' : '#10b981';

              return (
                <div
                  key={line.id}
                  onClick={() => onSelectLine && onSelectLine(line.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isOverLimit
                      ? 'bg-rose-950/20 border-rose-800/60 hover:border-rose-600/80'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold px-1.5 py-0.5 rounded text-[11px] bg-slate-800 border border-slate-700 text-slate-200">
                        {line.code}
                      </span>
                      <span className="font-semibold text-slate-200">{line.name}</span>
                      {isOverLimit && (
                        <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold font-mono">
                          <AlertCircle className="w-3 h-3" />
                          관리 상한 초과!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 mr-2">
                          불량 {line.defectCount}EA / 목표상한 {line.targetDefectRate}%
                        </span>
                        <span
                          className={`font-mono font-bold text-sm tabular-nums ${
                            isOverLimit ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          {line.defectRate}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar with 2.0% / Target Reference Marker */}
                  <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    {/* Management upper limit line (2.0%) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10"
                      style={{ left: `${(line.targetDefectRate / 4.0) * 100}%` }}
                      title={`불량률 관리 상한선 (${line.targetDefectRate}%)`}
                    />

                    {/* Defect Bar (scaled to max 4.0% for good dynamic visual range) */}
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(2, (line.defectRate / 4.0) * 100))}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>

                  {/* Pareto top defect teaser */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                    <span className="truncate max-w-[280px]">
                      최다 발생 불량: <span className="text-slate-300 font-medium">{line.defects[0]?.type || '이상 없음'}</span>
                    </span>
                    <span className="font-mono text-slate-400">
                      양품률 {(100 - line.defectRate).toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. Pareto Chart (Bars + Cumulative 80% line) */
          <div>
            {/* Filter by Line for Pareto */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
                <button
                  onClick={() => setSelectedLineForPareto('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedLineForPareto === 'all'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  전체 라인 종합
                </button>
                {lines.map(l => (
                  <button
                    key={l.id}
                    onClick={() => setSelectedLineForPareto(l.id)}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                      selectedLineForPareto === l.id
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {l.code}
                  </button>
                ))}
              </div>

              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                파레토 80% 핵심 관리선
              </span>
            </div>

            {/* SVG Pareto Chart */}
            <div className="relative w-full h-64 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
              <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                {/* 80% Cumulative Reference Line */}
                <line
                  x1="45"
                  y1={200 - (80 / 100) * 170}
                  x2="555"
                  y2={200 - (80 / 100) * 170}
                  stroke="#f43f5e"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity={0.8}
                />
                <text
                  x="560"
                  y={200 - (80 / 100) * 170 + 4}
                  fill="#f43f5e"
                  fontSize="9"
                  fontFamily="monospace"
                  textAnchor="start"
                >
                  80% 한계선
                </text>

                {/* Y Axis Left: Count */}
                <text x="35" y="25" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">
                  건수
                </text>
                {/* Y Axis Right: Cumulative % */}
                <text x="560" y="25" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="start">
                  누적%
                </text>

                {/* Bars for individual defect count */}
                {activeDefectList.slice(0, 6).map((item, idx) => {
                  const maxCount = Math.max(...activeDefectList.map(d => d.count), 10);
                  const totalBars = Math.min(activeDefectList.length, 6);
                  const barWidth = 42;
                  const x = 60 + idx * ((520 - 60) / Math.max(1, totalBars));
                  const barHeight = (item.count / maxCount) * 150;
                  const y = 195 - barHeight;

                  return (
                    <g key={item.type}>
                      {/* Bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="3"
                        fill="#f43f5e"
                        opacity={0.85}
                        className="hover:opacity-100 transition-all cursor-pointer"
                      >
                        <title>{`${item.type}: ${item.count}건 (${item.percentage}%)`}</title>
                      </rect>
                      {/* Bar Count Label */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        fill="#cbd5e1"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {item.count}
                      </text>
                      {/* X label (truncated defect name) */}
                      <text
                        x={x + barWidth / 2}
                        y="212"
                        fill="#94a3b8"
                        fontSize="9"
                        textAnchor="middle"
                      >
                        {item.type.length > 7 ? item.type.substring(0, 6) + '..' : item.type}
                      </text>
                    </g>
                  );
                })}

                {/* Polyline for cumulative percentage */}
                {activeDefectList.length > 0 && (
                  <>
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={activeDefectList.slice(0, 6).map((item, idx) => {
                        const totalBars = Math.min(activeDefectList.length, 6);
                        const barWidth = 42;
                        const x = 60 + idx * ((520 - 60) / Math.max(1, totalBars)) + barWidth / 2;
                        const y = 195 - (item.cumulative / 100) * 165;
                        return `${x},${y}`;
                      }).join(' ')}
                    />

                    {/* Circles on cumulative points */}
                    {activeDefectList.slice(0, 6).map((item, idx) => {
                      const totalBars = Math.min(activeDefectList.length, 6);
                      const barWidth = 42;
                      const x = 60 + idx * ((520 - 60) / Math.max(1, totalBars)) + barWidth / 2;
                      const y = 195 - (item.cumulative / 100) * 165;
                      return (
                        <g key={idx}>
                          <circle
                            cx={x}
                            cy={y}
                            r="3.5"
                            fill="#0f172a"
                            stroke="#38bdf8"
                            strokeWidth="2"
                          />
                          <text
                            x={x}
                            y={y - 8}
                            fill="#38bdf8"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {item.cumulative}%
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Footer warning & action */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>공정 품질 관리: 불량률 2.0% 초과 라인은 설비 점검 및 툴체인지 즉시 지시</span>
        </div>
        {onOpenDefectRegister && (
          <button
            onClick={onOpenDefectRegister}
            className="text-xs text-rose-400 hover:text-rose-300 font-medium underline underline-offset-2"
          >
            + 현장 불량 추가
          </button>
        )}
      </div>
    </div>
  );
};
