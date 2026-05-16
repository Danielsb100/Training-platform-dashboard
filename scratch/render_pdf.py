import subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', 'pymupdf'], capture_output=True)

import fitz
import os

doc = fitz.open(r'D:\GitHub\Training-platform-dashboard\Patty Moore.pdf')
page = doc[0]

# Render full page as image at high DPI
mat = fitz.Matrix(2, 2)  # 2x zoom
pix = page.get_pixmap(matrix=mat)
out_path = r'D:\GitHub\Training-platform-dashboard\scratch\pdf_images\full_page.png'
pix.save(out_path)
print(f'Full page rendered: {pix.width}x{pix.height}')

doc.close()
