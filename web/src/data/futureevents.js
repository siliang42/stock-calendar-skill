// ============================================================

import { formatLocalDate } from '../date-utils.js';
// futureevents.js — 未来可公布的重大事件 / 科技大事
// startDate/endDate：支持跨多天事件；单日事件 = 同一日期
// isEstimated：true 时 UI 显示「预计/计划」标签
// category: conference | policy | product | holiday | space | earnings | commemoration
// ============================================================

export const FUTURE_EVENTS = [
  { id: 'f-2026-09-03', startDate: '2026-09-03', endDate: '2026-09-03', title: '中国人民抗日战争暨世界反法西斯战争胜利纪念日', description: '纪念中国人民抗日战争暨世界反法西斯战争胜利，相关主题可能关注军工、国防装备、卫星导航与军用电子', relatedSectors: ['军工', '国防装备', '卫星导航', '军用电子'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-03-12', startDate: '2026-03-12', endDate: '2026-03-12', title: '中国植树节', description: '生态建设与国土绿化主题日，相关主题可能关注环保、园林与林业', relatedSectors: ['环保', '园林', '林业'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-03-22', startDate: '2026-03-22', endDate: '2026-03-22', title: '世界水日', description: '水资源保护主题日，相关主题可能关注水务、水处理与节水设备', relatedSectors: ['水务', '水处理', '节水设备'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-04-22', startDate: '2026-04-22', endDate: '2026-04-22', title: '世界地球日', description: '生态环境保护主题日，相关主题可能关注环保、固废处理与绿色能源', relatedSectors: ['环保', '固废处理', '绿色能源'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-04-24', startDate: '2026-04-24', endDate: '2026-04-24', title: '中国航天日', description: '中国航天事业主题日，相关主题可能关注卫星、商业航天与航天装备', relatedSectors: ['卫星', '商业航天', '航天装备'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-05-18', startDate: '2026-05-18', endDate: '2026-05-18', title: '国际博物馆日', description: '文化遗产与文博主题日，相关主题可能关注文旅、数字文化与博物馆服务', relatedSectors: ['文旅', '数字文化', '文博服务'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-06-05', startDate: '2026-06-05', endDate: '2026-06-05', title: '世界环境日', description: '生态环境保护主题日，相关主题可能关注环保、节能与绿色材料', relatedSectors: ['环保', '节能', '绿色材料'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-06-08', startDate: '2026-06-08', endDate: '2026-06-08', title: '世界海洋日', description: '海洋生态与资源保护主题日，相关主题可能关注海洋经济、海工装备与水产', relatedSectors: ['海洋经济', '海工装备', '水产'], isEstimated: false, category: 'commemoration' },
  { id: 'f-2026-10-16', startDate: '2026-10-16', endDate: '2026-10-16', title: '世界粮食日', description: '粮食安全主题日，相关主题可能关注种业、农机与粮食加工', relatedSectors: ['种业', '农机', '粮食加工'], isEstimated: false, category: 'commemoration' },
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
  const key = formatLocalDate(date);
  return FUTURE_EVENTS.filter((ev) => key >= ev.startDate && key <= ev.endDate);
}
