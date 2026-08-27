// ============================================================
// futureevents.js — 未来可公布的重大事件 / 科技大事
// startDate/endDate：支持跨多天事件；单日事件 = 同一日期
// isEstimated：true 时 UI 显示「预计/计划」标签
// category: conference | policy | product | holiday | space | earnings
// ============================================================

export const FUTURE_EVENTS = [
  { id: 'f-2026-08-28', startDate: '2026-08-28', endDate: '2026-08-28', title: '智谱GLM-5.3开源发布', description: '国产旗舰大模型GLM-5.3将于8月28日10点开源', isEstimated: false, category: 'product' },
  { id: 'f-2026-08-31', startDate: '2026-08-31', endDate: '2026-08-31', title: 'A股8月收官+中报披露截止', description: '上市公司半年报披露截止日，关注业绩兑现', isEstimated: false, category: 'policy' },
  { id: 'f-2026-09-01', startDate: '2026-09-01', endDate: '2026-09-30', title: '9月PMI数据发布窗口', description: '关注制造业PMI与宏观数据对周期板块影响', isEstimated: true, category: 'policy' },
  { id: 'f-2026-09-09', startDate: '2026-09-09', endDate: '2026-09-11', title: '国际消费电子展（IFA）柏林', description: '消费电子与AI终端新品密集发布期', isEstimated: true, category: 'conference' },
  { id: 'f-2026-09-15', startDate: '2026-09-15', endDate: '2026-09-17', title: '苹果秋季新品发布会（预计）', description: '新一代iPhone及AI功能发布，消费电子链催化', isEstimated: true, category: 'product' },
  { id: 'f-2026-09-21', startDate: '2026-09-21', endDate: '2026-09-24', title: '中秋国庆假期窗口（预计）', description: '关注假期消费数据与出行链', isEstimated: true, category: 'holiday' },
  { id: 'f-2026-10-01', startDate: '2026-10-01', endDate: '2026-10-08', title: '国庆假期（法定节假日）', description: '10月1-8日国庆长假', isEstimated: false, category: 'holiday' },
  { id: 'f-2026-10-28', startDate: '2026-10-28', endDate: '2026-10-31', title: '半导体行业会议（预计）', description: '关注存储/HBM/先进封装产业动态', isEstimated: true, category: 'conference' },
  { id: 'f-2026-11-11', startDate: '2026-11-11', endDate: '2026-11-11', title: '双十一大促（电商旺季）', description: '消费/物流/直播电商题材催化', isEstimated: false, category: 'product' },
  { id: 'f-2026-12-15', startDate: '2026-12-15', endDate: '2026-12-18', title: '中央经济工作会议（预计）', description: '年度经济定调，关注政策主线', isEstimated: true, category: 'policy' },
  { id: 'f-2027-01-01', startDate: '2027-01-01', endDate: '2027-01-01', title: '元旦（法定节假日）', description: '2027年新年', isEstimated: false, category: 'holiday' },
  { id: 'f-2027-02-01', startDate: '2027-02-01', endDate: '2027-02-15', title: '春节假期窗口（预计）', description: '春运+消费旺季，关注出行链', isEstimated: true, category: 'holiday' },
];

/** 判断某日期命中的未来事件 */
export function getFutureEventsForDate(date) {
  const key = date.toISOString().slice(0, 10);
  return FUTURE_EVENTS.filter((ev) => key >= ev.startDate && key <= ev.endDate);
}
