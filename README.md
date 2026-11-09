# Skinova — AI Skin Disease Detection

A public, SEO-optimised Next.js site where anyone can upload a skin photo from their
gallery **or** take one with their camera and get an instant AI skin health report.
No accounts, no admin/doctor panels, no database.

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing page (how it works, features, sample report, conditions, FAQ) |
| `/analyze` | The analyzer — **Choose from Gallery** or **Take a Photo** → report |
| `/conditions`, `/conditions/[slug]` | SEO guide pages for the 9 detectable conditions |
| `/about`, `/privacy`, `/terms`, `/medical-disclaimer` | Info & legal pages |
| `/sitemap.xml`, `/robots.txt`, `/manifest.webmanifest`, `/opengraph-image` | Generated SEO files |
| `POST /api/predict` | Public proxy to the Python AI service (image in memory, never stored) |

Old panel URLs (`/admin/*`, `/doctor/*`, `/user/*`, `/auth/*`, `/diagnosis`, `/upload`…)
permanently redirect (308) to `/` or `/analyze`.

## Running locally (two terminals)

**Terminal 1 — AI backend** (loads `backend/skin_disease_vgg19_22classes.keras`, about 20 s to start):
```powershell
cd "C:\Users\Lenovo\Desktop\AI derma"
.\.venv\Scripts\Activate.ps1
python fyp\backend\main.py          # http://127.0.0.1:8000  (open it to check "model_loaded": true)
```

**Terminal 2 — website:**
```powershell
cd "C:\Users\Lenovo\Desktop\AI derma\fyp"
npm run dev                         # http://localhost:3000
```

Open http://localhost:3000/analyze, choose or take a photo, and click **Analyze & Generate Report**.

## AI model

- VGG19 fine-tuned on 15,444 DermNet clinical photos, 22 classes (21 conditions + `Unknown_Normal`)
- Class order: `backend/class_names.json` (written by `SkinDisease/SkinDisease/train_simple.py`)
- Test accuracy: 38% top-1 (`SkinDisease/SkinDisease/training_output/test_report.txt`)
- `/predict` returns the top 3 predictions with confidence scores
- The `.keras` model (about 230 MB) is git-ignored, so copy it manually when moving the project

## Environment (`.env.local`)

```env
NEXT_PUBLIC_APP_NAME=Skinova
NEXT_PUBLIC_SITE_URL=https://your-domain.com   # used for canonical URLs, sitemap, OG tags
AI_BACKEND_URL=http://127.0.0.1:8000/predict
# NEXT_PUBLIC_CONTACT_EMAIL=hello@your-domain.com
```

## Camera notes

The live camera ("Take a Photo") uses `getUserMedia`, which browsers only allow on
**HTTPS** or `localhost`. On plain HTTP (e.g. testing from a phone via your LAN IP)
the page automatically offers the phone's native camera app instead.

## Reports

Reports are generated in the browser and can be saved with **Download / Print Report (PDF)**
(uses the browser's print-to-PDF). Nothing is stored on the server.
