# 架构与数据结构说明

## 一、整体架构

```
┌────────────────────────────────────────────────────────────┐
│                    定时任务 (cron，每30分钟)                  │
│   prompts/cron-trigger-prompt.md → 豆包云电脑自动执行          │
└──────────────┬─────────────────────────────────────────────┘
               │ Switch Case：按星期/时刻分流
               ▼
┌───────────────────────────────┐
│  默认分支：半小时热点→股市联想    │
│  1) general_search 搜索热点      │
│  2) 逐条专业联想分析             │
│  3) append_stock_analysis.py    │──► stock_hot_data/热点_股市联想_YYYY-MM-DD.xlsx
│     （写入当日 Excel，追加不覆盖） │
│  4) publish/上传 → 公网下载链接   │──► 交付用户下载
│  5) 更新日历数据                 │──► web/src/data/historicalevents.js
└───────────────────────────────┘
               │
               ▼
┌───────────────────────────────┐
│        日历看板 (纯前端)         │
│  web/index.html  (零依赖单文件)  │
│  ├─ src/lunar.js    农历算法     │
│  └─ src/data/*.js   事件数据     │
│  交互：点日期→农历/节日/热点/下载 │
└───────────────────────────────┘
```

## 二、模块职责

| 模块 | 职责 |
|---|---|
| `SKILL.md` | AI Skill 定义：何时触发 + 工作流 + 硬约束 |
| `prompts/` | 提示词模板与设计方法论（Prompt & GEO） |
| `web/src/` | 前端模块源码：`lunar.js` 算法、`app.js` 主逻辑、`data/*.js` 数据 |
| `web/build.py` | 构建脚本：把 `src/` 模块拼装成自包含单文件 `index.html` |
| `web/index.html` | 构建产物，零依赖，双击即用 |
| `scripts/` | Python 数据处理：Excel 追加、上传发布、日历数据更新 |
| `cron/` | 定时任务调度配置 |
| `docs/` | 部署、架构文档 |

## 三、构建流程

`web/index.html` 是构建产物，源码在 `web/src/`：

```bash
python3 web/build.py
# 读取 src/lunar.js + src/app.js + src/data/*.js → 拼装为自包含单文件 index.html
```

每次更新数据（`data/*.js`）后需重新构建，`index.html` 才会包含最新内容。

## 三、数据契约（跨模块共用的格式）

### 1. 历史热点（`web/src/data/historicalevents.js`）
```js
{
  id: 'ev-2026-08-27',
  date: '2026-08-27',              // 键：YYYY-MM-DD，唯一
  excelDownloadUrl: 'https://...', // 当日 Excel 公网下载链接
  hotEvents: [ { index: 1, title: '...', type: 'historical' } ]  // 每天最多3条
}
```

### 2. 未来事件（`web/src/data/futureevents.js`）
```js
{
  id: 'f-...',
  startDate: '2026-08-28',   // YYYY-MM-DD
  endDate: '2026-08-28',     // 跨天事件可不同
  title: '...',
  description: '...',
  isEstimated: false,        // true → UI 显示「预计」
  category: 'conference'     // conference | policy | product | holiday | space | earnings
}
```

### 3. 法定节假日（`web/src/data/holidays.js`）
```js
{ id: 'h-...', date: '2026-10-01', name: '国庆节', type: 'holiday' }  // 或 'workday'(调休)
```

### 4. Excel 记录（`scripts/append_stock_analysis.py`）
```
采集时间 | 新闻标题 | 新闻摘要 | 直接关联行业 | 产业链延伸 |
题材想象_情绪联想 | 谐音梗题材 | 风险提示 | 专业简要分析
```

## 四、关键算法说明

- **农历转换**（`web/src/lunar.js`）：基准日偏移法，以 1900-01-31（农历庚子年正月初一）
  为基准，逐年/逐月扣除农历天数，覆盖 1900-2100。
- **节气**：近似查表法（2026 基准 + ±1 天宽松匹配），如需跨年精确可扩展为定气法。
- **日历网格**：6 行 × 7 列，以当月 1 号星期几为基准向前补齐到周日。
- **日期匹配**：历史热点用 `Map<date,event>` O(1) 查找；未来事件用日期范围过滤。

## 五、扩展建议

- **农历算法独立发布**：`lunar.js` 零依赖纯算法，可单独发布为 npm 包。
- **数据接入 API**：未来事件/热点可改为从 API 拉取，前端 `fetch` 即可。
- **多市场支持**：数据结构与日历引擎无关市场，可复用于美股/港股/商品日历。
