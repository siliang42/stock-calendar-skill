# 自动化与部署

完整自动化链路包含五种能力：定时触发、新闻搜索、AI 分析、文件上传和日历构建。仓库提供 Skill、提示词、数据脚本和静态页面，但不包含独立运行的新闻采集器或端到端执行器。

## 能力边界

| 环节 | 仓库是否提供 | 说明 |
|---|---|---|
| 定时提示词 | 是 | `prompts/cron-trigger-prompt.md` |
| cron 表达式示例 | 是 | `cron/a-share-monitor.cron` |
| JSON 追加到 Excel | 是 | `scripts/append_stock_analysis.py` |
| 将下载地址写入新日期 | 是 | `scripts/publish_calendar_data.py --url ...`，仅适合尚不存在的日期 |
| 重新构建单文件页面 | 是 | `web/build.py` |
| 新闻搜索与 AI 分析 | 否 | 由宿主平台或外部服务提供 |
| Excel 公网上传 | 否 | 由 `FileBatchUpload`、对象存储或网盘提供 |
| 端到端 `run_tick.sh` | 否 | 仓库中不存在该脚本 |

## 方案 A：宿主平台内置定时任务

适合支持 Skill、定时触发、搜索和文件上传的 AI 平台。

### 1. 安装 Skill

先完成 [[作为 Skill 安装|Install-as-a-Skill]]，并手动验证 Excel 写入和日历构建。

### 2. 创建定时任务

把 `prompts/cron-trigger-prompt.md` 的模板内容设为任务提示词，并替换：

- `{title}`：任务名称；
- `{workspace}`：脚本所在的实际绝对路径或宿主可识别路径；
- 任务中使用的工具名：若平台没有 `general_search`、`FileBatchUpload` 或 `present_files`，替换为等价能力。

调度示例：

```cron
*/30 * * * *
```

该表达式表示每小时的第 0 分和第 30 分触发，使用服务器自身时区。提示词要求按 `Asia/Shanghai` 取时间，但调度平台仍应显式配置为该时区。

### 3. 理解分流规则

提示词在固定时刻执行盘前、盘中、收盘或科技行业简报，其他半点走默认热点分析分支。

当前模板的“工作日”判断是周一至周五，不会自动识别 A 股休市日或临时休市安排。正式使用时应让宿主接入交易日历，或在提示词中增加休市日判断。

### 4. 首次验证

先用一次性手动触发验证，不要直接等待下一次 cron：

1. 日志中的当前时间和时区正确；
2. 只执行一个匹配的分支；
3. 搜索结果带有可核验来源和时间；
4. Excel 写入 `stock_hot_data/`；
5. 上传后取得真实可访问 URL；
6. 更新前先检查当天是否已存在：新日期可用脚本插入，已有日期必须用结构化解析或手动编辑，不能调用当前脚本替换；
7. `historicalevents.js` 已更新且 JavaScript 结构完整，`web/index.html` 已重新构建；
8. 最终交付包含 Excel、日历和免责声明。

## 方案 B：普通 Linux `crontab`

`crontab` 只能启动一个可执行命令，不能自行理解 `cron-trigger-prompt.md`。使用普通服务器时，你需要先实现一个外部执行器，负责调用新闻源或 AI API、生成 JSON、运行仓库脚本、上传文件并构建页面。

半小时任务会在同一天多次更新数据。外部执行器必须先按 `date` 查询 `HISTORICAL_EVENTS`：日期不存在时可调用 `publish_calendar_data.py` 插入；日期已存在时必须通过 JavaScript 解析器、AST 或其他结构化方式更新，不能调用当前脚本的正则替换分支。

实现并单独验证执行器后，才可以配置类似：

```cron
*/30 * * * * cd /absolute/path/to/stock-calendar-skill && /absolute/path/to/your-executor >> /absolute/path/to/calendar.log 2>&1
```

`/absolute/path/to/your-executor` 是你需要提供的程序，不属于本仓库。cron 环境通常没有交互式 shell 的完整 `PATH`，执行器中应使用 Python 和其他命令的绝对路径，并显式设置所需环境变量。

## 30 天历史文件清理

`SKILL.md` 和定时提示词要求清理旧 Excel，但 `append_stock_analysis.py` 与 `publish_calendar_data.py` 都没有内建清理代码。宿主 AI 必须执行该步骤，或由系统 cron 独立完成。

删除前先查看将匹配哪些文件：

```bash
find stock_hot_data -type f -name '热点_股市联想_*.xlsx' -mtime +30 -print
```

确认输出后再删除：

```bash
find stock_hot_data -type f -name '热点_股市联想_*.xlsx' -mtime +30 -delete
```

`-mtime +30` 按完整的 24 小时周期计算，表示修改时间早于 30 个完整日的文件。若业务要求“达到 30 天立即删除”，应先定义时区和边界，再调整清理逻辑。

## 部署静态日历

`web/index.html` 是自包含静态文件，可以直接放到任意静态文件服务。每次数据变化后先运行：

```bash
python3 web/build.py
```

再把新的 `web/index.html` 发布到静态站点。Excel 下载 URL 必须允许页面访问者访问；短期分享链接过期后需要重新上传并重建页面。

遇到任务未执行、URL 为空或页面未更新时，前往 [[故障排查|Troubleshooting]]。
