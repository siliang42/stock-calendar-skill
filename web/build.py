#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py — 把 web/src 下的模块源码构建成自包含单文件 web/index.html
产物特点：零依赖、无 import/export、双击即用（file:// 可直接打开）。
运行：python3 web/build.py
"""
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")


def read_global(path, transform=True):
    """读取 ES module 源码并转换为普通脚本（去掉 export / import）。"""
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if transform:
        content = re.sub(r"^\s*export\s+function\s+", "function ", content, flags=re.M)
        content = re.sub(r"^\s*export\s+const\s+", "const ", content, flags=re.M)
        content = re.sub(r"^\s*export\s+", "", content, flags=re.M)
        # 去掉顶部 import（如有）
        content = re.sub(r"^import.*?;\s*", "", content, flags=re.M)
    return content


def build():
    date_utils_js = read_global(os.path.join(SRC, "date-utils.js"))
    lunar_js = read_global(os.path.join(SRC, "lunar.js"))
    hist_js = read_global(os.path.join(SRC, "data", "historicalevents.js"))
    fut_js = read_global(os.path.join(SRC, "data", "futureevents.js"))
    hol_js = read_global(os.path.join(SRC, "data", "holidays.js"))
    app_js = read_global(os.path.join(SRC, "app.js"), transform=False)

    script = "\n\n".join([date_utils_js, lunar_js, hist_js, fut_js, hol_js, app_js])

    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>A股热点事件日历</title>
<style>
:root {{
  --red: #e74c3c; --orange: #e67e22; --blue: #3498db;
  --bg: #f5f6fa; --card: #ffffff; --border: #e3e6ef; --text: #2c3e50; --muted: #95a5a6;
}}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
  background:var(--bg); color:var(--text); min-height:100vh; }}
.wrap {{ max-width:980px; margin:0 auto; padding:24px 16px 60px; }}
header {{ text-align:center; margin-bottom:20px; }}
h1 {{ font-size:26px; letter-spacing:1px; }}
.sub {{ color:var(--muted); font-size:13px; margin-top:6px; }}
.toolbar {{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }}
.nav {{ display:flex; align-items:center; gap:10px; }}
.nav button {{ width:40px; height:40px; border:1px solid var(--border); border-radius:10px;
  background:var(--card); font-size:18px; cursor:pointer; color:var(--text); }}
.nav button:hover {{ background:#eef1f7; }}
#monthTitle {{ font-size:20px; font-weight:600; min-width:150px; text-align:center; }}
#btnToday {{ padding:8px 16px; border:1px solid var(--blue); color:var(--blue); background:#fff;
  border-radius:20px; cursor:pointer; font-size:13px; }}
#summary {{ font-size:13px; color:var(--muted); text-align:right; }}
#weekdayRow {{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; margin-bottom:6px; }}
#weekdayRow span {{ text-align:center; font-size:13px; color:var(--muted); font-weight:600; padding:6px 0; }}
#grid {{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }}
.day {{ background:var(--card); border:1px solid var(--border); border-radius:10px; min-height:92px;
  padding:8px; cursor:pointer; position:relative; transition:box-shadow .15s; overflow:hidden; }}
.day:hover {{ box-shadow:0 4px 14px rgba(0,0,0,.10); }}
.day .num {{ font-size:16px; font-weight:600; }}
.day .lunar {{ font-size:11px; color:var(--muted); margin-top:2px; }}
.day .badges {{ position:absolute; top:8px; right:8px; display:flex; gap:3px; }}
.badge {{ font-size:10px; padding:1px 5px; border-radius:6px; color:#fff; }}
.badge.hot {{ background:var(--red); }}
.badge.holiday {{ background:var(--red); }}
.badge.workday {{ background:var(--orange); }}
.day .festival {{ font-size:11px; color:var(--red); margin-top:6px; font-weight:600; }}
.day .hot-title {{ font-size:10px; color:var(--blue); margin-top:4px; line-height:1.3;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }}
.day.other-month {{ opacity:.35; }}
.day.today {{ border-color:var(--blue); box-shadow:0 0 0 2px rgba(52,152,219,.35); }}
.day.holiday-bg {{ background:#fff5f5; }}
.legend {{ display:flex; gap:16px; justify-content:center; margin:18px 0 8px; font-size:12px; color:var(--muted); flex-wrap:wrap; }}
.legend .dot {{ display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:4px; vertical-align:middle; }}
.disc {{ text-align:center; font-size:12px; color:var(--muted); margin-top:18px; line-height:1.7; }}
footer {{ text-align:center; font-size:12px; color:#b0b7c3; margin-top:10px; }}
/* 抽屉 */
.overlay {{ position:fixed; inset:0; background:rgba(0,0,0,.4); opacity:0; pointer-events:none; transition:opacity .2s; z-index:99; }}
.overlay.show {{ opacity:1; pointer-events:auto; }}
.drawer {{ position:fixed; top:0; right:0; width:min(420px,92vw); height:100%; background:#fff;
  box-shadow:-8px 0 30px rgba(0,0,0,.18); transform:translateX(100%); transition:transform .25s;
  z-index:100; display:flex; flex-direction:column; }}
.drawer.show {{ transform:translateX(0); }}
.drawer-header {{ padding:18px 20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; }}
.drawer-header h2 {{ font-size:17px; }}
#drawerClose {{ border:none; background:none; font-size:22px; cursor:pointer; color:var(--muted); }}
.drawer-body {{ padding:18px 20px; overflow-y:auto; flex:1; }}
.info-block {{ margin-bottom:18px; }}
.label {{ font-size:12px; color:var(--muted); margin-bottom:8px; font-weight:600; }}
.content {{ font-size:14px; line-height:1.9; }}
.chip {{ display:inline-block; background:#eef1f7; color:var(--text); font-size:12px;
  padding:2px 8px; border-radius:12px; margin:2px 3px 2px 0; }}
.chip.est {{ background:#fef3e2; color:#b7791f; }}
.chip.sector {{ background:#e8f4fd; color:#1769aa; }}
.sector-hint {{ margin:5px 0 2px 24px; font-size:12px; color:var(--muted); }}
.event-item {{ padding:8px 0; border-bottom:1px dashed var(--border); font-size:13px; line-height:1.6; }}
.idx {{ display:inline-block; width:18px; height:18px; border-radius:50%; background:var(--red);
  color:#fff; text-align:center; font-size:11px; line-height:18px; margin-right:6px; }}
.download-btn {{ display:inline-block; margin-top:4px; padding:10px 18px; background:var(--blue);
  color:#fff; border-radius:10px; text-decoration:none; font-size:14px; }}
.download-btn:hover {{ opacity:.9; }}
.placeholder {{ color:var(--muted); font-size:13px; padding:8px 0; }}
@media (max-width:640px) {{ .day {{ min-height:70px; }} .day .lunar, .day .festival, .day .hot-title {{ font-size:9px; }} }}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>📅 A股热点事件日历</h1>
    <div class="sub">农历 · 节日 · 每日热点 · 未来重大事件 · Excel报告下载</div>
  </header>
  <div class="toolbar">
    <div class="nav">
      <button id="btnPrev">‹</button>
      <span id="monthTitle"></span>
      <button id="btnNext">›</button>
    </div>
    <div style="display:flex;align-items:center;gap:10px;">
      <span id="summary" style="margin-right:6px;"></span>
      <button id="btnToday">回到今天</button>
    </div>
  </div>
  <div id="weekdayRow"></div>
  <div id="grid"></div>
  <div class="legend">
    <span><span class="dot" style="background:var(--red)"></span>热点事件日</span>
    <span><span class="dot" style="background:var(--red)"></span>法定假「休」</span>
    <span><span class="dot" style="background:var(--orange)"></span>调休上班「班」</span>
    <span><span class="dot" style="background:var(--blue)"></span>今天</span>
  </div>
  <div class="disc">本日历所有热点与事件分析仅为题材推演，不构成任何投资建议。股市有风险，入市需谨慎。</div>
  <footer>© 2026 A股热点事件日历 · MIT License</footer>
</div>

<div class="overlay" id="overlay"></div>
<div class="drawer" id="drawer">
  <div class="drawer-header">
    <h2 id="drawerTitle"></h2>
    <button id="drawerClose">×</button>
  </div>
  <div class="drawer-body" id="drawerBody"></div>
</div>

<script>
{script}
</script>
</body>
</html>
"""
    out = os.path.join(HERE, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ 已生成自包含单文件: {out} ({len(script)} chars script)")


if __name__ == "__main__":
    build()
