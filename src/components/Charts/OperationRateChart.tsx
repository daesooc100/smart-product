import React, { useState } from 'react';
import { useProduction } from '../../context/ProductionContext';
import { ProductionLine } from '../../types/production';
import { BarChart3, LineChart as LineChartIcon, Info } from 'lucide-react';

interface OperationRateChartProps {
  onSelectLine?: (lineId: string) => void;
}

export const OperationRateChart: React.FC<OperationRateChartProps> = ({ onSelectLine }) => {
  const { lines } = useProduction();
  const [chartView, setChartView] = useState<'comparison' | 'trend'>('comparison');
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [hoveredHourIdx, setHoveredHourIdx] = useState<number | null>(null);

  // 5 lines color mapping
  const lineColors: Record<string, string> = {
    'line-1': '#06b6d4', // Cyan
    'line-2': '#f59e0b', // Amber (warning state)
    'line-3': '#10b981', // Emerald
    'line-4': '#6366f1', // Indigo
    'line-5': '#8b5cf6', // Violet
  };

  // Trend hours
  const hours = lines[0]?.hourlyData.map(d => d.hour) || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
      {/* Header with Segmented View Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              라인별 가동률 (Operation Rate)
            </h3>
            <span className="text-xs text-slate-400 font-mono">5개 라인 실시간 비교</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            목표 가동률 대비 실시간 달성률 및 시간대별 추이 분석
          </p>
        </div>

        {/* Segmented Control */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 self-start sm:self-auto">
          <button
            onClick={() => setChartView('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              chartView === 'comparison'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>실시간 비교</span>
          </button>
          <button
            onClick={() => setChartView('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              chartView === 'trend'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5" />
            <span>시간대별 추이</span>
          </button>
        </div>
      </div>

      {/* Main Chart Body */}
      <div className="py-4">
        {chartView === 'comparison' ? (
          /* 1. Real-time Comparison Bar Chart */
          <div className="space-y-4">
            {lines.map((line) => {
              const delta = Number((line.operationRate - line.targetOperationRate).toFixed(1));
              const isAhead = delta >= 0;
              const color = lineColors[line.id] || '#06b6d4';
              const isHovered = hoveredLineId === line.id;

              return (
                <div
                  key={line.id}
                  onClick={() => onSelectLine && onSelectLine(line.id)}
                  onMouseEnter={() => setHoveredLineId(line.id)}
                  onMouseLeave={() => setHoveredLineId(null)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-800/90 border-cyan-500/50 shadow-md'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Line title row */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="font-mono font-bold px-1.5 py-0.5 rounded text-[11px] text-white"
                        style={{ backgroundColor: color }}
                      >
                        {line.code}
                      </span>
                      <span className="font-semibold text-slate-200">{line.name}</span>
                      <span className="text-slate-500 hidden md:inline">· {line.category}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs text-slate-400 mr-1.5">목표 {line.targetOperationRate}%</span>
                        <span className="font-mono font-bold text-sm tabular-nums text-white">
                          {line.operationRate}%
                        </span>
                      </div>
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded ${
                          isAhead
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {isAhead ? `+${delta}%p` : `${delta}%p`}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar container */}
                  <div className="relative w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                    {/* Target benchmark indicator line (usually 90~94%) */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                      style={{ left: `${line.targetOperationRate}%` }}
                      title={`목표 기준선 (${line.targetOperationRate}%)`}
                    />

                    {/* Actual fill bar */}
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.min(100, Math.max(0, line.operationRate))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>

                  {/* Micro subtext */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 font-mono">
                    <span>
                      상태:{' '}
                      <span className={line.status === 'warning' ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                        {line.status === 'running' ? '정상 가동' : line.status === 'warning' ? '설비 주의' : '정지/점검'}
                      </span>
                    </span>
                    <span>
                      실적:{' '}
                      <span className="text-slate-200">
                        {line.actualCount.toLocaleString()} / {line.targetCount.toLocaleString()} EA
                      </span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. Hourly Trend Multi-Line Chart (SVG) */
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs">
              <div className="flex items-center gap-3">
                {lines.map(line => (
                  <button
                    key={line.id}
                    onClick={() => onSelectLine && onSelectLine(line.id)}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: lineColors[line.id] }}
                    />
                    <span className="font-mono font-medium">{line.code}</span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">가동률 기준선: 90% 점선</span>
            </div>

            {/* Responsive SVG Line Chart */}
            <div className="relative w-full h-64 bg-slate-950/60 rounded-lg p-2 border border-slate-800/80">
              <svg viewBox="0 0 600 220" className="w-full h-full overflow-visible">
                {/* Horizontal grid lines */}
                {[70, 80, 90, 100].map(val => {
                  const y = 200 - ((val - 70) / 30) * 180;
                  return (
                    <g key={val}>
                      <line
                        x1="40"
                        y1={y}
                        x2="590"
                        y2={y}
                        stroke={val === 90 ? '#f59e0b' : '#334155'}
                        strokeWidth={val === 90 ? '1.5' : '1'}
                        strokeDasharray={val === 90 ? '4 4' : undefined}
                        opacity={val === 90 ? 0.7 : 0.3}
                      />
                      <text
                        x="32"
                        y={y + 4}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {val}%
                      </text>
                    </g>
                  );
                })}

                {/* X Axis labels */}
                {hours.map((hour, idx) => {
                  const x = 50 + (idx / (hours.length - 1)) * 520;
                  return (
                    <text
                      key={hour}
                      x={x}
                      y="215"
                      fill="#94a3b8"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {hour}
                    </text>
                  );
                })}

                {/* Multi lines for 5 lines */}
                {lines.map(line => {
                  const color = lineColors[line.id] || '#06b6d4';
                  const points = line.hourlyData.map((pt, idx) => {
                    const x = 50 + (idx / (hours.length - 1)) * 520;
                    const y = 200 - ((pt.operationRate - 70) / 30) * 180;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <g key={line.id}>
                      <polyline
                        fill="none"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={points}
                        className="transition-all duration-300"
                        opacity={hoveredLineId && hoveredLineId !== line.id ? 0.25 : 1}
                      />
                      {line.hourlyData.map((pt, idx) => {
                        const x = 50 + (idx / (hours.length - 1)) * 520;
                        const y = 200 - ((pt.operationRate - 70) / 30) * 180;
                        const isPointHovered = hoveredHourIdx === idx;
                        return (
                          <circle
                            key={idx}
                            cx={x}
                            cy={y}
                            r={isPointHovered ? 5 : 3}
                            fill="#0f172a"
                            stroke={color}
                            strokeWidth="2"
                            className="cursor-pointer transition-all"
                            onMouseEnter={() => {
                              setHoveredLineId(line.id);
                              setHoveredHourIdx(idx);
                            }}
                            onMouseLeave={() => {
                              setHoveredLineId(null);
                              setHoveredHourIdx(null);
                            }}
                          />
                        );
                      })}
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip display if hour is hovered */}
              {hoveredHourIdx !== null && (
                <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700 rounded-lg p-2.5 text-xs shadow-xl backdrop-blur-sm pointer-events-none z-20">
                  <div className="font-mono font-semibold text-slate-300 border-b border-slate-800 pb-1 mb-1.5">
                    {hours[hoveredHourIdx]} 시간대 가동률
                  </div>
                  <div className="space-y-1">
                    {lines.map(l => (
                      <div key={l.id} className="flex items-center justify-between gap-3 text-[11px]">
                        <span className="font-medium text-slate-300 flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: lineColors[l.id] }}
                          />
                          {l.code} ({l.name.substring(0, 7)})
                        </span>
                        <span className="font-mono font-bold text-white tabular-nums">
                          {l.hourlyData[hoveredHourIdx]?.operationRate}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info strip */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>기준 목표: 전 라인 평균 91.2% 이상 가동 유지 기준</span>
        </div>
        <span className="text-slate-500 font-mono text-[11px]">각 라인 클릭 시 상세 공정 분석</span>
      </div>
    </div>
  );
};
