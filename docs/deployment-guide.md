# 部署指南：云电脑 / 服务器部署与定时触发

本指南说明如何把本 Skill 部署到 **豆包云电脑**（或任意 Linux 服务器），并配置
cron 定时任务，实现"到点自动搜索热点 → 写入 Excel → 更新日历 → 交付"的全自动链路。

---

## 一、环境要求

| 依赖 | 版本/说明 |
|---|---|
| Python | 3.9+ |
| openpyxl | `pip3 install openpyxl`（Excel 读写） |
| 浏览器 | 日历网页 `web/index.html` 需现代浏览器（Chrome/Edge） |
| 豆包云电脑 | 用于挂载 cron 定时任务与文件上传（FileBatchUpload） |

---

## 二、部署步骤

### 1. 放置项目
```bash
# 把仓库放到工作区（示例）
mkdir -p ~/workspace/stock-calendar-skill
cp -r stock-calendar-skill/* ~/workspace/stock-calendar-skill/
```

### 2. 安装 Python 依赖
```bash
pip3 install openpyxl
```

### 3. 准备数据目录
```bash
mkdir -p ~/workspace/stock_hot_data
```
Excel 输出目录默认在仓库 `../stock_hot_data/`，可改 `scripts/append_stock_analysis.py`
中的 `BASE_DIR` 调整。

### 4. 本地验证
```bash
# ① 打开日历（零依赖）
xdg-open ~/workspace/stock-calendar-skill/web/index.html   # Linux
open ~/workspace/stock-calendar-skill/web/index.html        # macOS

# ② 测试 Excel 追加
echo '[{"采集时间":"2026-08-27 15:00","新闻标题":"测试","新闻摘要":"测试摘要","直接关联行业":"测试","产业链延伸":"测试","题材想象_情绪联想":"测试","谐音梗题材":"测试（娱乐）","风险提示":"测试","专业简要分析":"测试"}]' | \
  python3 scripts/append_stock_analysis.py
```

---

## 三、导入豆包作为 Skill

1. 将本仓库放入豆包 Skill 目录（通常为 `workspace/.user_skills/<skill-name>/`），
   确保 `SKILL.md`、`scripts/`、`web/` 都在该目录下。
2. 豆包对话中触发（如「生成我的热点日历」「更新今日日历」），即可按 `SKILL.md`
   工作流执行。

---

## 四、创建定时任务（云电脑自动触发）

### 方式 A：豆包内置定时任务（推荐）
1. 在豆包中新建定时任务（cron）。
2. 任务内容填入 `prompts/cron-trigger-prompt.md` 的模板全文。
3. 调度表达式：`*/30 * * * *`（每 30 分钟）。
4. 启用后，任务到点会自动在云电脑环境执行。

### 方式 B：系统 crontab
若你在自己的 Linux 服务器上，可写 crontab：
```bash
crontab -e
# 每 30 分钟触发一次（调用一个触发脚本/通知，由 AI/脚本执行完整流程）
*/30 * * * * cd ~/workspace/stock-calendar-skill && ./scripts/run_tick.sh >> logs/tick.log 2>&1
```

---

## 五、30 天自动清理

`SKILL.md` 与触发提示词均要求：每次执行检查 Excel 目录，删除超过 30 天（含）的
历史文件。若需在纯本地自动清理，可加一条 cron：
```bash
# 每天 03:00 清理超过 30 天的热点 Excel
0 3 * * * find ~/workspace/stock_hot_data -name "热点_股市联想_*.xlsx" -mtime +30 -delete
```

---

## 六、常见问题

| 问题 | 处理 |
|---|---|
| Excel 写不进去 | 确认已 `pip3 install openpyxl`；检查目录写权限 |
| 日历打不开 | 用现代浏览器直接打开 `web/index.html`，无需服务器 |
| 农历显示错 | `web/src/lunar.js` 仅支持 1900-2100，检查日期是否越界 |
| 定时任务没执行 | 确认任务已启用、cron 表达式正确、云电脑在线 |
| 上传链接失效 | 上传链接有有效期，需按需重新上传（FileBatchUpload） |
