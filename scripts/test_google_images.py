import urllib.request
import urllib.parse
import re

def test_google_images(query):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }
    url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&tbm=isch&asearch=ichunk&async=_id:rg_s,_pms:s,_fmt:pc"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Extract http image urls
            # Google images has [\"https://...\",width,height]
            matches = re.findall(r'\["(https://[^"]+\.(?:jpg|jpeg|png|webp))",\d+,\d+\]', html)
            return matches
    except Exception as e:
        print("Google error:", e)
        return []

print("Testing Google Images for '\"10067847-001RLF\"'...")
urls = test_google_images('"10067847-001RLF" connector')
print(f"Found {len(urls)} image URLs:")
for u in urls[:10]:
    print("  ", u)

print("\nTesting Google Images for '\"10078995-G01-30ULF\"'...")
urls2 = test_google_images('"10078995-G01-30ULF" connector')
print(f"Found {len(urls2)} image URLs:")
for u in urls2[:10]:
    print("  ", u)
