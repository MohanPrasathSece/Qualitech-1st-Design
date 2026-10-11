import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# Test Ecosia
try:
    r = requests.get("https://www.ecosia.org/images?q=10067847-001RLF+Amphenol", headers=headers, timeout=10)
    print("Ecosia status:", r.status_code)
    if r.status_code == 200:
        soup = BeautifulSoup(r.text, 'html.parser')
        imgs = [img.get('src') for img in soup.find_all('img') if img.get('src')]
        print("Ecosia images:", len(imgs), imgs[:3])
except Exception as e:
    print("Ecosia error:", e)

# Test Ask.com
try:
    r = requests.get("https://www.ask.com/web?q=10067847-001RLF+Amphenol", headers=headers, timeout=10)
    print("Ask status:", r.status_code)
except Exception as e:
    print("Ask error:", e)
