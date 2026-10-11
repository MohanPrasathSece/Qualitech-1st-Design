import urllib.request
import urllib.parse
import re
import json

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def test_findchips(part):
    url = f"https://www.findchips.com/search/{urllib.parse.quote(part)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for image urls
            imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
            imgs = [img for img in imgs if 'logo' not in img.lower() and ('part' in img.lower() or 'product' in img.lower() or 'distributor' in img.lower() or 'image' in img.lower())]
            return imgs
    except Exception as e:
        return [f"Error: {e}"]

def test_lcsc(part):
    url = f"https://www.lcsc.com/api/products/search"
    # LCSC search API
    data = json.dumps({"keyword": part}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={**headers, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            return res
    except Exception as e:
        return [f"Error: {e}"]

print("FindChips for 10067847-001RLF:")
print(test_findchips("10067847-001RLF"))

print("LCSC for 10067847-001RLF:")
print(test_lcsc("10067847-001RLF"))
