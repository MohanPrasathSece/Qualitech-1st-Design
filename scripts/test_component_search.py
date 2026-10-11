import urllib.request
import urllib.parse
import re

def search_bing_component_images(part_number):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    }
    # Query with Amphenol and FCI
    query = f"{part_number} Amphenol FCI"
    url = f"https://www.bing.com/images/search?q={urllib.parse.quote(query)}&first=1"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract murl
            murls = re.findall(r'murl&quot;:&quot;(http[^&]+)&quot;', html)
            if not murls:
                murls = re.findall(r'"murl":"(http[^"]+)"', html)
            return murls
    except Exception as e:
        print("Error:", e)
        return []

parts = [
    "10067847-001RLF",
    "10078995-G01-30ULF",
    "10127716-06LF",
    "86552153TLF",
    "51590291519620LF"
]

for p in parts:
    urls = search_bing_component_images(p)
    print(f"\nPart: {p} -> {len(urls)} images found")
    for u in urls[:3]:
        print("  ", u)
