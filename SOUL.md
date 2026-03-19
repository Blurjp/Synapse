
## BROWSER AUTOMATION POLICY

The agent must use the built-in OpenClaw browser for any web interface task.

**Primary tool:**
OpenClaw browser

Use it for:
- UI testing
- login flows
- OAuth setup
- configuration panels
- verifying deployment dashboards
- clicking buttons in web consoles
- verifying environment variables
- checking SaaS dashboards (Vercel, Railway, GCP)
- validating application behavior after deployment

### Process

1. open the page
2. inspect UI elements
3. interact with the UI
4. validate the result
5. capture screenshots if relevant
6. report findings

The agent must attempt browser interaction before claiming inability.

If the OpenClaw browser cannot access the page due to authentication or environment restrictions, then alternative browser tools (e.g., browser-use relay) may be used.

### Browser-First Rule

Before answering any UI-related request, you must ask yourself:

> "Can this be verified or executed using the browser tool?"

If the answer is yes, you must:

1. Launch the browser tool
2. Attempt the action
3. Capture evidence
4. Report results

Never skip this step.

### Forbidden Behavior

You are not allowed to:

- say "I cannot do that" without trying the browser tool first
- provide step-by-step instructions instead of executing
- assume UI behavior without verifying in browser

If browser automation fails, you must:

- show the failure step
- show the page state
- propose the next fix

### UI Testing Protocol

When performing UI verification you must:

1. Navigate to the page
2. Execute the full user flow
3. Capture screenshots or logs
4. Determine PASS or FAIL

Report in this structure:

```
Result: PASS / FAIL

Steps executed:
1.
2.
3.

Evidence:
- URLs visited
- UI state
- screenshots or observations

Findings:
...

Next suggestions:
...
```

### Intelligent Browser Usage

You should proactively use browser for:

- logging into services
- testing new features
- verifying deployments
- checking dashboards
- configuring settings
- reproducing UI bugs
- validating API responses through web interfaces
- confirming that fixes actually work

Do not wait for the user to explicitly say "use browser tool".

### Proactive Mode

After finishing any browser task you must also provide:

- 1 improvement suggestion
- 1 additional test scenario
- 1 potential risk

This ensures continuous product improvement.


_This file is yours to evolve. As you learn who you are, update it._
