import React, { useState } from 'react';
import { useProduction } from '../context/ProductionContext';
import { X, AlertTriangle, AlertCircle, Info, Check, Trash2, Volume2, VolumeX } from 'lucide-react';

interface AlarmDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLine?: (lineId: string) => void;
}

export const AlarmDrawer: React.FC<AlarmDrawerProps> = ({
  isOpen,
  onClose,
  onSelectLine,
}) => {
  const { alarms, acknowledgeAlarm, clearAllAlarms, isMuted, toggleMute } = useProduction();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all');

  if (!isOpen) return null;

  const filteredAlarms = filterSeverity === 'all'
    ? alarms
    : alarms.filter(a => a.severity === filterSeverity);

  const unackCount = alarms.filter(a => !a.acknowledged).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>공정 이상 & 알람 로그</span>
                  {unackCount > 0 && (
                    <span className="bg-rose-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      미확인 {unackCount}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 font-mono">실시간 설비 이상 및 품질 경보</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title={isMuted ? '경보음 켜기' : '경보음 끄기'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Severity Filter & Clear Buttons */}
          <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 font-mono">
              <button
                onClick={() => setFilterSeverity('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterSeverity === 'all'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                전체({alarms.length})
              </button>
              <button
                onClick={() => setFilterSeverity('critical')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterSeverity === 'critical'
                    ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800'
                    : 'text-rose-400 hover:text-rose-300'
                }`}
              >
                위험
              </button>
              <button
                onClick={() => setFilterSeverity('warning')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  filterSeverity === 'warning'
                    ? 'bg-amber-950 text-amber-300 font-bold border border-amber-800'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                주의
              </button>
            </div>

            {alarms.length > 0 && (
              <button
                onClick={clearAllAlarms}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-400 transition-colors"
                title="모든 알람 삭제"
              >
                <Trash2 className="w-3 h-3" />
                <span>기록 비우기</span>
              </button>
            )}
          </div>

          {/* Alarm Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredAlarms.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-2">
                <Check className="w-8 h-8 mx-auto text-emerald-500/60" />
                <p className="text-xs">현재 조건에 해당하는 활성 경보가 없습니다.</p>
              </div>
            ) : (
              filteredAlarms.map(alarm => {
                const isCritical = alarm.severity === 'critical';
                const isWarning = alarm.severity === 'warning';

                return (
                  <div
                    key={alarm.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      alarm.acknowledged
                        ? 'bg-slate-900/60 border-slate-800 opacity-75'
                        : isCritical
                        ? 'bg-rose-950/30 border-rose-800/80 shadow-md shadow-rose-950/20'
                        : isWarning
                        ? 'bg-amber-950/30 border-amber-800/80'
                        : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {isCritical ? (
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        ) : isWarning ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        ) : (
                          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                        )}
                        <span className="font-mono text-xs font-bold text-cyan-400 px-1.5 py-0.2 rounded bg-slate-800 border border-slate-700">
                          {alarm.lineCode}
                        </span>
                        <h4 className="text-xs font-bold text-white tracking-tight">
                          {alarm.title}
                        </h4>
                      </div>

                      <span className="text-[10px] font-mono text-slate-500 shrink-0">
                        {alarm.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 pl-6 leading-relaxed">
                      {alarm.description}
                    </p>

                    <div className="mt-3 pl-6 flex items-center justify-between text-xs">
                      {onSelectLine ? (
                        <button
                          onClick={() => {
                            onSelectLine(alarm.lineId);
                            onClose();
                          }}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 font-mono"
                        >
                          라인 상세 보기 →
                        </button>
                      ) : <span />}

                      {!alarm.acknowledged ? (
                        <button
                          onClick={() => acknowledgeAlarm(alarm.id)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>확인 (ACK)</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-emerald-500 font-mono">
                          ✓ 조치 확인됨
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 text-center font-mono">
            PLC / SCADA 센서 통신 프로토콜 연동 중
          </div>
        </div>
      </div>
    </div>
  );
};
