from __future__ import annotations

import argparse
import io
import math
import re
from pathlib import Path

import numpy as np
import requests
from PIL import Image
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parents[1]
SOURCE_FILE = ROOT / "src" / "data" / "insects" / "mockInsects.ts"
OUTPUT_DIR = ROOT / "public" / "insects" / "cutouts"


def extract_species_entries(source_text: str) -> list[tuple[str, str, str]]:
  pattern = re.compile(
    r"id:\s*'([^']+)'.*?slug:\s*'([^']+)'.*?heroImage:\s*'([^']+)'",
    re.DOTALL,
  )
  return [(m.group(1), m.group(2), m.group(3)) for m in pattern.finditer(source_text)]


def fetch_image_bytes(url: str) -> bytes:
  response = requests.get(
    url,
    timeout=30,
    headers={
      "User-Agent": "InsectEarthAtlas/1.0 (https://example.local)",
      "Accept": "image/*,*/*;q=0.8",
      "Referer": "https://commons.wikimedia.org/",
    },
  )
  response.raise_for_status()
  return response.content


def connected_components(mask: np.ndarray) -> tuple[np.ndarray, list[dict[str, float]]]:
  height, width = mask.shape
  labels = np.zeros((height, width), dtype=np.int32)
  components: list[dict[str, float]] = []
  label = 0

  for y in range(height):
    for x in range(width):
      if not mask[y, x] or labels[y, x] != 0:
        continue

      label += 1
      stack = [(y, x)]
      labels[y, x] = label

      area = 0
      min_x = max_x = x
      min_y = max_y = y
      sum_x = 0.0
      sum_y = 0.0

      while stack:
        cy, cx = stack.pop()
        area += 1
        sum_x += cx
        sum_y += cy
        min_x = min(min_x, cx)
        max_x = max(max_x, cx)
        min_y = min(min_y, cy)
        max_y = max(max_y, cy)

        ny = cy - 1
        if ny >= 0 and mask[ny, cx] and labels[ny, cx] == 0:
          labels[ny, cx] = label
          stack.append((ny, cx))

        ny = cy + 1
        if ny < height and mask[ny, cx] and labels[ny, cx] == 0:
          labels[ny, cx] = label
          stack.append((ny, cx))

        nx = cx - 1
        if nx >= 0 and mask[cy, nx] and labels[cy, nx] == 0:
          labels[cy, nx] = label
          stack.append((cy, nx))

        nx = cx + 1
        if nx < width and mask[cy, nx] and labels[cy, nx] == 0:
          labels[cy, nx] = label
          stack.append((cy, nx))

      components.append(
        {
          "label": float(label),
          "area": float(area),
          "min_x": float(min_x),
          "max_x": float(max_x),
          "min_y": float(min_y),
          "max_y": float(max_y),
          "sum_x": sum_x,
          "sum_y": sum_y,
        },
      )

  return labels, components


def choose_subject_component(
  components: list[dict[str, float]],
  image_width: int,
  image_height: int,
) -> int:
  image_area = float(image_width * image_height)
  center_x = (image_width - 1) * 0.5
  center_y = (image_height - 1) * 0.5
  diag_half = math.sqrt(image_width**2 + image_height**2) * 0.5

  ranked = sorted(components, key=lambda c: c["area"], reverse=True)
  largest = ranked[0]
  largest_ratio = largest["area"] / image_area

  best_score = -10_000.0
  best_label = int(largest["label"])

  for component in ranked:
    area = component["area"]
    min_x = component["min_x"]
    max_x = component["max_x"]
    min_y = component["min_y"]
    max_y = component["max_y"]

    width = max(1.0, max_x - min_x + 1.0)
    height = max(1.0, max_y - min_y + 1.0)
    bbox_area = width * height
    fill_ratio = area / bbox_area
    normalized_area = area / image_area

    cx = component["sum_x"] / area
    cy = component["sum_y"] / area
    center_distance = math.sqrt((cx - center_x) ** 2 + (cy - center_y) ** 2) / max(
      1e-6,
      diag_half,
    )

    # Area-first strategy: prefer large components, then use shape and center cues.
    area_score = normalized_area * 10.0
    distance_score = -0.95 * center_distance
    tiny_penalty = -max(0.0, 0.0045 - normalized_area) * 280.0
    dense_penalty = -2.4 if fill_ratio > 0.78 and normalized_area > 0.045 else 0.0
    huge_penalty = -1.8 if normalized_area > 0.42 else 0.0
    shape_bonus = 0.45 if 0.12 <= fill_ratio <= 0.68 else 0.0

    edge_gap = min(min_x, min_y, image_width - 1 - max_x, image_height - 1 - max_y)
    edge_penalty = -0.7 if edge_gap <= 1 else 0.0

    score = (
      area_score
      + distance_score
      + tiny_penalty
      + dense_penalty
      + huge_penalty
      + shape_bonus
      + edge_penalty
    )
    if score > best_score:
      best_score = score
      best_label = int(component["label"])

  # Guard: avoid selecting tiny noise when a substantial component exists.
  selected = next(
    (component for component in ranked if int(component["label"]) == best_label),
    largest,
  )
  selected_ratio = selected["area"] / image_area
  if selected_ratio < 0.004 and largest_ratio > 0.018:
    return int(largest["label"])

  return best_label


def isolate_single_subject(png_bytes: bytes) -> bytes:
  image = Image.open(io.BytesIO(png_bytes)).convert("RGBA")
  rgba = np.array(image, dtype=np.uint8)
  alpha = rgba[:, :, 3]
  mask = alpha > 12

  if not mask.any():
    return png_bytes

  labels, components = connected_components(mask)
  if len(components) <= 1:
    return png_bytes

  selected_label = choose_subject_component(components, image.width, image.height)
  selected_mask = labels == selected_label

  rgba[~selected_mask, 3] = 0

  ys, xs = np.where(selected_mask)
  if len(xs) == 0 or len(ys) == 0:
    return png_bytes

  left = int(xs.min())
  right = int(xs.max())
  top = int(ys.min())
  bottom = int(ys.max())

  pad = max(8, int(max(right - left + 1, bottom - top + 1) * 0.12))
  left = max(0, left - pad)
  top = max(0, top - pad)
  right = min(image.width - 1, right + pad)
  bottom = min(image.height - 1, bottom + pad)

  isolated = Image.fromarray(rgba, mode="RGBA").crop((left, top, right + 1, bottom + 1))

  side = int(max(isolated.width, isolated.height) * 1.08)
  side = max(side, 128)
  canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
  offset_x = (side - isolated.width) // 2
  offset_y = (side - isolated.height) // 2
  canvas.paste(isolated, (offset_x, offset_y), isolated)

  out = io.BytesIO()
  canvas.save(out, format="PNG")
  return out.getvalue()


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser()
  parser.add_argument(
    "--force",
    action="store_true",
    help="Regenerate existing marker PNG files.",
  )
  parser.add_argument(
    "--no-single-subject",
    action="store_true",
    help="Disable single-subject isolation step.",
  )
  return parser.parse_args()


def main() -> None:
  args = parse_args()
  OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
  source_text = SOURCE_FILE.read_text(encoding="utf-8")
  entries = extract_species_entries(source_text)

  if not entries:
    raise RuntimeError("No species entries parsed from mockInsects.ts")

  session = new_session("u2netp")
  enforce_single_subject = not args.no_single_subject

  for _, slug, url in entries:
    output_path = OUTPUT_DIR / f"{slug}.png"
    if output_path.exists() and not args.force:
      print(f"skip existing: {slug}")
      continue

    try:
      raw = fetch_image_bytes(url)
      cutout = remove(raw, session=session)
      if enforce_single_subject:
        cutout = isolate_single_subject(cutout)
      output_path.write_bytes(cutout)
      print(f"ok: {slug}")
    except Exception as exc:  # noqa: BLE001
      print(f"fail: {slug} -> {exc}")


if __name__ == "__main__":
  main()
