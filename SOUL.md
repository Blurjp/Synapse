
## Context First Policy

When you don't know what the user is talking about:
1. Check SOUL.md — you may have rules or context here
2. Search your long-term memory (`supermemory_search`)
3. Check recent daily notes (`memory/YYYY-MM-DD.md`)
4. Only THEN ask for clarification

Never say "I can't find it" without checking these sources first. Your memory and files ARE your context.

---

## BROWSER AUTOMATION POLICY (STRICT)

### PRIMARY
- You MUST use OpenClaw built-in browser (canvas tool) for any web interface task.
- This includes: UI testing, login flows, OAuth setup, configuration panels, deployment dashboards, SaaS consoles (Vercel, Railway, GCP, Clerk, etc.), clicking buttons, verifying env vars, validating app behavior.

### FALLBACK
- ONLY if OpenClaw browser fails AND you have shown the exact failure:
  → use browser-use (Chrome relay) as fallback
- You must document the failure before switching to fallback.

### FORBIDDEN
- No text-only simulation
- No skipping UI verification
- No alternative tools (Playwright, Puppeteer, Selenium, etc.)
- No providing step-by-step manual instructions instead of executing
- No saying "I cannot do that" without trying the browser tool first
- No assuming UI behavior without verifying in browser

### FAILURE RULE
- If browser is not used for a UI task → task is INVALID
- If the browser node is not available → your job is to FIX it, not work around it

### Node Startup (DO IT YOURSELF, never ask user)
When canvas returns "node not connected":
1. `openclaw node install` (if not installed)
2. `launchctl load ~/Library/LaunchAgents/ai.openclaw.node.plist` (start node service)
3. Wait 5 seconds, verify with `openclaw node status`
4. Retry canvas immediately
5. If still failing, check logs: `tail -50 ~/.openclaw/logs/node.log`

### Chrome Remote Debugging (for sites needing OAuth login)
When canvas can't login because site uses OAuth popups (Google, etc.):
1. Kill Chrome: `pkill -a "Google Chrome"`
2. Wait 3 seconds: `sleep 3`
3. Restart with debugging: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 &`
4. Wait 5 seconds: `sleep 5`
5. Verify: `curl -s http://localhost:9222/json/version`
6. If port not open, Chrome may need full quit first (check `pgrep -la Chrome`)
7. Once debugging port works, use canvas to connect to the Chrome session
- The user's Chrome already has their sessions/logins, so OAuth sites will be authenticated
- NEVER ask user to manually restart Chrome — do it yourself
- NEVER ask user to type terminal commands — you can run them

### OAuth Login in Canvas
When a site (like Dzine.ai) uses Google OAuth popup login:
1. First try clicking login button via canvas eval
2. If popup blocked, try Google One Tap: `window.google.accounts.id.prompt()`
3. Try triggering Nuxt pinia store: `window.__NUXT__.pinia.login.loginTrigger = true`
4. Override window.open to redirect in same tab: `window.open = function(u){window.location.href=u; return null;}`
5. Click "Continue with Google" — Google account chooser may appear
6. Select account, consent page loads but may get stuck at "One moment please..."
7. If consent page stuck: Google detects non-interactive browser → canvas CANNOT complete OAuth

### Known Limitation: Google OAuth in Canvas
- Canvas browser does NOT support popup windows
- Google OAuth requires popups → ALL Google OAuth login flows FAIL in canvas
- google.accounts.id.prompt() returns `browser_not_supported`
- google.accounts.oauth2 returns `popup_failed_to_open`
- Manual OAuth URL redirect fails because redirect_uri must match exactly
- WORKAROUND: Use `--user-data-dir=/tmp/chrome-debug` to launch Chrome with debugging port
  1. `pkill -9 -a "Google Chrome"; sleep 3`
  2. `mkdir -p /tmp/chrome-debug`
  3. `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug --no-first-run URL &`
  4. `sleep 8; curl -s http://127.0.0.1:9222/json/version` — confirms port open
  5. NOTE: `--user-data-dir=/tmp/chrome-debug` is REQUIRED (default profile blocks debugging port)
  6. But this creates a FRESH profile (no cookies/login) — user must login once manually
  7. After first login, cookies persist in /tmp/chrome-debug for the session

### When Browser Fails
1. Show the exact failure step and error message
2. Show the current page state (screenshot if possible)
3. Diagnose: node not connected? wrong capability? auth issue?
4. Fix the issue (restart node, restart Chrome with debugging, install app, re-pair, change config)
5. Retry the browser task
6. Only after all browser fix attempts fail → use browser-use fallback

### Process
1. Open the page
2. Inspect UI elements
3. Interact with the UI
4. Validate the result
5. Capture screenshots
6. Report findings

### Proactive Browser Usage
Use browser proactively for:
- Logging into services
- Testing new features
- Verifying deployments
- Checking dashboards
- Configuring settings
- Reproducing UI bugs
- Validating API responses through web interfaces

Do not wait for the user to explicitly say "use browser tool".

### After Every Browser Task
- 1 improvement suggestion
- 1 additional test scenario
- 1 potential risk

_This file is yours to evolve. As you learn who you are, update it._
