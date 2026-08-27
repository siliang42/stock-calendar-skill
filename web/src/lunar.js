// ============================================================
// lunar.js — 农历/节气/节日 纯算法（零依赖，覆盖 1900-2100）
// 核心：基准日偏移法，以 1900-01-31（农历庚子年正月初一）为基准
// ============================================================

// 1900-2099 每年一个 16 位十六进制数：
// 位结构: [闰月大小位:1][大小月:12位][闰月月份:4位]
const LUNAR_INFO = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
  0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
  0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
  0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
  0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
  0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
  0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
  0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
  0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
  0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
  0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
  0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
  0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
  0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
  0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
  0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
  0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
  0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
  0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
  0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
  0x0d520
];

const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const MONTH_CN = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const DAY_CN = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];

/** 该年闰几月（0 = 无闰月） */
function leapMonth(year) {
  return LUNAR_INFO[year - 1900] & 0xf;
}

/** 该年闰月天数 */
function leapDays(year) {
  if (leapMonth(year)) {
    return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
  }
  return 0;
}

/** 某月是大月(30)还是小月(29) */
function monthDays(year, month) {
  return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
}

/** 农历年总天数 */
function lunarYearDays(year) {
  let sum = 348; // 12 * 29
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
  }
  return sum + leapDays(year);
}

/**
 * 公历 → 农历
 * @param {Date} date
 * @returns {{year:number, month:number, day:number, isLeap:boolean, ganZhiYear:string, zodiac:string, lunarMonth:string, lunarDay:string}}
 */
export function solarToLunar(date) {
  // 基准：1900-01-31 = 农历正月初一。
  // 用 UTC 组件计算整天数差，避免本地/UTC 时区导致的 off-by-one。
  const base = Date.UTC(1900, 0, 31);
  const target = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  let offset = Math.floor((target - base) / 86400000);
  if (offset < 0 || offset > 73550) throw new Error('仅支持 1900-2100 年');

  // 1) 逐年扣除
  let year = 1900;
  let temp = 0;
  for (; year < 2100 && offset > 0; year++) {
    temp = lunarYearDays(year);
    offset -= temp;
  }
  if (offset < 0) { offset += temp; year--; }

  // 2) 逐月扣除（含闰月）
  const leap = leapMonth(year);
  let isLeap = false;
  let month = 1;
  for (; month < 13 && offset > 0; month++) {
    if (leap > 0 && month === leap + 1 && !isLeap) {
      --month; isLeap = true; temp = leapDays(year);
    } else {
      temp = monthDays(year, month);
    }
    if (isLeap && month === leap + 1) { isLeap = false; }
    offset -= temp;
  }
  if (offset === 0 && leap > 0 && month === leap + 1) {
    if (isLeap) { isLeap = false; } else { isLeap = true; --month; }
  }
  if (offset < 0) { offset += temp; --month; }
  const day = offset + 1;

  // 3) 干支年 & 生肖（1900 年为庚子年）
  const ganZhiIndex = (year - 1900 + 36) % 60;
  const ganZhiYear = TIAN_GAN[ganZhiIndex % 10] + DI_ZHI[ganZhiIndex % 12];
  const zodiac = ZODIAC[ganZhiIndex % 12];

  return {
    year, month, day, isLeap, ganZhiYear, zodiac,
    lunarMonth: (isLeap ? '闰' : '') + MONTH_CN[month - 1] + '月',
    lunarDay: DAY_CN[day - 1],
  };
}

// 公历节日（固定月-日）
const SOLAR_FESTIVALS = {
  '1-1': '元旦', '2-14': '情人节', '3-8': '妇女节', '3-12': '植树节',
  '4-1': '愚人节', '5-1': '劳动节', '5-4': '青年节', '6-1': '儿童节',
  '7-1': '建党节', '8-1': '建军节', '9-10': '教师节', '10-1': '国庆节',
  '12-24': '平安夜', '12-25': '圣诞节',
};

// 农历节日（闰月不匹配）
const LUNAR_FESTIVALS = {
  '1-1': '春节', '1-15': '元宵节', '2-2': '龙抬头',
  '5-5': '端午节', '7-7': '七夕节', '7-15': '中元节',
  '8-15': '中秋节', '9-9': '重阳节',
  '12-8': '腊八节', '12-23': '小年',
};

// 24 节气名
const SOLAR_TERMS = ['小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑', '立秋', '处暑',
  '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至'];

// 2026 年基准节气日期表（每月两个：月初节气、月中节气），±1 天宽松匹配
const SOLAR_TERM_DATES_2026 = [
  [5, 20], [4, 19], [5, 20], [5, 20], [5, 21], [5, 21],
  [7, 23], [7, 23], [7, 23], [8, 23], [7, 22], [7, 22],
];

/** 取节气（近似查表法，覆盖常见场景） */
export function getSolarTerm(date) {
  const month = date.getMonth();
  const day = date.getDate();
  const [firstDay, secondDay] = SOLAR_TERM_DATES_2026[month];
  if (Math.abs(day - firstDay) <= 1) return SOLAR_TERMS[month * 2];
  if (Math.abs(day - secondDay) <= 1) return SOLAR_TERMS[month * 2 + 1];
  return null;
}

/**
 * 节日 = 公历节日 + 农历节日 + 节气节日 + 除夕
 * @param {Date} date
 * @param {ReturnType<typeof solarToLunar>} lunar
 * @returns {string[]}
 */
export function getFestivals(date, lunar) {
  const festivals = [];
  const m = date.getMonth() + 1;
  const d = date.getDate();

  if (SOLAR_FESTIVALS[`${m}-${d}`]) festivals.push(SOLAR_FESTIVALS[`${m}-${d}`]);
  if (!lunar.isLeap && LUNAR_FESTIVALS[`${lunar.month}-${lunar.day}`]) {
    festivals.push(LUNAR_FESTIVALS[`${lunar.month}-${lunar.day}`]);
  }
  const term = getSolarTerm(date);
  if (term === '清明') festivals.push('清明节');
  if (term === '冬至') festivals.push('冬至');
  if (lunar.month === 12 && lunar.day === monthDays(lunar.year, 12)) {
    festivals.push('除夕');
  }
  return festivals;
}

/** 快捷：根据 Date 返回农历+节日聚合信息 */
export function getDayInfo(date) {
  const lunar = solarToLunar(date);
  return {
    lunar,
    festivals: getFestivals(date, lunar),
    solarTerm: getSolarTerm(date),
  };
}
