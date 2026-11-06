import React from 'react';
import { useProduction } from '../context/ProductionContext';
import { ViewTab } from '../types/production';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  AlertTriangle, 
  FileDown, 
  PlusCircle, 
  RotateCcw,
  Activity,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onOpenDefectModal: () => void;
  onOpenReportModal: () => void;
  onOpenAlarmDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenDefectModal,
  onOpenReportModal,
  onOpenAlarmDrawer,
}) => {
  const {
    activeTab,
    setActiveTab,
    isLive,
    toggleLive,
    updateSpeedMs,
    setUpdateSpeedMs,
    isMuted,
    toggleMute,
    alarms,
    triggerSimulatedAnomaly,
    resetSimulation,
    lastUpdated,
  } = useProduction();

  const unackAlarmsCount = alarms.filter(a => !a.acknowledged).length;

  const navLinks: { id: ViewTab; label: string }[] = [
    { id: 'overview', label: '종합 대시보드' },
    { id: 'lines', label: '5개 라인 상세' },
    { id: 'flow', label: '공정 흐름도' },
    { id: 'quality', label: '품질·불량 분석' },
    { id: 'telemetry', label: '설비 센서 모니터링' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-colors">
      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Clean Nav Links) - Zone 3 (1 Primary Action Group) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center text-white shadow-sm shadow-cyan-900/40">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              SMART MES
            </div>
            <div className="text-[11px] text-slate-400 whitespace-nowrap">
              5개 라인 공정 모니터링 시스템
            </div>
          </div>
        </div>

        {/* Zone 2: 4-5 Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 relative py-2 ${
                  isActive
                    ? 'text-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live streaming status toggle */}
          <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700">
            <button
              onClick={toggleLive}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                isLive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-700 text-slate-300'
              }`}
              title={isLive ? '실시간 데이터 수신 일시정지' : '실시간 데이터 수신 재개'}
            >
              {isLive ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              <span className="tabular-nums font-mono text-[11px]">{isLive ? '실시간 ON' : '정지됨'}</span>
            </button>

            {/* Speed select */}
            <select
              value={updateSpeedMs}
              onChange={e => setUpdateSpeedMs(Number(e.target.value))}
              className="bg-transparent text-[11px] font-mono text-slate-300 px-1.5 py-1 focus:outline-none cursor-pointer"
              title="데이터 갱신 주기"
            >
              <option value={1000} className="bg-slate-800 text-slate-200">1초</option>
              <option value={3000} className="bg-slate-800 text-slate-200">3초</option>
              <option value={5000} className="bg-slate-800 text-slate-200">5초</option>
            </select>
          </div>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-700/80 transition-colors ${
              !isMuted ? 'text-cyan-400' : ''
            }`}
            title={isMuted ? '경보음 켜기' : '경보음 음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Alarm bell button */}
          <button
            onClick={onOpenAlarmDrawer}
            className="relative p-2 rounded-lg text-slate-300 hover:text-white bg-slate-800/60 border border-slate-700/80 transition-colors"
            title="실시간 알람 및 경보 로그"
          >
            <AlertTriangle className={`w-4 h-4 ${unackAlarmsCount > 0 ? 'text-amber-400' : 'text-slate-400'}`} />
            {unackAlarmsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unackAlarmsCount}
              </span>
            )}
          </button>

          {/* Defect Quick Register Button */}
          <button
            onClick={onOpenDefectModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>불량 등록</span>
          </button>

          {/* Report Button */}
          <button
            onClick={onOpenReportModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all whitespace-nowrap"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>리포트</span>
          </button>
        </div>
      </div>

      {/* Sub-toolbar for mobile navigation & real-time telemetry info */}
      <div className="lg:hidden border-t border-slate-800 px-4 py-2 flex items-center justify-between overflow-x-auto gap-2 bg-slate-900">
        <div className="flex items-center gap-2">
          {navLinks.map(link => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`px-2.5 py-1 text-xs whitespace-nowrap rounded-md ${
                activeTab === link.id
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="border-t border-slate-800/80 bg-slate-950/70 px-4 sm:px-6 lg:px-8 py-1.5 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            공정 대상: 총 5개 라인 가동
          </span>
          <span className="text-slate-600">/</span>
          <span>주간 1조 (08:00 - 17:00)</span>
          <span className="text-slate-600">/</span>
          <span className="font-mono tabular-nums text-slate-300">
            수신시각 {lastUpdated.toLocaleTimeString('ko-KR', { hour12: false })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerSimulatedAnomaly('line-2')}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
            title="Line 2 스핀들 진동 및 불량 급증 시뮬레이션 발생"
          >
            시뮬레이션: L02 이상 발생
          </button>
          <span className="text-slate-600">/</span>
          <button
            onClick={resetSimulation}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
            title="기본값으로 데이터 초기화"
          >
            <RotateCcw className="w-3 h-3" />
            <span>초기화</span>
          </button>
        </div>
      </div>
    </header>
  );
};
