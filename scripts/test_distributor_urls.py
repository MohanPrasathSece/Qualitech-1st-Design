import requests
import json
import re

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
})

# Test DigiKey search endpoint or HTML
# Digikey: https://www.digikey.com/products/en?keywords=10067847-001RLF
try:
    r = session.get("https://www.digikey.com/products/en?keywords=10067847-001RLF", timeout=10)
    print("DigiKey status:", r.status_code, "Final URL:", r.url)
    # Search for image url
    imgs = re.findall(r'https://[^"]+\.(?:jpg|png|webp)', r.text)
    prod_imgs = [i for i in imgs if 'product' in i.lower() or 'media.digikey.com' in i.lower()]
    print("Digikey product imgs:", prod_imgs[:5])
except Exception as e:
    print("DigiKey error:", e)

# Test Rochester Electronics or Octopart or OEMsecrets or TTI
try:
    r = session.get("https://www.tti.com/content/ttiinc/en/apps/part-search.html?searchTerms=10067847-001RLF", timeout=10)
    print("TTI status:", r.status_code)
except Exception as e:
    print("TTI error:", e)
