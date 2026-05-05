from playwright.sync_api import sync_playwright
import time, os

OUT = '/Users/jianpinghuang/.openclaw/workspace/novelwriter-assets'
BASE = 'https://www.senzia.fun'
os.makedirs(OUT, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    
    # === Desktop screenshots (1440x900) ===
    ctx = browser.new_context(viewport={'width': 1440, 'height': 900})
    page = ctx.new_page()
    
    # 1. Landing page hero
    print('📸 1/12 Landing hero...')
    page.goto(BASE, wait_until='networkidle', timeout=30000)
    time.sleep(5)
    page.screenshot(path=os.path.join(OUT, 'senzia-01-hero.png'))
    
    # 2. Landing full page
    print('📸 2/12 Landing full page...')
    page.screenshot(path=os.path.join(OUT, 'senzia-02-fullpage.png'), full_page=True)
    
    # 3. Features section (scroll down)
    print('📸 3/12 Features section...')
    page.goto(BASE, wait_until='networkidle', timeout=30000)
    time.sleep(3)
    page.evaluate('window.scrollTo(0, 800)')
    time.sleep(2)
    page.screenshot(path=os.path.join(OUT, 'senzia-03-features.png'))
    
    # 4. Pricing section on landing
    print('📸 4/12 Pricing cards...')
    page.evaluate('window.scrollTo(0, 2000)')
    time.sleep(2)
    page.screenshot(path=os.path.join(OUT, 'senzia-04-pricing-cards.png'))
    
    # 5. Login page
    print('📸 5/12 Login page...')
    page.goto(f'{BASE}/login', wait_until='networkidle', timeout=20000)
    time.sleep(4)
    page.screenshot(path=os.path.join(OUT, 'senzia-05-login.png'))
    
    # 6. Signup page
    print('📸 6/12 Signup page...')
    page.goto(f'{BASE}/signup', wait_until='networkidle', timeout=20000)
    time.sleep(4)
    page.screenshot(path=os.path.join(OUT, 'senzia-06-signup.png'))
    
    # 7. Pricing page
    print('📸 7/12 Pricing page...')
    page.goto(f'{BASE}/pricing', wait_until='networkidle', timeout=20000)
    time.sleep(4)
    page.screenshot(path=os.path.join(OUT, 'senzia-07-pricing.png'), full_page=True)
    
    # 8. Welcome/stories page (public)
    print('📸 8/12 Stories page...')
    page.goto(f'{BASE}/stories', wait_until='networkidle', timeout=20000)
    time.sleep(4)
    page.screenshot(path=os.path.join(OUT, 'senzia-08-stories.png'))
    
    ctx.close()
    
    # === Mobile screenshots (390x844) ===
    mctx = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
    mpage = mctx.new_page()
    
    print('📸 9/12 Mobile hero...')
    mpage.goto(BASE, wait_until='networkidle', timeout=30000)
    time.sleep(5)
    mpage.screenshot(path=os.path.join(OUT, 'senzia-09-mobile-hero.png'))
    
    print('📸 10/12 Mobile full...')
    mpage.screenshot(path=os.path.join(OUT, 'senzia-10-mobile-full.png'), full_page=True)
    
    print('📸 11/12 Mobile login...')
    mpage.goto(f'{BASE}/login', wait_until='networkidle', timeout=20000)
    time.sleep(3)
    mpage.screenshot(path=os.path.join(OUT, 'senzia-11-mobile-login.png'))
    
    print('📸 12/12 Mobile pricing...')
    mpage.goto(f'{BASE}/pricing', wait_until='networkidle', timeout=20000)
    time.sleep(3)
    mpage.screenshot(path=os.path.join(OUT, 'senzia-12-mobile-pricing.png'), full_page=True)
    
    mctx.close()
    browser.close()

# Summary
print('\n✅ All screenshots saved:')
for f in sorted(os.listdir(OUT)):
    if f.startswith('senzia-'):
        fpath = os.path.join(OUT, f)
        size = os.path.getsize(fpath)
        print(f'  {f} ({size//1024}KB)')
