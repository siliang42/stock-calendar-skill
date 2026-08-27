// ============================================================
// holidays.js — 法定节假日 / 调休上班
// type: 'holiday' → 放假（红底「休」）；'workday' → 调休上班（橙底「班」）
// ============================================================

export const HOLIDAYS = [
  // 2026 中秋（示例）
  { id: 'h-2026-09-25', date: '2026-09-25', name: '中秋节', type: 'holiday' },
  { id: 'h-2026-09-26', date: '2026-09-26', name: '中秋节', type: 'holiday' },
  { id: 'h-2026-09-27', date: '2026-09-27', name: '中秋节', type: 'holiday' },
  // 2026 国庆
  { id: 'h-2026-10-01', date: '2026-10-01', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-02', date: '2026-10-02', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-03', date: '2026-10-03', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-04', date: '2026-10-04', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-05', date: '2026-10-05', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-06', date: '2026-10-06', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-07', date: '2026-10-07', name: '国庆节', type: 'holiday' },
  { id: 'h-2026-10-08', date: '2026-10-08', name: '国庆节', type: 'holiday' },
  // 2026 春节（示例）
  { id: 'h-2027-02-06', date: '2027-02-06', name: '春节', type: 'holiday' },
  { id: 'h-2027-02-07', date: '2027-02-07', name: '春节', type: 'holiday' },
  { id: 'h-2027-02-08', date: '2027-02-08', name: '春节', type: 'holiday' },
  { id: 'h-2027-02-09', date: '2027-02-09', name: '春节', type: 'holiday' },
  { id: 'h-2027-02-10', date: '2027-02-10', name: '春节', type: 'holiday' },
  { id: 'h-2027-02-11', date: '2027-02-11', name: '春节', type: 'holiday' },
  { id: 'h-2027-02-12', date: '2027-02-12', name: '春节', type: 'holiday' },
];

export const holidayMap = new Map(HOLIDAYS.map((h) => [h.date, h]));
