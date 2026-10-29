# Ikions social media kit

Everything needed to set up and run Ikions on social media: profile pictures, cover photos, posts, stories, logos and ready-made captions. Every graphic matches the website (same logo, colours, type and icons).

## What's inside

| Folder | File | Size | Use it for |
| --- | --- | --- | --- |
| `profile/` | `pfp-light.png` | 1080 × 1080 | Profile picture (main) |
| | `pfp-indigo.png` | 1080 × 1080 | Profile picture on busy feeds, app icons |
| | `pfp-dark.png` | 1080 × 1080 | Profile picture for dark themed pages |
| `covers/` | `facebook-cover-1640x624.png` | 1640 × 624 | Facebook page cover |
| | `x-header-1500x500.png` | 1500 × 500 | X (Twitter) header |
| | `linkedin-banner-1584x396.png` | 1584 × 396 | LinkedIn profile or page banner |
| | `youtube-banner-2560x1440.png` | 2560 × 1440 | YouTube channel art |
| | `github-social-preview-1280x640.png` | 1280 × 640 | GitHub repository social preview |
| `posts/` | `01-launch.png` … `09-showcase.png` | 1080 × 1080 | Instagram, Facebook and LinkedIn feed posts |
| `stories/` | `01-launch-story.png` … `03-install-story.png` | 1080 × 1920 | Instagram, Facebook and TikTok stories |
| `landscape/` | `01-launch-1200x675.png` … `03-free-1200x675.png` | 1200 × 675 | X, LinkedIn and Facebook link posts |
| `brand/` | `ikions-mark.svg` / `.png` | 1024 × 1024 | The "drift i" mark on transparent |
| | `ikions-logo-light.png` | 2000 × 600 | Full logo for light backgrounds |
| | `ikions-logo-dark.png` | 2000 × 600 | Full logo for dark backgrounds |
| | `ikions-wordmark.svg`, `ikions-wordmark-white.svg` | vector | Wordmark only |
| | | | |
| `captions.md` | | | Captions, hashtags and bios for every post |

## Setting up a profile

1. **Profile picture:** upload `profile/pfp-light.png`. Every platform crops it to a circle; the mark is centred so nothing gets cut.
2. **Cover photo:** upload the matching file from `covers/`. The X and LinkedIn covers keep their text to the right, clear of the profile photo that overlaps the lower left.
3. **Bio and link:** copy a bio from `captions.md` and set the website to **https://www.ikions.cloud**.

## Posting the feed

The nine square posts are designed as a 3 × 3 grid. Instagram shows the newest post first, so post them in reverse order to get the grid as designed:

`09-showcase` → `08-free` → `07-gradients` → `06-weather` → `05-code` → `04-frameworks` → `03-two-styles` → `02-numbers` → `01-launch`

A steady pace works best: one post every one or two days, plus a story on the same day. Each post has a caption in `captions.md`.

## Brand

| | |
| --- | --- |
| **Indigo** (accent) | `#5555E8` |
| **Ink** (text) | `#18191B` |
| **Grey** (secondary text) | `#6A6C72` |
| **Background** | `#FAFAF8` |
| **Dark background** | `#121316` |
| **Mark gradient** | `#7C6CFF` → `#5548EA` → `#3A2BC9` |
| **Dot gradient** | `#FF8AC2` → `#FFB25E` |
| **Typeface** | Geist (headings 600, text 400 to 500), JetBrains Mono for code |
| **Wordmark** | Sora SemiBold, already outlined in the files |

- Keep clear space around the logo equal to the height of the dot.
- Don't stretch, recolour or rotate the mark, and don't add effects to it.
- Use the light logo on light backgrounds and the dark one on dark backgrounds.

## Updating the kit

The graphics are generated from the website's real assets and live numbers (icon and category counts). When the library grows, regenerate everything:

```bash
pnpm build:packages
node socials/source/generate.mjs
```

The generator lives in `socials/source/generate.mjs`. It needs an internet connection while it runs, to load the Geist font. Update the numbers in `captions.md` too.
