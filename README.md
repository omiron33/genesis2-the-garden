# Genesis 2 — The Garden

A 4:48 lyric film for a song setting of Genesis 2, drawn entirely in code. There are no photographs, no generated images and no generated video. Every frame is a pure function of the song's time.

## The idea

The whole world is one topographic height field, drawn as contour lines. Every scene is a different shape pressed into that same field, so each cut is a morph of the same lines rather than a hard edit:

- Rest on the seventh day: the ground freezes and flattens into long calm lines.
- "Holy": a seven-petal rosette with the word carved into it.
- No rain, no one to till it: cracked dry ground, healed ring by ring when the fountain rises.
- The man formed from dust: a sculpted figure assembles patch by patch out of the soil, then breathes, and its rings pulse with the beat.
- The garden: saplings rise as the view pans east, then an orchard seen from above.
- The trees of life and of knowing: drawn as their own cross-sections, as tree rings.
- The four rivers: they part from one source. Phisom circles a land that turns gold, carbuncle and emerald become a faceted crystal field, and Tigris and Euphrates run side by side.
- The forbidden tree: the lines refuse to cross it. On "surely die" the ground sinks into a hollow.
- The animals: a deer and a small herd rise as clay relief, and birds peel off the deer's back. On "He brought them all to Adam" everything spirals down a drain-like vortex and the man rises from its centre. The creatures are then named, and a procession follows.
- The deep sleep and the rib: the woman is shaped from the rib. The two figures share their rings, then melt into one flesh as a single smooth form.

The palette starts as muted umber and grows more vivid toward the creation of man and woman. From Eve onward it runs in rose, coral, magenta and gold.

Sung words appear exactly at their measured start. The sung word is highlighted, and each word sends a ripple through the ground. Beats and kicks measured from the audio drive small pulses.

## Contents

| Path | What it is |
| --- | --- |
| `scenes/garden.mjs` | All 46 scenes, the contour renderer, colour ramp, typography and transitions |
| `render/render.mjs` | Standalone renderer: stills, or video with sub-frame motion blur, piped to ffmpeg |
| `tools/build.py` | Builds `project.json` from the lyric lines: sections, scene per line, layout, beats |
| `tools/analyze.py` | Measures tempo (92.3 BPM), beats, kicks and loudness envelopes with numpy |
| `data/lyrics.txt` | The lyrics, adapted from the Brenton English Septuagint (public domain) |
| `data/words.json`, `data/lines.json` | Word-level timings from local forced alignment |
| `data/analysis.json` | Measured beats, kicks and envelopes |
| `fonts/` | EB Garamond Italic and Bebas Neue, SIL Open Font License |

## Render it

You need Node 22+, ffmpeg and the song as `audio/genesis2-the-garden.wav` (not included; see `audio/README.md`).

```sh
npm install
npm run stills          # a few preview frames into out/stills
npm run render          # full film, 1080p60, 12 motion-blur samples per frame
```

A full render is slow on one process. Because frames are independent, you can render ranges in parallel with `--from`/`--to` (in seconds) and join them with ffmpeg's concat demuxer. For quick drafts, use `--samples 2 --scale .5`.

To change the film, edit `tools/build.py` (which scene goes with which lines, and the layout and size of the text) or `scenes/garden.mjs` (how a scene looks), then run `npm run build` and render again.

## Notes

- Word timings are machine forced-alignment estimates. The final word, "shame", was clamped to 273.6 s because the aligner stretched it into the instrumental ending.
- Made with Claude (Opus 5.5) in Claude Code.

Code: MIT. Fonts: SIL OFL 1.1 (see `fonts/`). Lyrics: public-domain scripture text, adapted.
