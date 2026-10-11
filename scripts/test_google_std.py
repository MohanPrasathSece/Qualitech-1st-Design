import urllib.request
import urllib.parse
import re

def test_google_std(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&tbm=isch"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for img src
            img_srcs = re.findall(r'<img[^>]+src="(https://[^">]+)"', html)
            # Also find high-res image urls in JS data
            # Typically: ["https://...",...]
            js_imgs = re.findall(r'\["(https://[^"]+\.(?:jpg|jpeg|png|webp))",\s*\d+,\s*\d+\]', html)
            return img_srcs, js_imgs
    except Exception as e:
        print("Google error:", e)
        return [], []

imgs, js_imgs = test_google_std("10067847-001RLF Amphenol connector")
print("Found img srcs:", len(imgs), imgs[:3])
print("Found js imgs:", len(js_imgs), js_imgs[:5])
