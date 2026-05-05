#!/usr/bin/env python3
"""Rebuild Product Hunt promo video using production screenshots from senzia.fun."""
import subprocess, os
from PIL import Image, ImageDraw, ImageFont

OUT = '/Users/jianpinghuang/.openclaw/workspace/novelwriter-assets'
TMP = os.path.join(OUT, 'tmp2')
os.makedirs(TMP, exist_ok=True)

W, H = 1280, 720
BG = (11, 15, 20)
WHITE = (255, 255, 255)
GRAY = (156, 163, 175)
PURPLE = (167, 139, 250)
PINK = (244, 114, 182)

# Font setup
FONT_BOLD = '/System/Library/Fonts/Helvetica Neue.ttc'
FONT_REG = '/System/Library/Fonts/Helvetica Neue.ttc'

try:
    font_title = ImageFont.truetype(FONT_BOLD, 52)
    font_sub = ImageFont.truetype(FONT_REG, 26)
    font_feat = ImageFont.truetype(FONT_BOLD, 44)
    font_body = ImageFont.truetype(FONT_REG, 22)
    font_small = ImageFont.truetype(FONT_REG, 20)
    font_btn = ImageFont.truetype(FONT_BOLD, 22)
except:
    font_title = font_sub = font_feat = font_body = font_small = font_btn = ImageFont.load_default()

def center(draw, text, y, font, fill):
    bbox = draw.textbbox((0, 0), text, font=font)
    x = (W - (bbox[2] - bbox[0])) // 2
    draw.text((x, y), text, font=font, fill=fill)

def save_frame(name, func):
    img = Image.new('RGB', (W, H), BG)
    draw = ImageDraw.Draw(img)
    func(img, draw)
    path = os.path.join(TMP, name)
    img.save(path)
    return path

def clip(frame_path, duration, clip_name):
    out = os.path.join(TMP, clip_name)
    r = subprocess.run([
        'ffmpeg', '-y', '-loop', '1', '-i', frame_path,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-t', str(duration), '-r', '30', out
    ], capture_output=True)
    return out if r.returncode == 0 else None

clips = []

# 1. Title card (3s)
def f1(img, draw):
    try:
        logo = Image.open(os.path.join(OUT, 'ph-07-logo.png')).resize((120, 120))
        img.paste(logo, ((W-120)//2, (H-120)//2 - 80))
    except: pass
    center(draw, 'NovelWriter', (H//2)+40, font_title, WHITE)
    center(draw, 'Turn story sparks into vivid novels', (H//2)+105, font_sub, GRAY)
    center(draw, 'with richer characters, plots, and worlds', (H//2)+140, font_sub, GRAY)

p = save_frame('f01.png', f1)
c = clip(p, 3, 'c01.mp4')
if c: clips.append(c); print('✅ Title (3s)')

# 2. Hero from senzia.fun (5s)
def f2(img, draw):
    try:
        hero = Image.open(os.path.join(OUT, 'senzia-01-hero.png')).resize((W, H), Image.LANCZOS)
        img.paste(hero)
    except: pass

p = save_frame('f02.png', f2)
c = clip(p, 5, 'c02.mp4')
if c: clips.append(c); print('✅ Hero (5s)')

# 3. Features section (4s)
def f3(img, draw):
    try:
        feat = Image.open(os.path.join(OUT, 'senzia-03-features.png')).resize((W, H), Image.LANCZOS)
        img.paste(feat)
    except: pass

p = save_frame('f03.png', f3)
c = clip(p, 4, 'c03.mp4')
if c: clips.append(c); print('✅ Features (4s)')

# 4. AI Writing highlight (3s)
def f4(img, draw):
    # Gradient bar at top
    for i in range(6):
        draw.rectangle([(0, i*4), (W, (i+1)*4)], fill=(124+i*10, 58+i*15, 237))
    center(draw, '✍️  AI Novel Writing', 160, font_feat, WHITE)
    center(draw, 'Smart chapter continuation that keeps your plot coherent', 250, font_body, GRAY)
    center(draw, 'Genre-aware story planning & bilingual support (EN & ZH)', 285, font_body, GRAY)
    # Draw a mini mock editor
    draw.rounded_rectangle([140, 340, 1140, 600], radius=12, fill=(30, 35, 45))
    draw.rounded_rectangle([140, 340, 1140, 380], radius=12, fill=(40, 45, 55))
    draw.text((180, 352), 'Chapter 3 — The Awakening', font=font_small, fill=GRAY)
    for i in range(6):
        draw.text((180, 400 + i*28), '│ ' + '█' * (30 + i*5 - i*2), font=font_small, fill=(100+i*15, 100+i*10, 120+i*10))
    # Cursor blink
    draw.text((180, 568), '│ The morning light revealed something she had', font=font_small, fill=(180, 180, 200))
    draw.rectangle([(680, 568), (684, 590)], fill=WHITE)

p = save_frame('f04.png', f4)
c = clip(p, 3, 'c04.mp4')
if c: clips.append(c); print('✅ AI Writing (3s)')

# 5. Illustrations highlight (3s)
def f5(img, draw):
    for i in range(6):
        draw.rectangle([(0, i*4), (W, (i+1)*4)], fill=(237, 58+i*15, 124+i*10))
    center(draw, '🎨  Auto Illustrations', 160, font_feat, WHITE)
    center(draw, 'AI-generated scene art & book covers', 250, font_body, GRAY)
    center(draw, 'Multiple styles — anime, realistic, artistic', 285, font_body, GRAY)
    # Mini mock covers
    colors = [(80, 50, 120), (50, 80, 120), (120, 50, 80)]
    labels = ['Romance', 'Fantasy', 'Thriller']
    for i in range(3):
        x = 240 + i * 300
        draw.rounded_rectangle([x, 350, x+200, 550], radius=8, fill=colors[i])
        center(draw, labels[i], 430, font_body, WHITE)
        # Mini "AI generated" badge
        draw.rounded_rectangle([x+40, 500, x+160, 530], radius=4, fill=(40, 40, 40))
        center(draw, 'AI ✨', 505, font_small, PURPLE)

p = save_frame('f05.png', f5)
c = clip(p, 3, 'c05.mp4')
if c: clips.append(c); print('✅ Illustrations (3s)')

# 6. Characters highlight (3s)
def f6(img, draw):
    for i in range(6):
        draw.rectangle([(0, i*4), (W, (i+1)*4)], fill=(58, 124+i*10, 237+i*5))
    center(draw, '👤  Rich Character Building', 160, font_feat, WHITE)
    center(draw, 'Motivations, secrets, and evolving relationships', 250, font_body, GRAY)
    # Character cards mock
    chars = [
        ('Emily Green', 'Ambitious, Driven', (80, 50, 120)),
        ('James Carter', 'Mysterious, Intense', (50, 80, 100)),
        ('Sofia Nelson', 'Adventurous, Bold', (100, 50, 70)),
    ]
    for i, (name, trait, color) in enumerate(chars):
        x = 180 + i * 340
        draw.rounded_rectangle([x, 320, x+280, 520], radius=12, fill=(30, 35, 45))
        # Avatar circle
        draw.ellipse([x+100, 340, x+180, 420], fill=color)
        center(draw, name[:12], 430, font_small, WHITE)
        center(draw, trait, 460, font_small, GRAY)
        # Relationship line
        if i < 2:
            draw.line([(x+280, 420), (x+340, 420)], fill=PURPLE, width=2)

p = save_frame('f06.png', f6)
c = clip(p, 3, 'c06.mp4')
if c: clips.append(c); print('✅ Characters (3s)')

# 7. Stories page (3s)
def f7(img, draw):
    try:
        stories = Image.open(os.path.join(OUT, 'senzia-08-stories.png')).resize((W, H), Image.LANCZOS)
        img.paste(stories)
    except: pass

p = save_frame('f07.png', f7)
c = clip(p, 3, 'c07.mp4')
if c: clips.append(c); print('✅ Stories page (3s)')

# 8. Pricing from senzia.fun (4s)
def f8(img, draw):
    try:
        pricing = Image.open(os.path.join(OUT, 'senzia-07-pricing.png'))
        # Pricing page might be tall, so we center-crop to fit
        pw, ph = pricing.size
        if ph > H:
            top = (ph - H) // 2
            pricing = pricing.crop((0, top, pw, top + H))
        pricing = pricing.resize((W, H), Image.LANCZOS)
        img.paste(pricing)
    except: pass

p = save_frame('f08.png', f8)
c = clip(p, 4, 'c08.mp4')
if c: clips.append(c); print('✅ Pricing (4s)')

# 9. CTA (3s)
def f9(img, draw):
    center(draw, 'NovelWriter', 200, font_title, WHITE)
    center(draw, 'Turn story sparks into vivid novels', 280, font_sub, GRAY)
    center(draw, 'with richer characters, plots, and worlds', 315, font_sub, GRAY)
    # CTA button
    btn_w, btn_h = 340, 52
    btn_x, btn_y = (W-btn_w)//2, 390
    draw.rounded_rectangle([btn_x, btn_y, btn_x+btn_w, btn_y+btn_h], radius=26, fill=(124, 58, 237))
    center(draw, 'Start Writing Free →', btn_y+13, font_btn, WHITE)
    center(draw, 'Free to start · No credit card required', 470, font_small, GRAY)
    # App URL
    center(draw, 'senzia.fun', 520, font_small, PURPLE)

p = save_frame('f09.png', f9)
c = clip(p, 3, 'c09.mp4')
if c: clips.append(c); print('✅ CTA (3s)')

# Concatenate all clips
print('\n🎬 Concatenating clips...')
filelist = os.path.join(TMP, 'filelist.txt')
with open(filelist, 'w') as f:
    for c in clips:
        f.write(f"file '{os.path.basename(c)}'\n")

output = os.path.join(OUT, 'novelwriter-ph-promo.mp4')
r = subprocess.run([
    'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
    '-i', filelist, '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', output
], capture_output=True)

if r.returncode == 0:
    size = os.path.getsize(output)
    print(f'🎉 Video saved: {output} ({size//1024}KB)')
else:
    print(f'❌ Failed: {r.stderr[-500:]}')

# Also copy best gallery images
gallery = os.path.join(OUT, 'gallery')
os.makedirs(gallery, exist_ok=True)

gallery_map = {
    '01-hero-landing.png': 'senzia-01-hero.png',
    '02-fullpage.png': 'senzia-02-fullpage.png',
    '03-features.png': 'senzia-03-features.png',
    '04-pricing-cards.png': 'senzia-04-pricing-cards.png',
    '05-login.png': 'senzia-05-login.png',
    '06-signup.png': 'senzia-06-signup.png',
    '07-pricing-page.png': 'senzia-07-pricing.png',
    '08-stories.png': 'senzia-08-stories.png',
    '09-mobile-hero.png': 'senzia-09-mobile-hero.png',
    '10-mobile-full.png': 'senzia-10-mobile-full.png',
    '11-mobile-login.png': 'senzia-11-mobile-login.png',
    '12-mobile-pricing.png': 'senzia-12-mobile-pricing.png',
}

for dst, src in gallery_map.items():
    src_path = os.path.join(OUT, src)
    dst_path = os.path.join(gallery, dst)
    try:
        img = Image.open(src_path)
        img.save(dst_path)
        print(f'  ✅ {dst} ({img.size[0]}x{img.size[1]})')
    except Exception as e:
        print(f'  ❌ {dst}: {e}')

print('\n🚀 Done!')
