# 故障排查

先确认所有命令都在仓库根目录执行，并记录完整命令、stdout、stderr 和退出状态码。

## `No module named openpyxl`

原因：运行脚本的 Python 环境没有安装 Excel 依赖。

处理：

```bash
python3 -m pip install openpyxl
python3 -c 'import openpyxl; print(openpyxl.__version__)'
```

不要用一个 Python 的 `pip` 安装，再用另一个 Python 运行脚本。

## `stdin 未收到 JSON 数据`

原因：`append_stock_analysis.py` 不读取位置参数，必须通过 stdin 输入。

正确方式：

```bash
python3 scripts/append_stock_analysis.py < records.json
```

## `JSON 必须是包含记录对象的数组`

原因：顶层传入了单个对象、空数组或其他 JSON 类型。

错误：

```json
{"新闻标题": "标题"}
```

正确：

```json
[{"新闻标题": "标题"}]
```

## 找不到生成的 Excel

输出目录是仓库根目录下的 `stock_hot_data/`，不是当前用户的主目录，也不是仓库外的同名目录。

```bash
find stock_hot_data -maxdepth 1 -type f -name '*.xlsx' -print
```

文件日期取运行机器的本地日期。若存在同一天的旧格式文件 `热点_股市联想_YYYYMMDD.xlsx`，脚本会继续写入该文件。

## `缺少下载地址`

原因：提供了 `--events`，但没有通过 `--url` 传入非空下载地址。`--file` 不会触发真实上传，脚本也不会验证地址是否可访问。

处理顺序：

1. 使用宿主平台、对象存储或网盘上传 Excel；
2. 确认链接可访问；
3. 将链接传给脚本：

```bash
python3 scripts/publish_calendar_data.py \
  --url 'https://your-real-download-url.example/report.xlsx' \
  --date 2026-08-27 \
  --events '已核验的热点标题'
```

如果只在本机使用，不需要公网存储。把 Excel 复制到 `web/reports/`，再将对应数据项的 `excelDownloadUrl` 改为 `reports/<文件名>.xlsx`。新日期也可以把该相对路径传给 `--url`；已有日期必须手动编辑，不能用当前脚本替换。完整步骤见 [[更新日历数据|Update-Calendar-Data]] 的“纯本地下载方案”。

## 数据文件已更新，但页面没有变化

原因：`web/index.html` 是构建产物，不会在打开时动态读取 `web/src/data/`。

处理：

```bash
python3 web/build.py
open web/index.html
```

如果浏览器仍显示旧内容，关闭原来的本地文件标签页后重新打开，或强制刷新。

## 直接打开源码模块后页面空白

应打开 `web/index.html`，不要把 `web/src/app.js` 或数据模块当作页面打开。源码使用模块导出并依赖构建顺序，`web/build.py` 会将它们转换并内联到 HTML。

## Excel 下载链接失效

原因通常是分享链接过期、需要登录、访问权限变化或 URL 只是示例。

处理：

1. 在无缓存或无登录浏览器中测试链接；
2. 重新上传 Excel 并取得新 URL；
3. 更新 `historicalevents.js`；
4. 运行 `python3 web/build.py`；
5. 重新发布 `web/index.html`。

## `publish_calendar_data.py` 写入后 JavaScript 报错

常见原因有两个：

1. 使用脚本更新了一个已经存在的日期。当前正则替换不能正确处理嵌套的 `hotEvents` 对象，会留下多余片段；
2. `--events` 标题包含未转义的双引号。当前脚本直接把标题写入双引号 JavaScript 字符串，不会自动转义。

先查看数据文件差异并手动恢复合法的数据项。已有日期应直接编辑 `historicalevents.js`；脚本只用于插入尚不存在的新日期。

若已安装 Node.js，可以先检查 JavaScript 语法，再重新构建：

```bash
node --input-type=module --check < web/src/data/historicalevents.js
python3 web/build.py
```

## 未来事件显示在相邻日期

当前前端使用 `Date.toISOString()` 生成未来事件的匹配键。该方法转换为 UTC，在 UTC+ 时区可能让本地午夜落到前一个 UTC 日期。

这是当前实现限制，不是数据文件格式问题。排查时同时记录浏览器时区、期望日期和实际显示日期；在代码修复前，应逐项检查目标部署时区中的显示结果。

## 定时任务没有执行

依次确认：

1. 调度任务已启用；
2. 调度器时区正确；
3. cron 表达式确实覆盖当前时刻；
4. Skill 路径和 `{workspace}` 已替换；
5. 宿主工具名与提示词一致；
6. 云电脑或执行节点在线；
7. 日志目录存在且可写。

普通 Linux `crontab` 不能直接执行 Markdown 提示词。仓库也没有 `scripts/run_tick.sh`；必须由你提供实际的外部执行器。详见 [[自动化与部署|Automation-and-Deployment]]。

## 定时任务运行了，但日期不对

检查三处时区：调度器、AI 宿主和 Python 进程。Python 脚本默认使用系统本地时间，而提示词要求 `Asia/Shanghai`。午夜附近的不一致最容易写入前一天或后一天的文件。

更多参数和输出规则见 [[配置参考|Configuration-Reference]]。
