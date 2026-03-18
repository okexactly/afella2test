# Character Layer Generator

This site stacks transparent image layers into one final character image.

## Folder order (bottom -> top)

- `bkg`
- `bkg overlay`
- `bkg overlay 2`
- `back`
- `character`
- `outfit`
- `accessory`
- `head`
- `left`
- `right`
- `top`

`all` is intentionally ignored.

## Run locally

1. Regenerate the manifest after adding/removing layer files:

```bash
source ~/.zprofile
node scripts/generate-manifest.mjs
```

2. Start a local server:

```bash
python3 -m http.server 8080
```

3. Open <http://localhost:8080>

## View from another device (same Wi-Fi/LAN)

1. Run:

```bash
./scripts/serve-lan.sh
```

2. On your phone/tablet/laptop (same network), open:

```text
http://YOUR_COMPUTER_IP:8080
```

If the page does not load, allow incoming connections for Python in macOS firewall settings.

## Publish on GitHub Pages (public internet URL)

1. Create a new empty GitHub repo in your browser.
2. In this project folder, add your remote and push:

```bash
git add .
git commit -m "Initial character layer generator"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

3. On GitHub, open your repo:
   - `Settings` -> `Pages`
   - `Build and deployment` -> `Source: Deploy from a branch`
   - `Branch: main` and folder `/ (root)` -> `Save`

4. Wait 1-3 minutes, then open:

```text
https://YOUR_USERNAME.github.io/YOUR_REPO/
```
