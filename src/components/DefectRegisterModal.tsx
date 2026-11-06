import React, { useState, useEffect } from 'react';
import { useProduction } from '../context/ProductionContext';
import { X, PlusCircle, AlertCircle, Check } from 'lucide-react';

interface DefectRegisterModalProps {
  initialLineId?: string | null;
  onClose: () => void;
}

export const DefectRegisterModal: React.FC<DefectRegisterModalProps> = ({
  initialLineId,
  onClose,
}) => {
  const { lines, registerDefect } = useProduction();

  const [selectedLineId, setSelectedLineId] = useState<string>(
    initialLineId || (lines[0]?.id || 'line-1')
  );

  const selectedLine = lines.find(l => l.id === selectedLineId) || lines[0];

  // Common presets by line type
  const linePresets: Record<string, { label: string; category: string }[]> = {
    'line-1': [
      { label: '솔더 브릿지(납땜 쇼트)', category: 'electrical' },
      { label: '부품 미삽(Missing Parts)', category: 'assembly' },
      { label: '칩 틀어짐(Misalignment)', category: 'assembly' },
      { label: '솔더 볼/이물 부착', category: 'cosmetic' },
      { label: 'PCB 휨/파손', category: 'mechanical' },
    ],
    'line-2': [
      { label: '내경 치수 공차 초과', category: 'mechanical' },
      { label: '가공면 미세 버(Burr)', category: 'cosmetic' },
      { label: '표면 스크래치/찍힘', category: 'cosmetic' },
      { label: '세척 후 절삭유 잔류', category: 'other' },
      { label: '홀 깊이 미달', category: 'mechanical' },
    ],
    'line-3': [
      { label: '광축 틸트 편차(Tilt)', category: 'mechanical' },
      { label: 'UV 접착제 미세 도포 번짐', category: 'assembly' },
      { label: '렌즈 표면 먼지 유입', category: 'cosmetic' },
      { label: '감도 불량/암실 노이즈', category: 'electrical' },
    ],
    'line-4': [
      { label: '스크류 체결 토크 미달', category: 'assembly' },
      { label: '방수 가스켓 압착 불량', category: 'mechanical' },
      { label: '플렉시블 FPCB 핀 손상', category: 'electrical' },
      { label: '하우징 단차/유격', category: 'assembly' },
    ],
    'line-5': [
      { label: 'RF 무선 수신감도 미달', category: 'electrical' },
      { label: '바코드 리딩 인식 지연', category: 'other' },
      { label: '패키지 박스 모서리 찍힘', category: 'cosmetic' },
      { label: '전원 인가 초기 부팅 실패', category: 'electrical' },
    ],
  };

  const currentPresets = linePresets[selectedLine?.id || 'line-1'] || linePresets['line-1'];

  const [defectType, setDefectType] = useState<string>(currentPresets[0]?.label || '');
  const [defectCount, setDefectCount] = useState<number>(1);
  const [defectCategory, setDefectCategory] = useState<string>(currentPresets[0]?.category || 'assembly');
  const [operatorNote, setOperatorNote] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  useEffect(() => {
    if (currentPresets[0]) {
      setDefectType(currentPresets[0].label);
      setDefectCategory(currentPresets[0].category);
    }
  }, [selectedLineId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!defectType.trim() || defectCount <= 0) return;

    registerDefect(selectedLine.id, defectType.trim(), defectCount, defectCategory);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  // Preview metrics
  const projectedDefectCount = selectedLine ? selectedLine.defectCount + defectCount : 0;
  const projectedDefectRate = selectedLine
    ? Number(((projectedDefectCount / Math.max(1, selectedLine.actualCount)) * 100).toFixed(2))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                현장 불량 발생 실시간 등록
              </h3>
              <p className="text-xs text-slate-400">라인별 품질 이상 보고 즉시 반영</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">불량 현황이 반영되었습니다!</h4>
            <p className="text-xs text-slate-400 font-mono">
              {selectedLine.code} {defectType} (+{defectCount}건) 등록 완료
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target Line Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                대상 라인 선택 (총 5개 라인)
              </label>
              <div className="grid grid-cols-5 gap-1.5 font-mono">
                {lines.map(line => (
                  <button
                    key={line.id}
                    type="button"
                    onClick={() => setSelectedLineId(line.id)}
                    className={`py-2 px-1 text-center rounded-lg border text-xs font-bold transition-all ${
                      selectedLineId === line.id
                        ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <div>{line.code}</div>
                    <div className="text-[9px] font-sans font-normal opacity-75 truncate">{line.name.substring(0, 3)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                주요 불량 항목 빠른 선택
              </label>
              <div className="flex flex-wrap gap-1.5">
                {currentPresets.map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setDefectType(preset.label);
                      setDefectCategory(preset.category);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                      defectType === preset.label
                        ? 'bg-rose-950/80 border-rose-600 text-rose-300 font-medium'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                불량 유형 명칭
              </label>
              <input
                type="text"
                value={defectType}
                onChange={e => setDefectType(e.target.value)}
                required
                placeholder="불량 세부 항목 입력"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Quantity and Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  불량 수량 (EA)
                </label>
                <div className="flex items-center gap-1.5 font-mono">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={defectCount}
                    onChange={e => setDefectCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setDefectCount(prev => prev + 1)}
                    className="px-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefectCount(prev => prev + 5)}
                    className="px-2 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200"
                  >
                    +5
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  불량 분류 카테고리
                </label>
                <select
                  value={defectCategory}
                  onChange={e => setDefectCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                >
                  <option value="electrical">전기·전자적 결함</option>
                  <option value="mechanical">기계·치수 편차</option>
                  <option value="assembly">조립·체결 불량</option>
                  <option value="cosmetic">외관·스크래치/버</option>
                  <option value="other">기타 공정 불량</option>
                </select>
              </div>
            </div>

            {/* Real-time Impact Preview Box */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-xs space-y-1.5 font-mono">
              <div className="text-[11px] text-slate-400 font-sans font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>등록 후 {selectedLine.code} 라인 지표 변화 예상치</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">누적 불량 건수:</span>
                <span className="text-white font-bold tabular-nums">
                  {selectedLine.defectCount} EA → <span className="text-rose-400">{projectedDefectCount} EA (+{defectCount})</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">예상 불량률:</span>
                <span className="text-white font-bold tabular-nums">
                  {selectedLine.defectRate}% → <span className={projectedDefectRate > selectedLine.targetDefectRate ? 'text-rose-400' : 'text-emerald-400'}>
                    {projectedDefectRate}%
                  </span>
                  <span className="text-slate-500 text-[10px] ml-1">(관리선 {selectedLine.targetDefectRate}%)</span>
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
              >
                불량 현황 등록
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
