import requests
import re
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5"
}

part = "10067847-001RLF"

# Test digipart.com
try:
    url = f"https://www.digipart.com/part/{part}"
    r = requests.get(url, headers=headers, timeout=10)
    print("Digipart status:", r.status_code)
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        print("Digipart imgs:", [i for i in imgs if 'logo' not in i.lower()])
except Exception as e:
    print("Digipart error:", e)

# Test oemsecrets.com
try:
    url = f"https://www.oemsecrets.com/part/{part}"
    r = requests.get(url, headers=headers, timeout=10)
    print("OEMsecrets status:", r.status_code)
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        print("OEMsecrets imgs:", [i for i in imgs if 'logo' not in i.lower()])
except Exception as e:
    print("OEMsecrets error:", e)

# Test componentsearchengine.com
try:
    url = f"https://componentsearchengine.com/part-view/{part}/Amphenol"
    r = requests.get(url, headers=headers, timeout=10)
    print("ComponentSearchEngine status:", r.status_code)
except Exception as e:
    print("ComponentSearchEngine error:", e)

# Test SnapEDA
try:
    url = f"https://www.snapeda.com/parts/{part}/Amphenol/view-part/"
    r = requests.get(url, headers=headers, timeout=10)
    print("SnapEDA status:", r.status_code)
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        print("SnapEDA imgs:", [i for i in imgs if 'logo' not in i.lower()])
except Exception as e:
    print("SnapEDA error:", e)
