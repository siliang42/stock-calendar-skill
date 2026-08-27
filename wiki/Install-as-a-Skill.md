# 作为 Skill 安装

`SKILL.md` 定义了 AI 何时使用本项目以及应执行的工作流。它不会替代宿主平台本身的搜索、定时任务和文件上传能力。

## 前置条件

- 一个支持本地 Skill 的 AI 宿主环境；
- Skill 可以读取其目录中的 `scripts/`、`web/`、`prompts/` 和 `cron/`；
- 若要生成 Excel，Python 环境已安装 `openpyxl`；
- 若要自动搜索和交付，宿主环境提供等价于搜索、上传和文件展示的工具。

不同宿主平台的 Skill 目录和导入界面可能不同。下文以豆包云电脑的常见目录形式为例，请以当前平台文档为准。

## 1. 放置完整目录

不要只复制 `SKILL.md`。建议保留以下结构：

```text
workspace/.user_skills/stock-hot-calendar/
├── SKILL.md
├── scripts/
│   ├── append_stock_analysis.py
│   └── publish_calendar_data.py
├── web/
│   ├── index.html
│   ├── build.py
│   └── src/
├── prompts/
└── cron/
```

`docs/`、`wiki/`、`README.md` 和 `LICENSE` 不参与运行，但保留它们有利于查阅和维护。

## 2. 安装 Excel 依赖

在 Skill 实际使用的 Python 环境中执行：

```bash
python3 -m pip install openpyxl
```

验证：

```bash
python3 -c 'import openpyxl; print(openpyxl.__version__)'
```

## 3. 让宿主平台识别 Skill

在宿主平台中刷新或重新扫描 Skill。成功识别后，Skill 名称应为 `stock-hot-calendar`。

可以用以下请求做手动触发测试：

```text
打开 A 股热点事件日历
```

或者：

```text
把我提供的真实热点数据更新到今天的热点日历，并生成 Excel。
```

第二种请求需要同时提供真实数据，或允许宿主平台通过其搜索工具获取数据。

## 4. 理解三类工作流

### A. 只查看日历

宿主交付 `web/index.html` 或已部署的页面 URL。此流程不需要联网搜索或 Excel 依赖。

### B. 生成或更新日历

宿主修改 `web/src/data/` 中的数据，运行 `python3 web/build.py`，再交付新的 `web/index.html`。

### C. 自动搜索、写 Excel、更新日历并汇报

宿主需要组合以下能力：

1. 搜索真实热点；
2. 由 AI 生成结构化分析；
3. 将 JSON 通过 stdin 交给 `append_stock_analysis.py`；
4. 通过平台工具或对象存储上传 Excel；
5. 把真实公网 URL 写入日历数据；
6. 重新构建并交付日历。

`general_search`、`FileBatchUpload` 和 `present_files` 是 `SKILL.md` 中使用的宿主工具名称。其他平台可以使用等价工具，但需要相应调整提示词。

## 5. 验证清单

- [ ] AI 能识别“热点日历”相关请求并选择该 Skill；
- [ ] AI 能读取 `web/index.html` 和 `web/src/data/`；
- [ ] `python3 scripts/append_stock_analysis.py < records.json` 能生成 Excel；
- [ ] 数据更新后会执行 `python3 web/build.py`；
- [ ] 上传步骤返回真实可访问的 URL，而不是示例地址；
- [ ] 最终输出保留“不构成投资建议”的免责声明。

下一步：[[更新日历数据|Update-Calendar-Data]] 或 [[自动化与部署|Automation-and-Deployment]]。
