import subprocess
import sys

subprocess.run([sys.executable, '-m', 'pip', 'install', 'pymupdf'], capture_output=True)

import fitz

doc = fitz.open(r'D:\GitHub\Training-platform-dashboard\Patty Moore.pdf')
print(f'Pages: {len(doc)}')

for i, page in enumerate(doc):
    print(f'\n--- Page {i+1} (size: {page.rect.width}x{page.rect.height}) ---')
    print(page.get_text())

# Extract images
import os
out_dir = r'D:\GitHub\Training-platform-dashboard\scratch\pdf_images'
os.makedirs(out_dir, exist_ok=True)

for i, page in enumerate(doc):
    images = page.get_images(full=True)
    print(f'\nPage {i+1} has {len(images)} images')
    for j, img in enumerate(images):
        xref = img[0]
        base_image = doc.extract_image(xref)
        ext = base_image["ext"]
        img_bytes = base_image["image"]
        w = base_image.get("width", 0)
        h = base_image.get("height", 0)
        fname = f'page{i+1}_img{j+1}.{ext}'
        path = os.path.join(out_dir, fname)
        with open(path, 'wb') as f:
            f.write(img_bytes)
        print(f'  Extracted: {fname} ({w}x{h}, {len(img_bytes)} bytes)')

doc.close()
