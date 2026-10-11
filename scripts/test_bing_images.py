import urllib.request
import urllib.parse
import re
import json

def test_bing_images(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&form=HDRSC2&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for murl in json metadata m="{...murl:&quot;...&quot;...}"
            murls = re.findall(r'murl&quot;:&quot;(http[^&]+)&quot;', html)
            if not murls:
                # Also check direct murl
                murls = re.findall(r'"murl":"(http[^"]+)"', html)
            return murls
    except Exception as e:
        print("Bing error:", e)
        return []

print("Testing Bing Images for '10067847-001RLF'...")
urls = test_bing_images("10067847-001RLF Amphenol")
print(f"Found {len(urls)} image URLs:")
for u in urls[:5]:
    print("  ", u)

print("\nTesting Bing Images for '10078995-G01-30ULF'...")
urls2 = test_bing_images("10078995-G01-30ULF Amphenol")
print(f"Found {len(urls2)} image URLs:")
for u in urls2[:5]:
    print("  ", u)
