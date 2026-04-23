/**
 * MRC Scheduling Dashboard — Calendar Parser
 * Parses raw Outlook MCP list-events text into structured event objects.
 *
 * Usage:
 *   const events = parseCalendarText(rawText);
 *
 * Returns array of:
 *   { title, dateStr, startTime, endTime, isAllDay, location, zoomUrl, type }
 *
 * type: "zoom" | "inperson" | "personal" | "business"
 */

const MONTH_IDX = {
  Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5,
  Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11
};

function pad2(n) { return String(n).padStart(2, '0'); }

function toDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
}

/**
 * Classify an event by type.
 * Override PERSONAL_KEYWORDS for your exec's calendar (kids names, routines, etc.)
 */
function classifyEvent(title, location, zoomUrl, personalKeywords = []) {
  const tl = title.toLowerCase();
  const ll = (location || '').toLowerCase();

  const defaultPersonal = [
    'birthday','dinner','party','soccer','basketball','tennis',
    'pt','trainer','coach','school','lunch','family'
  ];
  const allPersonal = [...defaultPersonal, ...personalKeywords.map(k => k.toLowerCase())];

  if (allPersonal.some(w => tl.includes(w))) return 'personal';
  if (zoomUrl || ll.includes('zoom.us') || ll.includes('meet.google') || ll.includes('teams.microsoft')) return 'zoom';
  if (location && (location.match(/\d{3,}/) || ll.includes('office') || ll.includes(' rd') ||
      ll.includes('blvd') || ll.includes('ave,') || ll.includes('suite') || ll.includes('floor'))) return 'inperson';
  return 'business';
}

function parseCalendarText(text, personalKeywords = []) {
  const events = [];
  const yr = new Date().getFullYear();

  // Split on numbered event boundaries
  const blocks = text.split(/\n(?=\d+\.\s)/);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    // Title
    const tm = lines[0].match(/^\d+\.\s+(.+)$/);
    if (!tm) continue;
    const title = tm[1];

    // Date / time  (line 1 of block)
    const dtLine = lines[1];
    let dateStr = null, startTime = null, endTime = null, isAllDay = false;

    // Timed: "Mon, Apr 27 · 11:30 AM [optional label] – 12:00 PM"
    const timedRe = /(\w{3}),\s+(\w{3})\s+(\d+)\s+·\s+(\d+):(\d+)\s+(AM|PM)(?:\s+\([^)]*\))?\s+[–\-]\s+(\d+):(\d+)\s+(AM|PM)/;
    const tm2 = dtLine.match(timedRe);

    // All-day (single or multi-day range)
    const alldayRe = /(\w{3}),\s+(\w{3})\s+(\d+)(?:\s+[–\-]\s+\w+,\s+\w+\s+\d+)?\s+\(All day\)/;
    const am = dtLine.match(alldayRe);

    if (tm2) {
      const [,, mon, day, sh, sm, sampm, eh, em, eampm] = tm2;
      const d = new Date(yr, MONTH_IDX[mon], parseInt(day));
      dateStr = toDateStr(d);

      let h = parseInt(sh);
      if (sampm === 'PM' && h !== 12) h += 12;
      if (sampm === 'AM' && h === 12) h = 0;
      startTime = `${pad2(h)}:${sm}`;

      let eh2 = parseInt(eh);
      if (eampm === 'PM' && eh2 !== 12) eh2 += 12;
      if (eampm === 'AM' && eh2 === 12) eh2 = 0;
      endTime = `${pad2(eh2)}:${em}`;
    } else if (am) {
      const [,, mon, day] = am;
      const d = new Date(yr, MONTH_IDX[mon], parseInt(day));
      dateStr = toDateStr(d);
      isAllDay = true;
    } else {
      continue; // Unparseable date — skip
    }

    // Location + Zoom URL
    let location = null, zoomUrl = null;
    for (const ln of lines.slice(2)) {
      if (ln.startsWith('Location:')) {
        location = ln.slice(9).trim();
        const zm = location.match(/https?:\/\/[^\s]*zoom[^\s]*/i);
        if (zm) zoomUrl = zm[0];
      }
    }

    const type = classifyEvent(title, location, zoomUrl, personalKeywords);
    events.push({ title, dateStr, startTime, endTime, isAllDay, location, zoomUrl, type });
  }

  return events;
}

// ── Time utilities ────────────────────────────────────────────────────────────

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${ap}` : `${h12}:${pad2(m)}${ap}`;
}

function toMins(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToStr(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  const ap = h >= 12 ? 'pm' : 'am', h12 = h % 12 || 12;
  return m === 0 ? `${h12}${ap}` : `${h12}:${pad2(m)}${ap}`;
}

function durLabel(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Find open scheduling windows for a given set of events.
 * @param {object[]} evs - parsed events for a single day
 * @param {number} windowStart - earliest minute (default 660 = 11am)
 * @param {number} windowEnd   - latest minute (default 1080 = 6pm)
 */
function openWindows(evs, windowStart = 660, windowEnd = 1080) {
  const busy = evs
    .filter(e => !e.isAllDay && e.startTime && e.type !== 'personal')
    .map(e => ({ s: toMins(e.startTime), e: toMins(e.endTime || e.startTime) }))
    .sort((a, b) => a.s - b.s);

  const windows = [];
  let cur = windowStart;
  for (const b of busy) {
    if (b.s > cur + 29) windows.push({ s: cur, e: b.s });
    cur = Math.max(cur, b.e);
  }
  if (cur < windowEnd - 29) windows.push({ s: cur, e: windowEnd });
  return windows;
}

function hasConflict(ev, all) {
  if (ev.isAllDay || !ev.startTime) return false;
  const s = toMins(ev.startTime), e = toMins(ev.endTime || ev.startTime);
  return all.some(o =>
    o !== ev && !o.isAllDay && o.startTime &&
    toMins(o.startTime) < e && toMins(o.endTime || o.startTime) > s
  );
}
