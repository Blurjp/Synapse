#!/usr/bin/env python3
"""Generate Product Hunt promo video for NovelWriter using image frames + ffmpeg."""
import subprocess, os, json
from PIL import Image, ImageDraw, ImageFont

OUT = '/Users/jianpinghuang/.openclaw/workspace/novelwriter-assets'
TMP = os.path.join(OUT, 'tmp')
os.makedirs(TMP, exist_ok=True)

W, H = 1280, 720
BG = (11, 15, 20)       # #0b0f14
WHITE = (255, 255, 255)
GRAY = (156, 163, 175)  # #9ca3af
PURPLE = (167, 139, 250) # #a78bfa

# Try to find a good font
font_paths = [
    '/System/Library/Fonts/Helvetica Neue.ttc',
    '/System/Library/Fonts/SFNSDisplay.ttf', 
    '/System/Library/Fonts/SFNSText.ttf',
    '/Library/Fonts/Arial.ttf',
    '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
]
FONT_BOLD = None
FONT_REG = None
for p in font_paths:
    if os.path.exists(p):
        FONT_BOLD = p
        FONT_REG = p
        break

if not FONT_BOLD:
    FONT_BOLD = '/System/Library/Fonts/SFNSText.ttf'
    FONT_REG = '/System/Library/Fonts/SFNSText.ttf'

def make_frame(filename, draw_func):
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw_func(img, draw)
    img.save(os.path.join(TMP, filename))
    return filename

def center_text(draw, text, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)

def draw_centered_multiline(draw, lines, start_y, font, fill, line_height=40):
    total_h = len(lines) * line_height
    y = start_y - total_h // 2
    for line in lines:
        center_text(draw, line, y, font, fill)
        y += line_height

# Load fonts
try:
    font_title = ImageFont.truetype(FONT_BOLD, 56)
    font_subtitle = ImageFont.truetype(FONT_REG, 28)
    font_feature = ImageFont.truetype(FONT_BOLD, 48)
    font_body = ImageFont.truetype(FONT_REG, 24)
    font_cta = ImageFont.truetype(FONT_REG, 22)
except:
    font_title = ImageFont.load_default()
    font_subtitle = font_feature = font_body = font_cta = font_title

frames = []

###############################################################################
# Frame 1: Logo + Title
###############################################################################
def f1(img, draw):
    # Draw logo (copy from existing)
    try:
        logo = Image.open(os.path.join(OUT, 'ph-07-logo.png')).resize((150, 150))
        img.paste(logo, ((W-150)//2, (H-150)//2 - 100), logo if logo.mode == 'RGBA' else None)
    except: pass
    center_text(draw, 'NovelWriter', (H//2)+50, font_title, WHITE)
    center_text(draw, 'Turn story sparks into vivid novels', (H//2)+120, font_subtitle, GRAY)

frames.append((make_frame('f01.png', f1), 3))

###############################################################################
# Frame 2: Editor screenshot
###############################################################################
def f2(img, draw):
    try:
        editor = Image.open(os.path.join(OUT, 'ph-06-editor-screenshot.png'))
        # Scale to fit with padding
        editor = editor.resize((1160, 653), Image.LANCZOS)
        img.paste(editor, (60, 67))
    except: pass

frames.append((make_frame('f02.png', f2), 4))

###############################################################################
# Frames 3-7: Features
###############################################################################
features = [
    ('✍️  AI Novel Writing', [
        'Smart chapter continuation,',
        'genre-aware story planning,',
        'and bilingual support (EN & ZH)'
    ]),
    ('🎨  Auto Illustrations', [
        'AI-generated scene art',
        'and book covers in',
        'multiple styles'
    ]),
    ('🎙️  Voice Narration', [
        'Turn any chapter into',
        'natural-sounding audio',
        'with TTS'
    ]),
    ('👤  Rich Characters', [
        'Build characters with',
        'motivations, secrets,',
        'and evolving relationships'
    ]),
    ('📖  Story Templates', [
        'Romance, fantasy, thriller,',
        'sci-fi & more — start from',
        'a premise, trope, or outline'
    ]),
]

for i, (title, desc) in enumerate(features, 3):
    def make_feat(img, draw, t=title, d=desc):
        center_text(draw, t, (H//2)-100, font_feature, WHITE)
        for j, line in enumerate(d):
            center_text(draw, line, (H//2)-10 + j*40, font_body, GRAY)
    frames.append((make_frame(f'f{i:02d}.png', make_feat), 3))

###############################################################################
# Frame 8: Login page screenshot
###############################################################################
def f8(img, draw):
    try:
        login = Image.open(os.path.join(OUT, 'py-05-login.png')).resize((W, H), Image.LANCZOS)
        img.paste(login, (0, 0))
    except: pass

frames.append((make_frame('f08.png', f8), 2))

###############################################################################
# Frame 9: Pricing page screenshot
###############################################################################
def f9(img, draw):
    try:
        pricing = Image.open(os.path.join(OUT, 'py-07-pricing.png')).resize((W, H), Image.LANCZOS)
        img.paste(pricing, (0, 0))
    except: pass

frames.append((make_frame('f09.png', f9), 3))

###############################################################################
# Frame 10: CTA
###############################################################################
def f10(img, draw):
    center_text(draw, 'NovelWriter', (H//2)-120, font_title, WHITE)
    center_text(draw, 'Turn story sparks into vivid novels', (H//2)-30, font_subtitle, GRAY)
    center_text(draw, 'with richer characters, plots, and worlds.', (H//2)+10, font_subtitle, GRAY)
    # Draw a CTA button
    btn_w, btn_h = 360, 56
    btn_x, btn_y = (W-btn_w)//2, (H//2)+70
    draw.rounded_rectangle([btn_x, btn_y, btn_x+btn_w, btn_y+btn_h], radius=28, fill=(124, 58, 237))
    center_text(draw, 'Start Writing Free →', btn_y+14, font_cta, WHITE)
    center_text(draw, 'No credit card required · 10K free tokens', (H//2)+150, font_cta, GRAY)

frames.append((make_frame('f10.png', f10), 3))

###############################################################################
# Generate video with ffmpeg
###############################################################################
print('\n🎬 Generating video...')

# Create individual mp4 clips from frames
clip_files = []
for i, (frame_file, duration) in enumerate(frames):
    clip_name = f'clip{i:02d}.mp4'
    clip_path = os.path.join(TMP, clip_name)
    frame_path = os.path.join(TMP, frame_file)
    
    cmd = [
        'ffmpeg', '-y', '-loop', '1', '-i', frame_path,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-t', str(duration), '-r', '30',
        clip_path
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f'  ❌ Failed: {frame_file}: {result.stderr[-200:]}')
    else:
        print(f'  ✅ {frame_file} → {clip_name} ({duration}s)')
        clip_files.append(clip_name)

# Concatenate
filelist_path = os.path.join(TMP, 'filelist.txt')
with open(filelist_path, 'w') as f:
    for clip in clip_files:
        f.write(f"file '{clip}'\n")

output_path = os.path.join(OUT, 'novelwriter-ph-promo.mp4')
cmd = [
    'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
    '-i', filelist_path,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    output_path
]
result = subprocess.run(cmd, capture_output=True, text=True)
if result.returncode == 0:
    size = os.path.getsize(output_path)
    print(f'\n🎉 Video saved: {output_path} ({size/1024:.0f} KB)')
else:
    print(f'\n❌ Concat failed: {result.stderr[-500:]}')

# Also save individual frames as PH gallery images
print('\n📸 Product Hunt Gallery Images:')
gallery_dir = os.path.join(OUT, 'gallery')
os.makedirs(gallery_dir, exist_ok=True)

# Best picks for PH gallery
gallery_picks = {
    '01-hero.png': 'Landing page hero',
    '02-editor.png': 'AI novel editor',
    '03-ai-writing.png': 'AI writing feature',
    '04-illustrations.png': 'Auto illustrations',
    '05-voice.png': 'Voice narration',
    '06-characters.png': 'Character builder',
    '07-templates.png': 'Story templates',
    '08-pricing.png': 'Pricing plans',
}

for i, (name, desc) in enumerate(gallery_picks.items()):
    src_idx = min(i+1, len(frames)-1)
    src = os.path.join(TMP, frames[src_idx][0])
    dst = os.path.join(gallery_dir, name)
    try:
        img = Image.open(src)
        img.save(dst)
        print(f'  ✅ {name} — {desc} ({img.size[0]}x{img.size[1]})')
    except Exception as e:
        print(f'  ❌ {name}: {e}')

print('\nDone! 🚀')
