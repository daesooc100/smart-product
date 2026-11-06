import React, { useState } from 'react';
import { useProduction } from '../context/ProductionContext';
import { DefectRateChart } from './Charts/DefectRateChart';
import { ShieldAlert, AlertCircle, CheckCircle2, PlusCircle, Wrench, FileSpreadsheet } from 'lucide-react';

interface QualityAnalysisViewProps {
  onOpenDefectRegister: (lineId?: string) => void;
  onOpenLineDetail: (lineId: string) => void;
}

export const QualityAnalysisView: React.FC<QualityAnalysisViewProps> = ({
  onOpenDefectRegister,
  onOpenLineDetail,
}) => {
  const { lines } = useProduction();

  // Root cause corrective actions database
  const correctiveActionGuide = [
    {
      defect: '치수 공차 초과 (L02 CNC)',
      cause: '엔드밀 공구 마모 및 스핀들 열변위',
      action: '3호기 툴체인지(공구 교체) 및 절삭유 유량 5.5L/min 증대',
      status: '진행중',
      responsible: '이성민 수석',
    },
    {
      defect: '스크류 체결 토크 미달 (L04 시스템 조립)',
      cause: '전동 드라이버 토크 센서 영점 틀어짐',
      action: '스마트 토크 렌치 1.45 N·m 재교정 및 교체 완료',
      status: '완료',
      responsible: '정동욱 선임',
    },
    {
      defect: '솔더 브릿지 쇼트 (L01 SMT)',
      cause: '메탈마스크 스텐실 개구부 솔더 크림 과도 도포',
      action: '스퀴지 압력 2.4kgf 조정 및 마스크 자동 세척 주기 단축',
      status: '완료',
      responsible: '김태환 책임',
    },
    {
      defect: 'RF 무선 수신감도 미달 (L05 기능검사)',
      cause: '안테나 체결 단자 접촉 저항 상승',
      action: '안테나 FPCB 압착 지그 압력 점검 및 세정제 교체',
      status: '모니터링중',
      responsible: '최유림 주임',
    },
  ];

  const totalDefects = lines.reduce((acc, l) => acc + l.defectCount, 0);
  const totalActual = lines.reduce((acc, l) => acc + l.actualCount, 0);
  const totalGood = lines.reduce((acc, l) => acc + l.goodCount, 0);

  return (
    <div className="space-y-6">
      {/* Top Quality Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>공정 품질 및 불량률 종합 분석 (Quality Control)</span>
            <span className="text-xs font-mono text-rose-400 font-semibold">관리 상한선 2.0%</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            5개 라인의 불량률 추이, 파레토 80/20 원인 분석, 시정 조치 현황을 관리합니다.
          </p>
        </div>

        <button
          onClick={() => onOpenDefectRegister()}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>신규 불량 등록</span>
        </button>
      </div>

      {/* Main Charts: Defect Rate & Pareto */}
      <DefectRateChart
        onSelectLine={onOpenLineDetail}
        onOpenDefectRegister={() => onOpenDefectRegister()}
      />

      {/* 5 Lines Quality Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {lines.map(line => {
          const isOver = line.defectRate > line.targetDefectRate;
          return (
            <div
              key={line.id}
              onClick={() => onOpenLineDetail(line.id)}
              className={`bg-slate-900 border rounded-xl p-4 cursor-pointer hover:border-slate-700 transition-all ${
                isOver ? 'border-rose-600/60 shadow-sm shadow-rose-950/30' : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400">
                  {line.code}
                </span>
                <span className={`text-[11px] font-mono font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isOver ? '상한 초과' : '양호'}
                </span>
              </div>

              <div className="text-xs font-semibold text-white truncate mb-2">
                {line.name}
              </div>

              <div className="text-2xl font-bold font-mono tabular-nums mb-1">
                <span className={isOver ? 'text-rose-400' : 'text-emerald-400'}>
                  {line.defectRate}%
                </span>
              </div>

              <div className="text-[11px] text-slate-400 font-mono space-y-0.5 border-t border-slate-800 pt-2">
                <div className="flex justify-between">
                  <span>불량 건수</span>
                  <span className="text-slate-200 font-semibold">{line.defectCount} EA</span>
                </div>
                <div className="flex justify-between">
                  <span>양품 수량</span>
                  <span className="text-slate-200">{line.goodCount.toLocaleString()} EA</span>
                </div>
                <div className="flex justify-between">
                  <span>관리 상한</span>
                  <span className="text-slate-500">{line.targetDefectRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quality Corrective Action Tracking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white tracking-tight">
              품질 이상 원인 분석 및 현장 시정 조치 이력 (CAPA)
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            총 4건 조치 이력 관리
          </span>
        </div>

        <div className="border border-slate-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-2.5 px-3">발생 불량 항목</th>
                  <th className="py-2.5 px-3">추정 원인</th>
                  <th className="py-2.5 px-3">현장 시정 조치 내용</th>
                  <th className="py-2.5 px-3">담당자</th>
                  <th className="py-2.5 px-3 text-center">조치 상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {correctiveActionGuide.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-rose-300">{item.defect}</td>
                    <td className="py-3 px-3 text-slate-300">{item.cause}</td>
                    <td className="py-3 px-3 text-slate-200 font-medium">{item.action}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">{item.responsible}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        item.status === '완료'
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-400'
                          : item.status === '진행중'
                          ? 'bg-rose-950 border border-rose-800 text-rose-300'
                          : 'bg-amber-950 border border-amber-800 text-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
