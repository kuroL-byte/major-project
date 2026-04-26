import os
import cv2
import numpy as np
from tqdm import tqdm
from pathlib import Path
import shutil

# Paths
image_dir = Path("data_raw/Image")
mask_dir = Path("data_raw/Mask")

# Output folders
output_flooded = Path("data/flooded")
output_not_flooded = Path("data/not_flooded")
output_flooded.mkdir(parents=True, exist_ok=True)
output_not_flooded.mkdir(parents=True, exist_ok=True)

# Threshold for flood detection (% of image area)
flood_threshold = 0.05  # 5%

for mask_path in tqdm(list(mask_dir.glob("*.png"))):
    mask = cv2.imread(str(mask_path), cv2.IMREAD_GRAYSCALE)
    flood_ratio = np.sum(mask > 0) / mask.size

    image_path = image_dir / mask_path.name.replace(".png", ".jpg")
    if not image_path.exists():
        continue

    if flood_ratio > flood_threshold:
        
        shutil.copy(image_path, output_flooded / image_path.name)
    else:
        shutil.copy(image_path, output_not_flooded / image_path.name)

print("✅ Dataset prepared! Check folders 'data/flooded' and 'data/not_flooded'")

