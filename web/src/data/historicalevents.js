// ============================================================
// historicalevents.js — 历史热点事件 + Excel 下载链接
// 键：YYYY-MM-DD（唯一）；每天最多 3 条热点
// excelDownloadUrl：该日热点分析 Excel 的公网下载链接
// 更新方式：定时任务执行后，把当日最新 3 条热点写到这里
// ============================================================

export const HISTORICAL_EVENTS = [
  {
    id: 'ev-2026-08-27',
    date: '2026-08-27',
    excelDownloadUrl: 'https://aka.doubaocdn.com/s/whDB7omSUo',
    hotEvents: [
      { index: 1, title: '科创50半日大涨3.45%，算力硬件全线爆发（英伟达指引超预期）', type: 'historical' },
      { index: 2, title: '大普微签5.15亿美元企业级PCIe SSD大单，20cm涨停', type: 'historical' },
      { index: 3, title: '长鑫科技总市值破4万亿，存储芯片超级周期延续', type: 'historical' },
    ],
  },
  {
    id: 'ev-2026-08-26',
    date: '2026-08-26',
    excelDownloadUrl: 'https://aka.doubaocdn.com/s/example-20260826',
    hotEvents: [
      { index: 1, title: '有色金属全线回暖，铜、黄金方向领涨（江西铜业净利增106%）', type: 'historical' },
      { index: 2, title: '券商板块走强，锦龙股份、湘财股份涨停', type: 'historical' },
      { index: 3, title: '核电/核聚变概念活跃，中国核电等异动', type: 'historical' },
    ],
  },
];

// 转成 Map<date, event> 便于 O(1) 查找
export const historicalEventMap = new Map(
  HISTORICAL_EVENTS.map((e) => [e.date, e])
);
