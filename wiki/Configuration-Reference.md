# 配置参考

本页集中列出目录、数据字段和脚本接口。初次使用建议先阅读 [[快速开始|Quick-Start]]。

## 目录职责

| 路径 | 作用 |
|---|---|
| `SKILL.md` | Skill 触发条件、工作流和硬性约束 |
| `prompts/` | 日历生成与定时任务提示词 |
| `cron/a-share-monitor.cron` | 每 30 分钟触发的表达式示例，不是可执行脚本 |
| `scripts/append_stock_analysis.py` | 从 stdin 读取 JSON 数组，追加写入当日 Excel |
| `scripts/publish_calendar_data.py` | 将浏览器可访问的下载地址和热点标题写入新的历史热点日期 |
| `stock_hot_data/` | 运行时创建的 Excel 输出目录 |
| `web/src/data/` | 历史热点、未来事件、节假日和题材关联源码数据 |
| `web/src/lunar.js` | 农历、节气和固定节日算法 |
| `web/src/app.js` | 日历交互和渲染逻辑 |
| `web/build.py` | 将源码与数据内联到 `web/index.html` |
| `web/index.html` | 可直接打开或部署的构建产物 |

## `append_stock_analysis.py`

### 调用方式

```bash
python3 scripts/append_stock_analysis.py < records.json
```

脚本不接受命令行参数，只从 stdin 读取一个非空 JSON 数组。

### 输入字段

| 字段 | 是否强制 | 说明 |
|---|---|---|
| `采集时间` | 否 | 建议使用 `YYYY-MM-DD HH:MM` |
| `新闻标题` | 否 | 热点标题 |
| `新闻摘要` | 否 | 可核验事实摘要 |
| `直接关联行业` | 否 | 直接关联行业或板块 |
| `产业链延伸` | 否 | 上下游或相关环节 |
| `题材想象_情绪联想` | 否 | 明确标为推演的市场联想 |
| `谐音梗题材` | 否 | 娱乐内容需明确标注 |
| `风险提示` | 否 | 不确定性和反向风险 |
| `专业简要分析` | 否 | 简短分析结论 |

数组必须至少包含一个对象，但脚本不会检查每个数组元素是否为对象。正式调用方应在传入前完成 JSON Schema 或等价校验。

### 输出规则

- 输出目录：仓库根目录下的 `stock_hot_data/`；
- 默认文件：`热点_股市联想_YYYY-MM-DD.xlsx`；
- 日期：运行机器的本地日期；
- 文件已存在：追加到活动工作表，不覆盖原记录；
- 若同一天存在旧格式 `热点_股市联想_YYYYMMDD.xlsx`，脚本会继续沿用旧文件。

### 失败行为

stdin 为空、JSON 无法解析、顶层不是非空数组或缺少 `openpyxl` 时，脚本向 stderr 输出原因并以状态码 1 退出。保存 Excel 时的权限、文件锁或文件损坏异常由 Python 直接报告。

## `publish_calendar_data.py`

### 参数

| 参数 | 是否必需 | 说明 |
|---|---|---|
| `--file FILE` | 条件必需 | 本地 Excel 路径；当前仅用于提示平台上传，不会自行上传 |
| `--url URL` | 条件必需 | 浏览器可访问的下载地址；可为公网 URL 或相对于 `web/index.html` 的本地路径 |
| `--date YYYY-MM-DD` | 否 | 写入日期，默认取运行机器的当天日期 |
| `--events TITLE...` | 否 | 当天热点标题，最多写入前 3 条 |
| `--data-file PATH` | 否 | 目标数据文件，默认 `web/src/data/historicalevents.js` |

必须提供 `--file` 或 `--url` 至少一个。要可靠地更新日历，推荐使用 `--url` 和 `--events`：

```bash
python3 scripts/publish_calendar_data.py \
  --url 'https://downloads.example.com/report.xlsx' \
  --date 2026-08-28 \
  --events '标题一' '标题二'
```

示例 URL 必须替换后再运行。

### 行为说明

- 指定日期不存在：插入到 `HISTORICAL_EVENTS` 数组头部；
- 指定日期已存在：当前实现的正则替换会破坏包含嵌套热点对象的数据结构，不要使用脚本更新已有日期，应手动编辑；
- 没有 `--events`：不修改数据文件，只打印 URL；
- 有 `--events` 但没有非空 `--url`，且上传占位没有返回 URL：状态码 1；
- 只提供 `--file`：上传函数返回空字符串，因此不会获得公网地址；若同时提供 `--events`，更新会失败。

脚本不会校验日期是否合法、URL 是否可访问，也不会自动运行 `web/build.py`。在自动化链路中使用前，应由调用方检查日期是否已存在并选择新增或手动/结构化更新流程。

## `web/build.py`

```bash
python3 web/build.py
```

脚本读取：

- `web/src/lunar.js`；
- `web/src/data/historicalevents.js`；
- `web/src/data/futureevents.js`；
- `web/src/data/holidays.js`；
- `web/src/app.js`。

随后覆盖生成 `web/index.html`。它不压缩代码、不联网，也不校验事件内容真实性。

未来事件可选字段 `relatedSectors` 是字符串数组，页面会在事件详情中显示“可能关注方向”。它是研究提示，不代表事件与板块之间存在确定因果关系。

## 每次打开默认显示今天

`web/index.html` 打开时会根据浏览器本地时间选择当前月份，并高亮当天；页面跨午夜后重新获得焦点或从后台切回时，会重新读取当天日期；点击“回到今天”也会刷新日期。日期字符串 `YYYY-MM-DD` 按本地日期解析，避免 UTC 时区转换导致点击日期偏移。

## 日期与时区

- 数据键使用 `YYYY-MM-DD`；
- 两个 Python 脚本的默认日期来自运行机器本地时间；
- 定时任务提示词要求使用 `Asia/Shanghai`；
- 部署时应同时设置调度器、AI 运行环境和 Python 进程的时区，避免午夜附近写入错误日期。
