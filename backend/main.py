"""
Skinova – AI Skin Disease Detection Microservice
FastAPI + TensorFlow VGG19 backend (22 skin disease classes)
Endpoint: POST /predict
"""

from __future__ import annotations

import io
import json
import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image, ImageOps

try:
    import tensorflow as tf
except ImportError as exc:
    raise ImportError(
        "TensorFlow is not installed. Run: pip install tensorflow"
    ) from exc

# ── Constants ──────────────────────────────────────────────────────────────────

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "skin_disease_vgg19_22classes.keras")
CLASS_NAMES_PATH = os.path.join(BASE_DIR, "class_names.json")

IMAGE_SIZE = (224, 224)
TOP_K = 3

# Class order is written by train_simple.py — must match the model's outputs
with open(CLASS_NAMES_PATH, encoding="utf-8") as f:
    CLASS_NAMES: list[str] = json.load(f)

# ── Model loading ──────────────────────────────────────────────────────────────

model: tf.keras.Model | None = None
model_load_error: str | None = None

try:
    print(f"[Skinova] Loading model from: {MODEL_PATH}")
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    n_outputs = model.output_shape[-1]
    if n_outputs != len(CLASS_NAMES):
        raise ValueError(
            f"Model has {n_outputs} outputs but class_names.json lists {len(CLASS_NAMES)} classes."
        )
    print(f"[Skinova] Model loaded successfully ({n_outputs} classes).")
except FileNotFoundError:
    model = None
    model_load_error = (
        f"Model file not found at '{MODEL_PATH}'. "
        "Copy 'skin_disease_vgg19_22classes.keras' into the backend/ folder and restart the server."
    )
    print(f"[Skinova] WARNING – {model_load_error}")
except Exception as exc:
    model = None
    model_load_error = f"Model failed to load: {exc}"
    print(f"[Skinova] ERROR – {model_load_error}")

# ── FastAPI app ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Skinova AI Microservice",
    description="VGG19-based skin disease classifier (22 classes).",
    version="2.0.0",
)

# Allow requests from the Next.js frontend (localhost:3000 in dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def preprocess(raw_bytes: bytes) -> np.ndarray:
    """Same preprocessing as training: RGB, 224×224 antialiased resize, scale to 0–1."""
    image = Image.open(io.BytesIO(raw_bytes))
    image = ImageOps.exif_transpose(image)  # respect phone photo rotation
    image = image.convert("RGB")
    array = np.asarray(image, dtype=np.float32)
    resized = tf.image.resize(array, IMAGE_SIZE, antialias=True).numpy() / 255.0
    return np.expand_dims(resized, axis=0)  # shape: (1, 224, 224, 3)


# ── Health check ───────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root() -> dict:
    """Simple health-check endpoint."""
    return {
        "status": "running",
        "model_loaded": model is not None,
        "model_error": model_load_error,
        "classes": CLASS_NAMES,
    }

# ── Predict endpoint ───────────────────────────────────────────────────────────

@app.post("/predict", tags=["Inference"])
async def predict(file: UploadFile = File(...)) -> JSONResponse:
    """
    Accept a skin image and return the predicted disease class + confidence.

    Request
    -------
    Content-Type : multipart/form-data
    field name   : file   (binary image – JPG / PNG / WEBP)

    Response
    --------
    {
        "disease":    "<class name>",
        "confidence": 0.XX,                     // 0.0 – 1.0
        "top_predictions": [ {"disease": "...", "confidence": 0.XX}, ... ]  // best 3
    }
    """

    if model is None:
        raise HTTPException(
            status_code=503,
            detail=model_load_error or "Model is not available. Please restart the server.",
        )

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Uploaded file must be an image. Received content-type: {file.content_type}",
        )

    try:
        raw_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Could not read uploaded file: {exc}")

    try:
        img_batch = preprocess(raw_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=422,
            detail=f"Could not decode image. Ensure the file is a valid image: {exc}",
        )

    try:
        probabilities: np.ndarray = model.predict(img_batch, verbose=0)[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model inference failed: {exc}")

    top_indexes = np.argsort(probabilities)[::-1][:TOP_K]
    top = [
        {"disease": CLASS_NAMES[int(i)], "confidence": round(float(probabilities[i]), 4)}
        for i in top_indexes
    ]

    return JSONResponse(
        content={
            "disease": top[0]["disease"],
            "confidence": top[0]["confidence"],
            "top_predictions": top,
        }
    )


# ── Entry point (for running directly with `python main.py`) ──────────────────

if __name__ == "__main__":
    import uvicorn

    # Pass the app object (not "main:app") so this works from any folder
    uvicorn.run(app, host="127.0.0.1", port=8000)
