import React from 'react';
import { useProduction } from '../context/ProductionContext';
import { X, FileDown, Printer, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportExportModalProps {
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ onClose }) => {
  const { lines, lastUpdated } = useProduction();

  const totalTarget = lines.reduce((acc, l) => acc + l.targetCount, 0);
  const totalActual = lines.reduce((acc, l) => acc + l.actualCount, 0);
  const totalGood = lines.reduce((acc, l) => acc + l.goodCount, 0);
  const totalDefect = lines.reduce((acc, l) => acc + l.defectCount, 0);
  const avgOpRate = (lines.reduce((acc, l) => acc + l.operationRate, 0) / lines.length).toFixed(2);
  const avgDefectRate = ((totalDefect / Math.max(1, totalActual)) * 100).toFixed(2);
  const achievementRate = ((totalActual / Math.max(1, totalTarget)) * 100).toFixed(1);

  // Generate CSV and trigger browser download
  const handleDownloadCsv = () => {
    const headers = [
      '라인코드',
      '라인명칭',
      '공정구분',
      '작업로트',
      '목표수량(EA)',
      '생산수량(EA)',
      '양품수량(EA)',
      '불량수량(EA)',
      '가동률(%)',
      '목표가동률(%)',
      '불량률(%)',
      '관리불량률(%)',
      '택트타임(초)',
      '담당자',
      '상태',
    ];

    const rows = lines.map(line => [
      line.code,
      `"${line.name}"`,
      `"${line.category}"`,
      line.currentLot,
      line.targetCount,
      line.actualCount,
      line.goodCount,
      line.defectCount,
      line.operationRate,
      line.targetOperationRate,
      line.defectRate,
      line.targetDefectRate,
      line.tactTimeSec,
      `"${line.managerName}"`,
      line.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MES_라인별_생산모니터링_보고서_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                일일 5개 라인 생산 실적 및 품질 보고서
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                보고서 생성일시: {lastUpdated.toLocaleString('ko-KR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>인쇄</span>
            </button>
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>CSV 내보내기</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 space-y-6 print:p-0 print:bg-white print:text-black">
          {/* Executive Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl print:border-gray-300 print:bg-gray-50">
              <div className="text-xs text-slate-400 print:text-gray-600">총 생산 달성률</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 print:text-emerald-700 mt-1">
                {achievementRate}%
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-500 font-mono mt-0.5">
                {totalActual.toLocaleString()} / {totalTarget.toLocaleString()} EA
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl print:border-gray-300 print:bg-gray-50">
              <div className="text-xs text-slate-400 print:text-gray-600">평균 가동률</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 print:text-cyan-700 mt-1">
                {avgOpRate}%
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-500 font-mono mt-0.5">
                기준 목표 91.20% (+{(Number(avgOpRate) - 91.2).toFixed(2)}%p)
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl print:border-gray-300 print:bg-gray-50">
              <div className="text-xs text-slate-400 print:text-gray-600">평균 불량률</div>
              <div className="text-2xl font-bold font-mono text-rose-400 print:text-rose-700 mt-1">
                {avgDefectRate}%
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-500 font-mono mt-0.5">
                불량 {totalDefect} EA (양품률 {(100 - Number(avgDefectRate)).toFixed(2)}%)
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl print:border-gray-300 print:bg-gray-50">
              <div className="text-xs text-slate-400 print:text-gray-600">양품 생산수량</div>
              <div className="text-2xl font-bold font-mono text-white print:text-black mt-1">
                {totalGood.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 print:text-gray-500 font-mono mt-0.5">
                5개 라인 정상 출하 대기
              </div>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            <h4 className="text-sm font-bold text-white print:text-black mb-3">
              5개 라인별 세부 실적 집계표
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden print:border-gray-300">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 print:bg-gray-100 print:text-gray-700 border-b border-slate-800 print:border-gray-300 font-mono">
                  <tr>
                    <th className="py-2.5 px-3">코드</th>
                    <th className="py-2.5 px-3">라인명</th>
                    <th className="py-2.5 px-3 text-right">목표</th>
                    <th className="py-2.5 px-3 text-right">실적</th>
                    <th className="py-2.5 px-3 text-right">양품</th>
                    <th className="py-2.5 px-3 text-right">불량</th>
                    <th className="py-2.5 px-3 text-right">달성률</th>
                    <th className="py-2.5 px-3 text-right">가동률</th>
                    <th className="py-2.5 px-3 text-right">불량률</th>
                    <th className="py-2.5 px-3 text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 print:divide-gray-200 font-mono">
                  {lines.map(line => {
                    const ach = ((line.actualCount / Math.max(1, line.targetCount)) * 100).toFixed(1);
                    return (
                      <tr key={line.id} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                        <td className="py-2.5 px-3 font-bold text-cyan-400 print:text-cyan-800">{line.code}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-white print:text-black">
                          {line.name}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-400 print:text-gray-600">
                          {line.targetCount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-white print:text-black">
                          {line.actualCount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-emerald-400 print:text-emerald-700">
                          {line.goodCount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-rose-400 print:text-rose-700">
                          {line.defectCount}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-white print:text-black">
                          {ach}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-cyan-300 print:text-cyan-800 font-bold">
                          {line.operationRate}%
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-200 print:text-black">
                          <span className={line.defectRate > line.targetDefectRate ? 'text-rose-400 font-bold' : ''}>
                            {line.defectRate}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-medium ${
                            line.status === 'running'
                              ? 'bg-emerald-950 text-emerald-300'
                              : line.status === 'warning'
                              ? 'bg-amber-950 text-amber-300'
                              : 'bg-rose-950 text-rose-300'
                          }`}>
                            {line.status === 'running' ? '정상' : line.status === 'warning' ? '주의' : '정지'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            스마트팩토리 MES 공정 모니터링 시스템 자동 보고서
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
