# 快速开始

本页提供两条最短路径：直接查看日历，以及生成第一份测试 Excel。还没有项目文件时，先按 [[首页|Home]] 的“获取项目”操作。所有命令均从仓库根目录执行。

## 1. 直接打开日历

日历构建产物是 `web/index.html`，不需要安装依赖或启动服务器。

macOS：

```bash
open web/index.html
```

Linux 桌面：

```bash
xdg-open web/index.html
```

也可以在文件管理器中双击 `web/index.html`。

打开后检查：

1. 上月、下月和“回到今天”按钮可以使用；
2. 点击日期后，右侧抽屉会显示农历、节日和事件；
3. 有历史热点且配置了 URL 的日期会显示 Excel 下载按钮。

> 仓库中的热点、未来事件、节假日和下载地址包含示例数据。用于正式场景前，请替换为经过核验的数据。

## 2. 生成第一份测试 Excel

安装 Excel 依赖：

```bash
python3 -m pip install openpyxl
```

写入一条测试记录：

```bash
echo '[{"采集时间":"2026-08-27 15:00","新闻标题":"测试新闻","新闻摘要":"用于验证 Excel 写入"}]' \
  | python3 scripts/append_stock_analysis.py
```

成功时会看到类似输出：

```text
OK 追加 1 条 -> /path/to/stock-calendar-skill/stock_hot_data/热点_股市联想_YYYY-MM-DD.xlsx
```

脚本总是写入运行当天对应的文件，日期取本机时间。示例 JSON 中没有提供的其余字段会写成空单元格。

## 3. 使用完整字段

正式记录支持 9 个字段：

```json
[
  {
    "采集时间": "2026-08-27 15:00",
    "新闻标题": "示例标题",
    "新闻摘要": "示例摘要",
    "直接关联行业": "半导体",
    "产业链延伸": "设备、材料、封测",
    "题材想象_情绪联想": "示例推演",
    "谐音梗题材": "无",
    "风险提示": "事件和市场表现可能不及预期",
    "专业简要分析": "仅用于演示字段结构"
  }
]
```

建议将 JSON 保存为文件，再通过 stdin 输入，避免 shell 引号问题：

```bash
python3 scripts/append_stock_analysis.py < records.json
```

## 4. 下一步

- 想让 AI 执行这套流程：[[作为 Skill 安装|Install-as-a-Skill]]
- 想把 Excel 链接显示到日历：[[更新日历数据|Update-Calendar-Data]]
- 命令失败：[[故障排查|Troubleshooting]]
