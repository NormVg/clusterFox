# Create Warning Audio File

The emergency system needs a `warning.mp3` file in this `public/` directory.

## Quick Options:

### Option 1: Download from Free Sources
1. Visit: https://pixabay.com/sound-effects/search/alarm/
2. Download a short alarm/warning sound (1-3 seconds)
3. Rename it to `warning.mp3`
4. Place it in `/public/` folder

### Option 2: Use macOS System Sound
```bash
# Convert macOS system sound to mp3
afconvert /System/Library/Sounds/Basso.aiff -d LEI16@44100 -f caff temp.caf && \
afconvert temp.caf -d aac -f mp4 -b 128000 warning.mp3 && \
rm temp.caf
```

### Option 3: Use Online Generator
1. Visit: https://www.zapsplat.com/sound-effect-category/alarms-and-sirens/
2. Download a free alarm sound
3. Rename to `warning.mp3` and place in `/public/`

## File Requirements:
- Format: MP3
- Name: `warning.mp3`
- Duration: 1-3 seconds recommended
- Quality: Any (will auto-adjust volume to 50%)

The audio will play once when an emergency is first detected.
