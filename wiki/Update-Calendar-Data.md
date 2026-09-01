# 更新日历数据

日历的数据源位于 `web/src/data/`。修改这些模块后，必须运行 `python3 web/build.py`，因为浏览器实际打开的是已经内联数据的 `web/index.html`。

> 日期统一使用 `YYYY-MM-DD`。示例标题、日期和 URL 仅用于说明格式，正式使用时必须替换为经过核验的内容。

## 1. 更新历史热点

文件：`web/src/data/historicalevents.js`

最小数据项：

```js
{
  id: 'ev-2026-08-27',
  date: '2026-08-27',
  excelDownloadUrl: 'https://downloads.example.com/report-2026-08-27.xlsx',
  hotEvents: [
    { index: 1, title: '已核验的热点标题', type: 'historical' },
  ],
}
```

规则：

- `id` 和 `date` 应在数组内唯一；
- `date` 决定热点显示在哪一天；
- `excelDownloadUrl` 必须是浏览器可访问的真实地址；可以是公网 URL，也可以是相对于 `web/index.html` 的本地路径；
- `hotEvents` 每天最多保留 3 条，`index` 建议从 1 连续编号；
- `type` 使用 `historical`。

### 用脚本写入历史热点

先通过宿主平台或自己的存储服务上传 Excel，取得真实 URL，再执行：

```bash
python3 scripts/publish_calendar_data.py \
  --url 'https://downloads.example.com/report-2026-08-28.xlsx' \
  --date 2026-08-28 \
  --events '热点标题一' '热点标题二' '热点标题三'
```

运行前必须将示例日期和 URL 替换为真实值。默认更新 `web/src/data/historicalevents.js`；`--events` 超过 3 条时只使用前 3 条。

> 当前脚本只适合插入尚不存在的新日期。对已经存在的日期执行脚本会因嵌套对象的正则匹配缺陷破坏 JavaScript 结构；更新已有日期时请直接编辑 `historicalevents.js`，不要运行该脚本。

当前脚本不会转义事件标题中的双引号。通过 `--events` 写入时，标题中不要包含 `"`，否则生成的 JavaScript 可能无效；需要保留引号时请手动编辑数据文件并使用合法的 JavaScript 字符串。

> 仅提供 `--file` 不会完成上传。脚本中的 `upload_to_public()` 只会提示使用平台上传工具。推荐先上传，再传入 `--url`。

### 纯本地下载方案

如果不需要公网访问，可以把 Excel 放进 `web/reports/`，并写入相对路径：

```bash
mkdir -p web/reports
cp stock_hot_data/热点_股市联想_2026-08-27.xlsx web/reports/
```

然后在 `historicalevents.js` 对应日期的数据项中写入：

```js
excelDownloadUrl: 'reports/热点_股市联想_2026-08-27.xlsx',
```

示例日期需要换成实际文件日期，完成后运行 `python3 web/build.py`。直接打开 `web/index.html` 时，该链接指向本地文件；部署静态站点时，必须把 `web/reports/` 与 `web/index.html` 一起发布。`web/build.py` 不会复制 Excel。

## 2. 更新未来事件

文件：`web/src/data/futureevents.js`

```js
{
  id: 'f-2026-09-09',
  startDate: '2026-09-09',
  endDate: '2026-09-11',
  title: '已核验的会议名称',
  description: '事件说明及其公开来源摘要',
  isEstimated: false,
  category: 'conference',
  relatedSectors: ['消费电子', 'AI终端'],
}
```

规则：

- 单日事件的 `startDate` 与 `endDate` 相同；
- 跨日事件会在日期范围内的每一天显示；
- 尚未正式确认的日期使用 `isEstimated: true`；
- `category` 可用值为 `conference`、`policy`、`product`、`holiday`、`space`、`earnings`、`commemoration`。
- `relatedSectors` 是可选的题材联想数组，页面会显示为“可能关注方向”；它只表示研究线索，不代表确定性利好或投资建议。

## 纪念日与节日题材

固定纪念日可以使用未来事件格式加入，并通过 `relatedSectors` 给出研究方向。例如 9 月 3 日：

```js
{
  id: 'f-2026-09-03',
  startDate: '2026-09-03',
  endDate: '2026-09-03',
  title: '中国人民抗日战争暨世界反法西斯战争胜利纪念日',
  description: '相关主题可能关注军工、国防装备、卫星导航与军用电子',
  relatedSectors: ['军工', '国防装备', '卫星导航', '军用电子'],
  isEstimated: false,
  category: 'commemoration',
}
```

其他节日也可以按同一方式维护，例如植树节→环保/园林，世界水日→水务/节水，世界粮食日→种业/农业，世界航天日→卫星/商业航天，双十一→电商/物流/消费。日期事实应来自权威日历；板块仅作题材研究提示。

日历首次打开时会读取浏览器本地日期并显示当月；页面跨午夜后重新获得焦点或从后台切回时，也会自动刷新“今天”的高亮和月份。

## 3. 更新法定节假日和调休

文件：`web/src/data/holidays.js`

放假日：

```js
{ id: 'h-2026-10-01', date: '2026-10-01', name: '国庆节', type: 'holiday' }
```

调休上班日：

```js
{ id: 'h-2026-10-10', date: '2026-10-10', name: '调休上班', type: 'workday' }
```

`holiday` 在页面显示“休”，`workday` 显示“班”。法定安排每年可能变化，应以国务院办公厅等权威公告为准，不要沿用仓库中的示例日期作为正式数据。

## 4. 重新构建

```bash
python3 web/build.py
```

成功输出类似：

```text
已生成自包含单文件: /path/to/stock-calendar-skill/web/index.html (... chars script)
```

随后打开页面：

```bash
open web/index.html
```

Linux 使用 `xdg-open web/index.html`。

## 5. 验证更新

1. 导航到修改的月份；
2. 检查日期格是否出现热点、“休”或“班”标记；
3. 点击日期，核对标题、说明和预计标签；
4. 点击 Excel 按钮，确认 URL 可在未登录或预期登录状态下访问；
5. 确认页面底部仍有投资风险免责声明。

如果源码已经修改但页面没有变化，请查看 [[故障排查|Troubleshooting]]。
