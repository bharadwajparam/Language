# Implementation Spec: Auto-Update Distribution Setup

## Objective
Set up the Language app for distribution to ~100 users with automatic updates, using GitHub Releases and electron-updater.

---

## Changes Required

### 1. Update `package.json` Build Configuration

**File:** `package.json`

**Current state:**
```json
"win": {
  "target": ["nsis"]
}
```

**Change to:**
```json
"win": {
  "target": ["portable"]
},
"publish": {
  "provider": "github",
  "owner": "bharadwajparam",
  "repo": "Language"
}
```

**Why:** Creates a portable `.exe` instead of an installer. The `publish` section tells electron-updater where to find releases.

---

### 2. Install electron-updater

**File:** `package.json` dependencies

**Action:** Add `electron-updater` to dependencies
```json
"dependencies": {
  "electron-updater": "^6.1.1"
}
```

**Command to run:** `npm install electron-updater`

---

### 3. Add Auto-Update Code to main.js

**File:** `main.js`

**Location:** After the existing imports (around line 5), add:
```javascript
const { autoUpdater } = require('electron-updater');
```

**Location:** In the `app.whenReady()` function (around line 70, after `createWindow()`), add:
```javascript
  // Check for updates
  autoUpdater.checkForUpdatesAndNotify();
```

**Result:** App will check for updates on startup and notify user if available.

---

### 4. Create GitHub Actions Workflow

**File:** `.github/workflows/build.yml` (new file)

**Content:**
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build app
        run: npm run dist
      
      - name: Upload to Release
        uses: softprops/action-gh-release@v1
        with:
          files: dist/**/*.exe
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Why:** Automatically builds the app and uploads to GitHub Releases when you create a version tag.

---

## Testing the Setup

### Local Test (Before Publishing)
1. Run `npm run dist` locally
2. Verify `.exe` is created in `dist/` folder
3. Run the `.exe` to ensure it works
4. Check the app console to verify no update errors

### Release Test (First Real Release)
1. Commit all changes
2. Create a git tag: `git tag v1.0.0`
3. Push tag: `git push origin v1.0.0`
4. Wait 2-3 minutes for GitHub Actions to complete
5. Go to GitHub Releases page and verify `.exe` is there
6. Download and test the `.exe`

---

## Release Process (Going Forward)

### To Release a New Version:

1. **Make code changes** and test locally
2. **Update version** in `package.json` (e.g., from `1.0.0` to `1.0.1`)
3. **Commit:** `git commit -m "Version 1.0.1 - bug fixes"`
4. **Tag:** `git tag v1.0.1`
5. **Push:** `git push origin main && git push origin v1.0.1`
6. **Wait:** GitHub Actions builds automatically (2-3 mins)
7. **Done:** Users get notified to update

---

## User Distribution

### First-Time Users
- Send them this link: `https://github.com/bharadwajparam/Language/releases`
- They download the latest `.exe`
- They run it

### Existing Users
- App checks for updates on startup
- If update available, they see a notification
- Click to update, app restarts with new version
- No manual download needed

---

## Files Modified/Created

| File | Action | Complexity |
|------|--------|-----------|
| `package.json` | Modify build config + add dependency | Low |
| `main.js` | Add 2 lines + 1 import | Low |
| `.github/workflows/build.yml` | Create new file | Low |

---

## Validation Checklist

- [ ] `package.json` has `"target": ["portable"]` in win section
- [ ] `package.json` has `"publish"` section with GitHub info
- [ ] `electron-updater` is in dependencies (verify with `npm list electron-updater`)
- [ ] `main.js` imports `autoUpdater` from electron-updater
- [ ] `main.js` calls `autoUpdater.checkForUpdatesAndNotify()` in app.whenReady()
- [ ] `.github/workflows/build.yml` exists and has correct structure
- [ ] Local `npm run dist` creates a working `.exe`
- [ ] First version tag successfully triggers GitHub Actions build
- [ ] `.exe` appears in GitHub Releases page

---

## Rollback Plan

If something breaks:
1. Don't create a new tag until fixed
2. The last successful release stays on GitHub
3. Users will use the last working version
4. Fix the issue locally and retry with a new version tag

---

## Notes

- Version number in `package.json` and git tag should match (e.g., `1.0.0` in both)
- Use semantic versioning: `major.minor.patch` (e.g., `1.0.0`, `1.0.1`, `1.1.0`)
- GitHub automatically uses the `.exe` filename and version tag for the release
- `electron-updater` handles checking GitHub Releases automatically
