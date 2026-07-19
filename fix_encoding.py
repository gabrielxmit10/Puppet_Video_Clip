import os

def fix_encoding(directory):
    count = 0
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') or file.endswith('.html') or file.endswith('.css'):
                filepath = os.path.join(root, file)
                try:
                    # Read the raw bytes
                    with open(filepath, 'rb') as f:
                        content = f.read()
                    
                    # Remove UTF-8 BOM if present
                    if content.startswith(b'\xef\xbb\xbf'):
                        content = content[3:]
                    
                    # Decode to string
                    text = content.decode('utf-8')
                    
                    # Force Unix-style LF line endings (replace Windows CRLF)
                    text = text.replace('\r\n', '\n')
                    
                    # Write back as pure UTF-8 without BOM and with LF endings
                    with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
                        f.write(text)
                    count += 1
                except Exception as e:
                    print(f"Error processing {filepath}: {e}")
    print(f"Successfully cleaned formatting for {count} files!")

if __name__ == '__main__':
    fix_encoding('.')
