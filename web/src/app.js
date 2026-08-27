// ============================================================
// app.js — 日历主逻辑（普通脚本版，由 build.py 内联进 index.html）
// 依赖：lunar.js / data/*.js 先于本文件加载（同一作用域）
// ============================================================

(function () {
  'use strict';

  var WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth(); // 0-based

  function $(id) { return document.getElementById(id); }

  function pad(n) { return String(n).padStart(2, '0'); }
  function fmtKey(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function isSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

  function buildMonthMatrix(year, month) {
    var firstDay = new Date(year, month, 1);
    var startWeekday = firstDay.getDay();
    var weeks = [];
    for (var w = 0; w < 6; w++) {
      var week = [];
      for (var d = 0; d < 7; d++) {
        var offset = w * 7 + d;
        week.push(new Date(year, month, 1 - startWeekday + offset));
      }
      weeks.push(week);
    }
    return weeks;
  }

  function render() {
    $('weekdayRow').innerHTML = WEEKDAYS.map(function (w) { return '<span>' + w + '</span>'; }).join('');
    $('monthTitle').textContent = viewYear + '年' + (viewMonth + 1) + '月';

    var hotCount = 0, holidayCount = 0;
    var matrix = buildMonthMatrix(viewYear, viewMonth);
    matrix.forEach(function (week) {
      week.forEach(function (d) {
        var key = fmtKey(d);
        if (historicalEventMap.has(key) || getFutureEventsForDate(d).length > 0) hotCount++;
        var h = holidayMap.get(key);
        if (h && h.type === 'holiday') holidayCount++;
      });
    });
    $('summary').textContent = '🔥 ' + hotCount + '天热点 · 🏖 ' + holidayCount + '天假期';

    var html = '';
    matrix.forEach(function (week) {
      week.forEach(function (d) {
        var key = fmtKey(d);
        var dayInfo = getDayInfo(d);
        var lunar = dayInfo.lunar;
        var holiday = holidayMap.get(key);
        var historical = historicalEventMap.get(key);
        var future = getFutureEventsForDate(d);

        var classes = ['day'];
        if (d.getMonth() !== viewMonth) classes.push('other-month');
        if (isSameDay(d, today)) classes.push('today');
        if (holiday && holiday.type === 'holiday') classes.push('holiday-bg');

        var badges = '';
        if (holiday) badges += '<span class="badge ' + (holiday.type === 'holiday' ? 'holiday' : 'workday') + '">' + (holiday.type === 'holiday' ? '休' : '班') + '</span>';
        if (historical || future.length) badges += '<span class="badge hot">热点</span>';

        var festival = dayInfo.festivals[0] ? '<div class="festival">' + dayInfo.festivals[0] + '</div>' : '';
        var hotTitle = historical
          ? '<div class="hot-title">' + (historical.hotEvents[0] ? historical.hotEvents[0].title : '') + '</div>'
          : (future[0] ? '<div class="hot-title">' + future[0].title + '</div>' : '');

        html += '<div class="' + classes.join(' ') + '" data-date="' + key + '">' +
          '<div class="num">' + d.getDate() + '</div>' +
          '<div class="lunar">' + lunar.lunarDay + '</div>' +
          '<div class="badges">' + badges + '</div>' +
          festival +
          hotTitle +
          '</div>';
      });
    });
    $('grid').innerHTML = html;

    var days = document.querySelectorAll('.day');
    for (var i = 0; i < days.length; i++) {
      days[i].addEventListener('click', (function (el) {
        return function () { openDrawer(new Date(el.getAttribute('data-date'))); };
      })(days[i]));
    }
  }

  function openDrawer(date) {
    var key = fmtKey(date);
    var dayInfo = getDayInfo(date);
    var lunar = dayInfo.lunar;
    var holiday = holidayMap.get(key);
    var historical = historicalEventMap.get(key);
    var future = getFutureEventsForDate(date);

    $('drawerTitle').textContent = date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + date.getDate() + '日 星期' + WEEKDAYS[date.getDay()];

    var body = '';
    body += '<div class="info-block"><div class="label">农历 · 节日</div><div class="content">' +
      lunar.lunarMonth + lunar.lunarDay + ' · ' + lunar.ganZhiYear + '年 · 属' + lunar.zodiac +
      (dayInfo.solarTerm ? '<span class="chip">' + dayInfo.solarTerm + '</span>' : '') +
      dayInfo.festivals.map(function (f) { return '<span class="chip">' + f + '</span>'; }).join('') +
      (holiday ? '<span class="chip ' + (holiday.type === 'workday' ? 'est' : '') + '">' + holiday.name + '（' + (holiday.type === 'holiday' ? '放假' : '调休上班') + '）</span>' : '') +
      '</div></div>';

    if (historical || future.length) {
      body += '<div class="info-block"><div class="label">🔥 当日热点</div>';
      if (historical) {
        historical.hotEvents.forEach(function (e) {
          body += '<div class="event-item"><span class="idx">' + e.index + '</span>' + e.title + '</div>';
        });
      }
      future.slice(0, 3).forEach(function (e, i) {
        body += '<div class="event-item"><span class="idx">' + (i + 1) + '</span>' + e.title + (e.description ? ' — ' + e.description : '') + (e.isEstimated ? ' <span class="chip est">预计</span>' : '') + '</div>';
      });
      body += '</div>';
    }

    body += '<div class="info-block"><div class="label">📊 Excel 分析报告</div>';
    if (historical && historical.excelDownloadUrl) {
      body += '<a class="download-btn" href="' + historical.excelDownloadUrl + '" target="_blank" rel="noreferrer">⬇ 下载 Excel 分析报告（' + key + '）</a>';
    } else {
      body += '<div class="placeholder">' + (key < fmtKey(today) ? '暂无历史数据' : '未来日期敬请期待') + '</div>';
    }
    body += '</div>';

    $('drawerBody').innerHTML = body;
    $('overlay').classList.add('show');
    $('drawer').classList.add('show');
  }

  function closeDrawer() {
    $('overlay').classList.remove('show');
    $('drawer').classList.remove('show');
  }

  $('btnPrev').addEventListener('click', function () { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });
  $('btnNext').addEventListener('click', function () { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });
  $('btnToday').addEventListener('click', function () { viewYear = today.getFullYear(); viewMonth = today.getMonth(); render(); openDrawer(new Date(today)); });
  $('drawerClose').addEventListener('click', closeDrawer);
  $('overlay').addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') $('btnPrev').click();
    if (e.key === 'ArrowRight') $('btnNext').click();
    if (e.key === 'Escape') closeDrawer();
  });

  render();
})();
