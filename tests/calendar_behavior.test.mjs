import assert from 'node:assert/strict';
import test from 'node:test';
import { getLocalToday, parseLocalDate } from '../web/src/date-utils.js';
import { FUTURE_EVENTS, getFutureEventsForDate } from '../web/src/data/futureevents.js';

test('parses YYYY-MM-DD as a local calendar date', () => {
  const date = parseLocalDate('2026-09-03');
  assert.equal(date.getFullYear(), 2026);
  assert.equal(date.getMonth(), 8);
  assert.equal(date.getDate(), 3);
});

test('gets today from the browser local calendar', () => {
  const now = new Date();
  const today = getLocalToday();
  assert.equal(today.getFullYear(), now.getFullYear());
  assert.equal(today.getMonth(), now.getMonth());
  assert.equal(today.getDate(), now.getDate());
  assert.equal(today.getHours(), 0);
});

test('includes Victory Day with related sectors', () => {
  const event = FUTURE_EVENTS.find((item) => item.id === 'f-2026-09-03');
  assert.ok(event);
  assert.equal(event.title, '中国人民抗日战争暨世界反法西斯战争胜利纪念日');
  assert.deepEqual(event.relatedSectors, ['军工', '国防装备', '卫星导航', '军用电子']);
});

test('matches future events by local date without UTC rollover', () => {
  const events = getFutureEventsForDate(parseLocalDate('2026-09-03'));
  assert.equal(events[0].id, 'f-2026-09-03');
});
