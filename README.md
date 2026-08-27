# A股热点事件日历 · Skill 项目包

> 一个「热点日历」开源项目：把**农历/节日/公历 + 每日股市热点事件 + 未来重大事件 + Excel 报告下载**打包成可复用的 AI Skill，可在豆包等 AI 助手中作为定时任务自动运行，也可独立部署为纯前端日历网页。

---

## 目录

- [项目简介](#项目简介)
- [包含内容](#包含内容)
- [快速开始：三种用法](#快速开始三种用法)
- [项目结构](#项目结构)
- [如何作为 Skill 导入豆包并定时触发](#如何作为-skill-导入豆包并定时触发)
- [提示词与执行编排（Prompt & GEO）](#提示词与执行编排prompt--geo)
- [数据如何更新](#数据如何更新)
- [License](#license)

---

## 项目简介

本项目把「A股全时段综合监控」中沉淀的**日历看板能力**提取为可独立复用的一体化工程：

1. **日历看板**：支持 1900–2100 年农历转换、节气、公历/农历节日、法定节假日/调休、每日热点事件标记、未来重大事件预告、以及按日期绑定 Excel 分析报告的下载链接。零依赖纯前端，双击即用。
2. **AI Skill 定义**：`SKILL.md` 可直接导入豆包，让 AI 在收到「生成/更新日历」或「定时监控热点」类请求时，按既定工作流自动执行。
3. **定时任务编排**：提供 cron 配置示例与提示词模板，实现「到点自动搜索热点 → 写入 Excel → 更新日历 → 汇报」的云电脑全自动链路。
4. **提示词设计方法论**：内置 Prompt & GEO（目标/执行/输出）设计指南，教你如何写好触发词，让 AI 稳定产出同构的日历产物。

---

## 包含内容

| 模块 | 路径 | 说明 |
|---|---|---|
| Skill 定义 | `SKILL.md` | 可导入豆包的 Skill，含 frontmatter + 工作流 |
| 前端日历 | `web/index.html` | 零依赖单文件日历应用（构建产物），双击浏览器即用 |
| 前端源码 | `web/src/` | `lunar.js` 农历算法 + `app.js` 主逻辑 + `data/*.js` 数据（ES module，可复用/可测） |
| 前端构建 | `web/build.py` | 把 `src/` 模块源码构建成自包含单文件 `index.html` |
| 示例数据 | `web/src/data/*.js` | 历史热点、未来事件、法定节假日数据结构与示例 |
| Python 脚本 | `scripts/` | Excel 追加写入、日历数据生成、文件上传发布 |
| 定时任务配置 | `cron/` | cron 表达式示例 + 部署说明 |
| 提示词设计 | `prompts/` | 建站提示词模板、定时任务触发词模板、GEO 方法论 |
| 部署指南 | `docs/deployment-guide.md` | 云电脑/服务器部署与定时触发全流程 |

---

## 快速开始：三种用法

### 用法一：直接打开日历网页（零依赖）
```bash
cd web
# 直接用浏览器打开 index.html 即可，无需安装任何依赖
open index.html   # macOS
xdg-open index.html  # Linux
```

### 用法二：作为 Skill 导入豆包
1. 将本仓库的 `SKILL.md` 与 `scripts/`、`web/` 放入豆包的 Skill 目录（通常为 `workspace/.user_skills/<skill-name>/`）。
2. 在豆包对话中触发（例如：「生成我的热点日历」或由定时任务调用）。
3. AI 会按 `SKILL.md` 的工作流：搜索热点 → 生成 Excel → 更新日历数据 → 汇报。

### 用法三：本地跑 Python 数据处理
```bash
# 追加热点分析到当日 Excel（日期自动生成）
python3 scripts/append_stock_analysis.py < records.json

# 把 Excel 上传到公网并返回链接（需配置上传脚本/凭据）
python3 scripts/publish_calendar_data.py --file 热点_股市联想_2026-08-27.xlsx
```

---

## 项目结构

```
stock-calendar-skill/
├── SKILL.md                      # AI Skill 定义（可导入豆包）
├── README.md                     # 本文件
├── LICENSE                       # MIT License
├── .gitignore
├── prompts/                      # 提示词设计
│   ├── prompt-design-guide.md    # Prompt & GEO 方法论
│   ├── build-calendar-prompt.md  # 生成日历应用的提示词模板
│   └── cron-trigger-prompt.md    # 定时任务触发提示词模板
├── docs/
│   ├── deployment-guide.md       # 云电脑/服务器部署 + 定时触发
│   └── architecture.md           # 架构与数据结构说明
├── web/                          # 前端日历（零依赖可运行）
│   ├── index.html                # 单文件应用入口（构建产物，双击即用）
│   ├── build.py                  # 构建脚本：src → index.html
│   └── src/
│       ├── lunar.js              # 农历/节气/节日算法（核心资产）
│       ├── app.js                # 日历主逻辑
│       └── data/
│           ├── historicalevents.js  # 历史热点 + Excel 链接
│           ├── futureevents.js      # 未来重大事件
│           └── holidays.js          # 法定节假日/调休
├── scripts/
│   ├── append_stock_analysis.py  # 热点分析写入 Excel
│   └── publish_calendar_data.py  # 上传发布 + 更新日历数据
└── cron/
    └── a-share-monitor.cron      # 定时任务 cron 示例
```

---

## 如何作为 Skill 导入豆包并定时触发

**核心链路**：`豆包 Skill + 定时任务(cron) + 云电脑环境 = 全自动热点日历`

1. **导入 Skill**：把本仓库 `SKILL.md`（连同 `web/`、`scripts/`、`prompts/`）放到豆包 Skill 目录。
2. **创建定时任务**：在豆包中创建 cron 任务，把 `prompts/cron-trigger-prompt.md` 中的触发提示词设为任务内容，并设置执行频率（如每 30 分钟）。
3. **云电脑自动执行**：任务到点后，豆包在云电脑环境中自动执行：搜索热点 → 写入 Excel → 更新日历数据 → 通过 `present_files` 展示日历链接 → 汇报。
4. **30 天自动清理**：脚本自动删除超过 30 天的历史 Excel，防止磁盘占满。

详细步骤见 [`docs/deployment-guide.md`](docs/deployment-guide.md) 与 [`cron/a-share-monitor.cron`](cron/a-share-monitor.cron)。

---

## 提示词与执行编排（Prompt & GEO）

`prompts/prompt-design-guide.md` 详细讲解了：

- **GEO 框架**：Goal（目标）/ Execution（执行）/ Output（输出）三要素，写出让 AI 稳定产出同构产物的提示词。
- **建站提示词**：如何一句话让 AI 生成「带农历+节日+热点+下载」的日历应用。
- **定时任务触发词**：如何设计到点自动执行的触发提示词，确保只执行匹配时段的分支。
- **防幻觉红线**：如何约束 AI 不编造行情、不越权、保留免责声明。

---

## 数据如何更新

- **热点 Excel**：由定时任务每次执行时通过 `append_stock_analysis.py` 追加写入，文件名 `热点_股市联想_YYYY-MM-DD.xlsx`。
- **日历数据**：手动或脚本更新 `web/src/data/*.js` 三个数据文件（历史热点、未来事件、节假日），随后重新构建前端：
  ```bash
  python3 web/build.py   # 把 src/ 模块源码重新生成为自包含 index.html
  ```
- **农历算法**：`web/src/lunar.js` 覆盖 1900–2100 年，无需更新。

---

## License

本项目基于 **MIT License** 开源，详见 [`LICENSE`](LICENSE)。

> 本项目所有分析仅为题材推演，不构成任何投资建议。股市有风险，入市需谨慎。
