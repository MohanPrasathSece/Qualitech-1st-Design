import requests
import json

searx_instances = [
    "https://searx.be",
    "https://search.ononoki.org",
    "https://baresearch.org",
    "https://northboot.xyz",
    "https://priv.au",
]

for inst in searx_instances:
    try:
        url = f"{inst}/search"
        params = {"q": "10067847-001RLF Amphenol", "categories": "images", "format": "json"}
        r = requests.get(url, params=params, timeout=5, headers={"User-Agent": "Mozilla/5.0"})
        print(f"{inst} -> status {r.status_code}")
        if r.status_code == 200:
            data = r.json()
            res = data.get("results", [])
            print(f"  Found {len(res)} image results!")
            for item in res[:3]:
                print("   img:", item.get("img_src"))
            break
    except Exception as e:
        print(f"{inst} -> Error: {e}")
