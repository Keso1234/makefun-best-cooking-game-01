# makefun-best-cooking-game-01

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/Keso1234/makefun-best-cooking-game-01/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/Keso1234/makefun-best-cooking-game-01/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

Sizzle & Serve is a complete cooking game: run the Sunny Skillet Kitchen through the lunch rush, taking customer orders, chopping and grilling ingredients, building dishes on the plate and serving them before their timers run out.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser.

## How to play

- Click an order ticket (or the ticket itself) to choose which dish to build.
- Click an ingredient on the counter, or press keys 1–6: it goes to a prep station to be chopped, grilled or wrapped.
- Click a prep item when it turns green and says READY to add it to your plate.
- The plate shows the recipe slots for the selected order — fill them all, then press Space or the big SERVE button to serve.
- Serve fast for a speed bonus and chain serves for combos. Orders expire, and three missed orders end the shift; the shift timer is 2 minutes 30 seconds, and every 5 dishes served raises the level, speeds orders up and shortens their timers.
- T clears the plate, P pauses, M mutes the synthesised sounds, R restarts after the shift ends.

All art is drawn in code and all sound is synthesised with WebAudio — the game plays fully offline from the static files under `game/`, with no network requests and no external assets.

---

<sub>Entered on [make.fun](https://make.fun/?ref=taaana65&utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
