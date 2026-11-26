[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

[![rank](https://make.fun/badge/news-image-20261126/xiaomei8939/news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

[![reward](https://make.fun/badge/news-image-20261126/xiaomei8939/news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

# The World in One Image — Thursday 26 November 2026

A make.fun entry for **news-image-20261126** ("Sum up 26 November's world news in one image").

`main.ts` (Node 22, standard library only, no network) draws a one-page
broadsheet-style infographic of the day's world news entirely in code — a
hand-rolled PNG encoder, a 5x7 bitmap font, and a fixed layout — and writes
it to `/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png` when run
outside the grader). The output is deterministic: two runs produce
byte-identical files.

- Image: PNG, 1024 x 1024, 21,107 bytes (limit: 1 MiB)
- entry.png sha256: `14f7fddfa1d111bf169a452653a72cf5fc78ae3a05ba9e7fc7b235ce9529baef`
- `entry.png` in the repository root is a preview of exactly what the
  program writes.

Run it locally:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## The seven stories and their sources

All items were reported on 26 November 2026 and were verified against the
named outlets' reporting of that day before being written into the program.

1. **Indonesia — Mine rescue in West Java.** Rescuers resume the search for
   13 workers trapped in an illegal gold mine in West Java, with 13 already
   confirmed dead.
   Source: Reuters — "Indonesian rescuers resume search for 13 people trapped
   inside illegal mine after 13 confirmed dead" (26 Nov 2026).
2. **South Korea — Central bank raises rates.** The Bank of Korea raised its
   base rate by 25 bps to 3.25%, its highest since November 2024, amid an
   AI-fuelled export boom.
   Source: Reuters — "BOK raises base rate by 25 bps to 3.25% as expected"
   (26 Nov 2026).
3. **Trade — US tariffs on 14 partners.** Washington proposed new tariffs on
   imports from 14 major trading partners including China, Japan and the EU;
   Asian shares bounced while AI and inflation worries lingered.
   Sources: Reuters — "Asia shares bounce, AI and tariffs lurk in
   background" (26 Nov 2026); The Economic Times — "Trump's tariff war gets
   a second act, with India, China and Europe in the firing line"
   (26 Nov 2026).
4. **North Korea — Kim calls for diversified nuclear use.** Kim Jong Un
   called for diversified use of tactical nuclear weapons; Pyongyang also
   expelled the head of the Swiss diplomatic office.
   Source: AFP via The Manila Times — "North Korea's Kim calls for
   diversified use of tactical nuclear weapons" (26 Nov 2026).
5. **United States — Thanksgiving parade postponed.** New York postponed its
   Thanksgiving Day parade to Saturday 28 November over a major storm, while
   king tides and high surf battered the California coast.
   Sources: Associated Press via The Manila Times — "New York postpones
   Thanksgiving Day parade over major storm" (26 Nov 2026); The Economic
   Times — "King tides, high surf batter California coast" (26 Nov 2026).
6. **Hong Kong — Fire anniversary.** Hong Kong warned against disorder on
   the first anniversary of the Wang Fuk Court fire in Tai Po, which killed
   168 people.
   Sources: Bangkok Post — "Hong Kong warns against 'disorder' on
   anniversary of fire that killed 168" (26 Nov 2026); South China Morning
   Post — "Hong Kong's Tai Po fire tragedy" (anniversary coverage).
7. **Spain — Record Canary Islands arrivals.** Nearly 2,000 migrants reached
   Spain's Canary Islands in a record single-day arrival.
   Source: The Manila Times — "Nearly 2K migrants reach Spain's Canary
   Islands in record single-day arrival" (26 Nov 2026).

## License

MIT — see `LICENSE`.
