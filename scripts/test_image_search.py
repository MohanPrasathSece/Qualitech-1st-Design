import urllib.request
import urllib.parse
import json
import re

def search_ddg_images(query):
    url = "https://duckduckgo.com/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    # First get vqd token
    params = urllib.parse.urlencode({'q': query})
    req = urllib.request.Request(f"{url}?{params}", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            vqd_match = re.search(r'vqd=([\d-]+)', html)
            if not vqd_match:
                vqd_match = re.search(r'vqd="([^"]+)"', html)
            if not vqd_match:
                print("Could not find vqd token")
                return []
            vqd = vqd_match.group(1)
            
            # Now query i.js
            img_url = f"https://duckduckgo.com/i.js?l=us-en&o=json&q={urllib.parse.quote(query)}&vqd={vqd}&f=,,,&p=1"
            img_req = urllib.request.Request(img_url, headers=headers)
            with urllib.request.urlopen(img_req, timeout=10) as img_resp:
                data = json.loads(img_resp.read().decode('utf-8'))
                results = data.get('results', [])
                return [r.get('image') for r in results if r.get('image')]
    except Exception as e:
        print("Error:", e)
        return []

print("Testing DDG image search for '10067847-001RLF Amphenol'...")
imgs = search_ddg_images("10067847-001RLF Amphenol")
print(f"Found {len(imgs)} images:")
for img in imgs[:5]:
    print("  ", img)
