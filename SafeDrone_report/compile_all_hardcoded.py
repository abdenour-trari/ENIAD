import shutil
import os
import subprocess
import sys

# Ensure UTF-8 output encoding
sys.stdout.reconfigure(encoding='utf-8')

src_dir = r"C:\Users\ATRARI\Downloads\SafeDrone_LaTeX"
target_dirs = [
    r"C:\Users\ATRARI\Downloads\SafeDrone_LaTeX",
    r"C:\Users\ATRARI\Downloads\SafeDrone_LaTeX_v2",
    r"C:\Users\ATRARI\Downloads\SafeDrone_LaTeX_v3",
]

files_to_copy = ["chapter3.tex", "chapter4.tex", "chapter5.tex", "appendix.tex"]

# Hardcoded paths which are verified to exist
pdflatex = r"C:\Users\ATRARI\AppData\Local\Programs\MiKTeX\miktex\bin\x64\pdflatex.exe"
bibtex = r"C:\Users\ATRARI\AppData\Local\Programs\MiKTeX\miktex\bin\x64\bibtex.exe"

print(f"Checking pdflatex path existence: {os.path.exists(pdflatex)}")
print(f"Checking bibtex path existence: {os.path.exists(bibtex)}")

# Replicate files to other directories
for dest in target_dirs:
    if dest == src_dir:
        continue
    if os.path.exists(dest):
        print(f"Copying files to: {dest}")
        for f in files_to_copy:
            shutil.copy2(os.path.join(src_dir, f), os.path.join(dest, f))

# Compile in each directory
for d in target_dirs:
    if not os.path.exists(d):
        continue
    print(f"\n===========================================")
    print(f"COMPILING IN: {d}")
    print(f"===========================================")
    
    # Pass 1
    print("Running pdflatex Pass 1...")
    res = subprocess.run([pdflatex, "-interaction=nonstopmode", "main.tex"], cwd=d, capture_output=True, text=True)
    if res.returncode != 0:
        print("Pass 1 warning/error. Exit code:", res.returncode)
        # print first 50 lines of stdout/stderr if compile has errors
        print("Stdout snippet:\n", "\n".join(res.stdout.splitlines()[:30]))
    
    # Bibtex
    aux_path = os.path.join(d, "main.aux")
    if os.path.exists(aux_path):
        print("Running bibtex...")
        res_b = subprocess.run([bibtex, "main"], cwd=d, capture_output=True, text=True)
        if res_b.returncode != 0:
            print("Bibtex exit code:", res_b.returncode)
            print("Bibtex output:\n", res_b.stdout[:500])

    # Pass 2
    print("Running pdflatex Pass 2...")
    subprocess.run([pdflatex, "-interaction=nonstopmode", "main.tex"], cwd=d, capture_output=True)
    
    # Pass 3
    print("Running pdflatex Pass 3...")
    res_final = subprocess.run([pdflatex, "-interaction=nonstopmode", "main.tex"], cwd=d, capture_output=True, text=True)
    
    pdf_file = os.path.join(d, "main.pdf")
    if os.path.exists(pdf_file):
        print(f"Result: main.pdf updated successfully! Size: {os.path.getsize(pdf_file)} bytes")
    else:
        print("Result: main.pdf NOT found.")
