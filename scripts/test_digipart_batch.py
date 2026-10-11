import requests
from bs4 import BeautifulSoup
import re
import urllib.parse

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

test_parts = [
    "10078995-G01-30ULF",
    "10090769-P154ALF",
    "10127716-06LF",
    "10127815-02LF",
    "86552153TLF",
    "51590291519620LF",
    "67096-002LF",
    "D38999/20WJ35PN",
    "SC-SC-SM-SX-1M",
]

for p in test_parts:
    url = f"https://www.digipart.com/part/{urllib.parse.quote(p)}"
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
            # Filter actual product images
            cand = []
            for img in imgs:
                img_lower = img.lower()
                if any(x in img_lower for x in ['digikey.com', 'farnell.com', 'mouser.com', 'distr', 'media', 'photos', 'part']):
                    if not any(x in img_lower for x in ['pdf-16', 'arrow', 'logo', 'flag', 'icon']):
                        if 'distr' not in img_lower: # skip distributor logos
                            cand.append(img)
            print(f"Part: {p:25s} -> Status {r.status_code} | Found {len(cand)} candidate images: {cand[:2]}")
        else:
            print(f"Part: {p:25s} -> Status {r.status_code}")
    except Exception as e:
        print(f"Part: {p:25s} -> Error: {e}")
