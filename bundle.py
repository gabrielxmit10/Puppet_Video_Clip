import re
import os

def bundle_js():
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()

    # Find all local script src paths
    scripts = re.findall(r'<script src="([^"]+)"></script>', html)
    
    # Filter out external/p5 library paths
    scripts = [s for s in scripts if not s.startswith('http') and not s.startswith('../')]
    
    bundled_content = "// ==========================================\n"
    bundled_content += "// AUTO-BUNDLED P5.JS PROJECT\n"
    bundled_content += "// Paste this ENTIRE file directly into the Web Editor's sketch.js\n"
    bundled_content += "// ==========================================\n\n"
    
    for script_path in scripts:
        if os.path.exists(script_path):
            with open(script_path, 'r', encoding='utf-8') as sf:
                bundled_content += f"\n\n// --- Start of {script_path} ---\n\n"
                bundled_content += sf.read()
                bundled_content += f"\n\n// --- End of {script_path} ---\n"
        else:
            print(f"Warning: Could not find {script_path}")

    with open('bundled_sketch.js', 'w', encoding='utf-8', newline='\n') as out:
        out.write(bundled_content)
        
    print("Successfully bundled all scripts into bundled_sketch.js!")

if __name__ == '__main__':
    bundle_js()
