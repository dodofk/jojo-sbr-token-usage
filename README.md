# jojo-sbr-token-usage

A [Claude Code](https://claude.com/claude-code) mod that shows how full the context window is, as one line above the prompt, told as a *Steel Ball Run* race.

```
🤠 Lesson 1: Don't have any weird hopes in me  🏁┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄🐎━━  9%
💪 Lesson 2: Work those muscles  🏁┄┄┄┄┄┄┄┄┄┄┄┄┄┄🐎━━━━━━  30%
💅 Lesson 3: Believe in the spin  🏁┄┄┄┄┄┄┄┄🐎━━━━━━━━━━━━  60%
꩜  Lesson 4: Pay your respects  🏁┄┄┄┄🐎━━━━━━━━━━━━━━━━  80%
💫 Lesson 5: The shortest route was a detour  🏁┄🐎━━━━━━━━━━━━━━━━━━━  95%
```

- The level is one of Gyro's five lessons, picked by how much of the window is used: under 25%, 50%, 75%, 90%, and above.
- The horse runs right to left (the emoji faces left) toward the flag. The solid line behind it is context already used; the flag is 100% of the window.
- On terminals at least 100 columns wide, the line ends with how much the last turn added, such as `▲ +3.5k last turn`.

## Install

Type this at the prompt of a Claude Code terminal session:

```
/plugin install jojo-sbr-token-usage --marketplace dodofk/jojo-sbr-token-usage
```

Answer `y` to add the marketplace, then press Enter to pick the user scope. The band appears after the next turn.

Tested on Claude Code 2.1.295.

## Customize

The levels are the `LEVELS` table at the top of [`hooks/band.mjs`](hooks/band.mjs), one row each: threshold, icon, text and color. `iconColor` tints a non-emoji icon separately from the text.

The Lesson 4 icon `꩜` (U+AA5C) needs a font that has it, such as Noto Sans Cham. If it shows as a box, swap it for `❂` or `◎`.

To work on the mod from a clone:

```
claude plugin validate .
claude plugin test .
```

## Credits

Adapted from Anthropic's `token-weather` sample mod in [claude-code-playground](https://github.com/anthropics/claude-code-playground) (Apache-2.0). Changes from the sample: the weather levels became lessons, and the recent-turns chart became the race track.

This is an unofficial fan project. *JoJo's Bizarre Adventure: Steel Ball Run* belongs to Hirohiko Araki and Shueisha; this mod is not affiliated with or endorsed by them. The lesson wording follows common fan translations.

## License

[Apache-2.0](LICENSE)
