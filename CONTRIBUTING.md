# Contributing to Genesis 2, The Garden

Pull requests are welcome: bug fixes, documentation, tests, new scene ideas and tooling.

Every pull request needs an approving review from Shane Fisher (@omiron33), the code owner, before it can be merged. `main` is protected, so please work on a branch or a fork and open a pull request against `main`.

## Run it

You need Node.js 22 or newer and FFmpeg. The song goes at `audio/genesis2-the-garden.wav` and is not in this repository (see `audio/README.md`).

```sh
npm ci
npm run stills     # preview frames into out/stills
npm run render     # full film, 1080p60
```

For quick drafts use `--samples 2 --scale .5`. To change which scene goes with which lines, edit `tools/build.py` and run `npm run build` (Python 3). To change how a scene looks, edit `scenes/garden.mjs`.

## Before you open a pull request

- Keep pull requests small and focused, and explain what you changed and how you checked it.
- For visual changes, render a still or a short clip and attach it to the pull request.
- Do not commit secrets, `.env` files, cookies, song recordings, full renders, or model weights. Large media stays out of git.
- Issues: use the bug report or feature request template.

## License

By contributing, you agree that your contributions are licensed under the repository's [MIT License](LICENSE). Fonts and third-party files keep their own notices.
