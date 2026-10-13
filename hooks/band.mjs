// Adapted from token-weather, Copyright 2026 Anthropic PBC
// SPDX-License-Identifier: Apache-2.0
//
// jojo-sbr-token-usage: how full the context window is, as one line above the prompt,
// told as a Steel Ball Run race: the levels are Gyro's five lessons, from
// Lesson 1 on an empty window to Lesson 5 when a compaction is near.
//
// turn.complete: after each main-loop turn, read the context window's fill
// from $.session.usage() (the same figures the status line shows) and keep
// the last HISTORY readings.
// session.start: take a first reading, so the band shows before any turn.
// ui.render (AbovePrompt): one line: icon, the level's word, a race track with
// a horse running toward the finish flag, percent, and the last turn's change.
//
// The host reads on(...) and $.noun.method(...) from source, so they are
// spelled literally, and helpers that take $ are top-level functions.

const HISTORY = 2;

// Levels, by percent of the window used. To re-theme the band, change the
// icon, word and color of each row; a color is a name or a hex. iconColor
// tints a non-emoji icon separately from the word.
const LEVELS = [
  { upTo: 25, icon: "🤠", word: "Lesson 1: Don't have any weird hopes in me", color: "#7BC47F" },
  { upTo: 50, icon: "💪", word: "Lesson 2: Work those muscles", color: "#F6AE2D" },
  { upTo: 75, icon: "💅", word: "Lesson 3: Believe in the spin", color: "#E8C547" },
  { upTo: 90, icon: "꩜ ", iconColor: "#FFC93C", word: "Lesson 4: Pay your respects", color: "#F4A6C0" },
  { upTo: Infinity, icon: "💫", word: "Lesson 5: The shortest route was a detour", color: "#FF5F5F" },
];

// Readings: { tokens, window, percent }, oldest first.
let readings = [];

export function register(on) {
  on("session.start", async ($, e, next) => {
    const result = await next(e);
    readings = [];
    await takeReading($);
    return result;
  });

  on("turn.complete", async ($, e, next) => {
    const result = await next(e);
    if (e.agentId) {
      return result;
    }
    await takeReading($);
    return result;
  });

  on("ui.render", { component: "AbovePrompt" }, ($, e, next) => {
    if (e.props.hasSurvey || readings.length === 0) {
      return next(e);
    }
    const { Box, Text } = $.ui.resolve(e);
    return band(Box, Text, e.props.bodyColumns ?? 80);
  });
}

async function takeReading($) {
  try {
    const { context } = await $.session.usage();
    if (!context || !context.window) {
      return;
    }
    const tokens = context.tokens ?? 0;
    const percent = Math.round(context.percent ?? (tokens / context.window) * 100);
    // The session.start reading is 0 before any response; drop it once real readings arrive.
    readings = readings.filter((r) => r.tokens > 0);
    readings.push({ tokens, window: context.window, percent });
    if (readings.length > HISTORY) {
      readings = readings.slice(-HISTORY);
    }
    $.ui.invalidate("ui.render");
  } catch {
    // No reading this turn; the band keeps the last one.
  }
}

function band(Box, Text, columns) {
  const now = readings[readings.length - 1];
  const level = levelFor(now.percent);
  const trend = trendWord();
  // The horse emoji faces left, so the race runs right to left: the flag is
  // at the left end and the horse closes in on it as the window fills.
  const track = columns >= 80 ? 20 : 10;
  const behind = Math.max(0, Math.min(track, Math.round((now.percent / 100) * track)));
  const ahead = track - behind;
  const parts = [
    Text({ color: level.iconColor ?? level.color, bold: true, children: `${level.icon} ` }),
    Text({ color: level.color, bold: true, children: level.word }),
    Text({ dimColor: true, children: `  🏁${"┄".repeat(ahead)}` }),
    Text({ children: "🐎" }),
    Text({ color: level.color, children: `${"━".repeat(behind)}  ${now.percent}%` }),
  ];
  if (trend && columns >= 100) {
    parts.push(Text({ dimColor: true, children: `  ${trend}` }));
  }
  return Box({ flexDirection: "row", paddingX: 1, children: parts });
}

function levelFor(percent) {
  return LEVELS.find((level) => percent < level.upTo) ?? LEVELS[LEVELS.length - 1];
}

function trendWord() {
  if (readings.length < 2) {
    return "";
  }
  const delta = readings[readings.length - 1].tokens - readings[readings.length - 2].tokens;
  if (delta > 0) return `▲ +${short(delta)} last turn`;
  if (delta < 0) return `▼ ${short(-delta)} last turn`;
  return "steady";
}

function short(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}k`;
  return String(n);
}
