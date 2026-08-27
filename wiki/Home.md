# A 股热点事件日历

本 Wiki 面向第一次使用本项目的人。你可以直接打开日历网页，也可以把项目作为 AI Skill 使用，或者在支持定时任务和文件上传的宿主平台中搭建自动更新流程。

## 界面预览

[![A 股热点事件日历界面预览：月历、农历节日、当日热点事件和 Excel 报告下载](https://raw.githubusercontent.com/wiki/siliang42/stock-calendar-skill/assets/a-share-hot-event-calendar-preview.png)](https://raw.githubusercontent.com/wiki/siliang42/stock-calendar-skill/assets/a-share-hot-event-calendar-preview.png)

> 点击图片可查看大图。准备运行或研究项目时，从 [[快速开始|Quick-Start]] 开始。

> 所有热点与事件分析仅为题材推演，不构成投资建议。行情、事件和下载链接必须来自可核验的真实来源。

## 项目能做什么

- 在一个月历中展示公历、农历、节气、节日和法定节假日/调休。
- 按日期展示最多 3 条历史热点，并关联当日 Excel 分析报告。
- 展示单日或跨日的未来事件，并标记预计事件。
- 将 JSON 格式的热点分析追加写入按日期命名的 Excel。
- 生成一个无外部依赖、可通过 `file://` 直接打开的 `web/index.html`。
- 通过 `SKILL.md` 约束 AI 完成搜索、分析、写 Excel、更新日历和交付流程。

## 项目不会独立完成什么

仓库没有新闻抓取服务、AI 模型、对象存储或完整的定时执行器。以下名称描述的是宿主平台能力，不是仓库中的 Python 函数：

- `general_search`：搜索近期新闻；
- `FileBatchUpload`：把 Excel 上传到公网；
- `present_files`：向用户展示或交付文件。

`scripts/publish_calendar_data.py` 可以把一个已经存在的下载地址写入日历数据，但它内置的上传函数只是提示占位，不会自行上传文件。下载地址既可以是正式部署时的公网 URL，也可以是纯本地使用时相对于 `web/index.html` 的文件路径。

## 选择你的使用路径

### 我只想查看日历

前往 [[快速开始|Quick-Start]]。打开 `web/index.html` 不需要安装 Python 包，也不需要启动 Web 服务器。

### 我想让 AI 生成和维护日历

先完成 [[作为 Skill 安装|Install-as-a-Skill]]，再阅读 [[更新日历数据|Update-Calendar-Data]]。

### 我想定时自动更新

先确认宿主平台具备搜索、AI 执行、文件上传和定时任务能力，然后阅读 [[自动化与部署|Automation-and-Deployment]]。

## 环境要求

| 用途 | 要求 |
|---|---|
| 只查看日历 | Chrome、Edge、Safari 或其他现代浏览器 |
| 重新构建日历 | Python 3.9+，无需第三方包 |
| 生成 Excel | Python 3.9+、`openpyxl` |
| 自动搜索与交付 | 支持相关工具的 AI 宿主平台，或自行实现的外部执行器 |

## 获取项目

如果还没有项目文件，可以在 GitHub 项目页使用 **Code > Download ZIP** 并解压，或复制项目页提供的 Git URL：

```bash
git clone <repository-url>
cd stock-calendar-skill
```

将 `<repository-url>` 替换为项目的真实 Git URL。确认当前位于仓库根目录：

```bash
pwd
test -f SKILL.md && test -f web/index.html && echo '目录正确'
```

后续所有命令默认在仓库根目录 `stock-calendar-skill/` 执行。

## 推荐阅读顺序

1. [[快速开始|Quick-Start]]
2. [[作为 Skill 安装|Install-as-a-Skill]]
3. [[更新日历数据|Update-Calendar-Data]]
4. [[自动化与部署|Automation-and-Deployment]]
5. [[配置参考|Configuration-Reference]]
6. [[故障排查|Troubleshooting]]
