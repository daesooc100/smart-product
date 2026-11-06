import React, { useState } from 'react';
import { ProductionProvider, useProduction } from './context/ProductionContext';
import { Header } from './components/Header';
import { KpiMetrics } from './components/KpiMetrics';
import { OperationRateChart } from './components/Charts/OperationRateChart';
import { DefectRateChart } from './components/Charts/DefectRateChart';
import { LineCard } from './components/LineCard';
import { ProcessFlowGrid } from './components/ProcessFlowGrid';
import { QualityAnalysisView } from './components/QualityAnalysisView';
import { TelemetryView } from './components/TelemetryView';
import { LineDetailModal } from './components/LineDetailModal';
import { DefectRegisterModal } from './components/DefectRegisterModal';
import { ReportExportModal } from './components/ReportExportModal';
import { AlarmDrawer } from './components/AlarmDrawer';
import { AlertTriangle, Filter, ArrowUpRight } from 'lucide-react';

function DashboardContent() {
  const {
    lines,
    activeTab,
    setActiveTab,
    alarms,
    shift,
    setShift,
  } = useProduction();

  const [selectedLineForDetail, setSelectedLineForDetail] = useState<string | null>(null);
  const [selectedLineForDefect, setSelectedLineForDefect] = useState<string | null>(null);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAlarmDrawerOpen, setIsAlarmDrawerOpen] = useState<boolean>(false);

  const activeCriticalAlarms = alarms.filter(a => !a.acknowledged && (a.severity === 'critical' || a.severity === 'warning'));

  const handleOpenDefect = (lineId?: string) => {
    setSelectedLineForDefect(lineId || null);
    setIsDefectModalOpen(true);
  };

  const handleOpenDetail = (lineId: string) => {
    setSelectedLineForDetail(lineId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        onOpenDefectModal={() => handleOpenDefect()}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onOpenAlarmDrawer={() => setIsAlarmDrawerOpen(true)}
      />

      {/* Critical Alarm Banner if unacknowledged alarms exist */}
      {activeCriticalAlarms.length > 0 && (
        <div className="bg-amber-950/70 border-b border-amber-800/80 px-4 sm:px-6 lg:px-8 py-2 text-xs flex items-center justify-between text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
            <span className="font-semibold font-mono text-amber-300">
              [{activeCriticalAlarms[0].lineCode}] {activeCriticalAlarms[0].title}:
            </span>
            <span className="truncate max-w-xl">{activeCriticalAlarms[0].description}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAlarmDrawerOpen(true)}
              className="text-xs font-mono font-bold text-amber-300 hover:text-white underline underline-offset-2 ml-2"
            >
              알람 센터 열기 ({activeCriticalAlarms.length}건) →
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Operational KPI Cards */}
        <KpiMetrics />

        {/* View Tab Routing */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 2 Core Intuitive Charts Requested by User (가동률 & 불량률 직관적 차트) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OperationRateChart onSelectLine={handleOpenDetail} />
              <DefectRateChart
                onSelectLine={handleOpenDetail}
                onOpenDefectRegister={() => handleOpenDefect()}
              />
            </div>

            {/* 5 Production Lines Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>대상 5개 라인 실시간 공정 현황</span>
                  <span className="text-xs font-mono text-cyan-400">L01 ~ L05</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  각 라인별 가동률, 불량률, 공정 진행 단계 및 설비 상태를 실시간으로 제어합니다.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('flow')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                >
                  <span>공정 흐름도로 보기</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* 5 Line Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {lines.map(line => (
                <LineCard
                  key={line.id}
                  line={line}
                  onOpenDetail={handleOpenDetail}
                  onOpenDefectRegister={handleOpenDefect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: 5 Lines Detail View */}
        {activeTab === 'lines' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  5개 라인별 상세 제어 및 공정 현황
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  라인별 가동/정지/점검 상태 변경, 불량 현장 등록 및 사이클 타임을 조정합니다.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lines.map(line => (
                <LineCard
                  key={line.id}
                  line={line}
                  onOpenDetail={handleOpenDetail}
                  onOpenDefectRegister={handleOpenDefect}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Process Flow */}
        {activeTab === 'flow' && (
          <ProcessFlowGrid onOpenLineDetail={handleOpenDetail} />
        )}

        {/* Tab 4: Quality & Defects */}
        {activeTab === 'quality' && (
          <QualityAnalysisView
            onOpenDefectRegister={handleOpenDefect}
            onOpenLineDetail={handleOpenDetail}
          />
        )}

        {/* Tab 5: Equipment Telemetry */}
        {activeTab === 'telemetry' && (
          <TelemetryView />
        )}
      </main>

      {/* Modals & Slide-over Drawers */}
      <LineDetailModal
        lineId={selectedLineForDetail}
        onClose={() => setSelectedLineForDetail(null)}
        onOpenDefectRegister={(lid) => {
          setSelectedLineForDetail(null);
          handleOpenDefect(lid);
        }}
      />

      {isDefectModalOpen && (
        <DefectRegisterModal
          initialLineId={selectedLineForDefect}
          onClose={() => {
            setIsDefectModalOpen(false);
            setSelectedLineForDefect(null);
          }}
        />
      )}

      {isReportModalOpen && (
        <ReportExportModal
          onClose={() => setIsReportModalOpen(false)}
        />
      )}

      <AlarmDrawer
        isOpen={isAlarmDrawerOpen}
        onClose={() => setIsAlarmDrawerOpen(false)}
        onSelectLine={handleOpenDetail}
      />
    </div>
  );
}

export default function App() {
  return (
    <ProductionProvider>
      <DashboardContent />
    </ProductionProvider>
  );
}
