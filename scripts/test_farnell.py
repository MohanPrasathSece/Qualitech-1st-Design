import re
import urllib.parse
import urllib.request
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

# Test search on findchips / octopart / google / bing / mouser
def search_octopart_free(pn):
    url = f"https://octopart.com/search?q={urllib.parse.quote(pn)}"
    # Let's test if headers can fetch
    try:
        r = requests.get(url, headers=HEADERS, timeout=4)
        print("Octopart status:", r.status_code)
    except Exception as e:
        print("Octopart err:", e)

def search_farnell_direct(pn):
    # Farnell search URL:
    url = f"https://in.element14.com/search?st={urllib.parse.quote(pn)}"
    try:
        r = requests.get(url, headers=HEADERS, timeout=5)
        print("Farnell status:", r.status_code)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, 'html.parser')
            imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
            print("Farnell imgs:", [i for i in imgs if 'product' in i.lower() or 'standard' in i.lower()][:3])
    except Exception as e:
        print("Farnell err:", e)

search_farnell_direct("10078995-G01-30ULF")
search_farnell_direct("DEM09P032N")
