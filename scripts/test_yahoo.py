import urllib.request
import urllib.parse
import re

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def test_yahoo(query):
    url = f"https://images.search.yahoo.com/search/images?p={urllib.parse.quote(query)}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            # Look for imgurls or data-src or imgurl=
            imgurls = re.findall(r'imgurl=([^&"]+)', html)
            if not imgurls:
                imgurls = re.findall(r'src=["\'](https://[^"\']+\.(?:jpg|jpeg|png))["\']', html)
            return [urllib.parse.unquote(u) for u in imgurls]
    except Exception as e:
        return [f"Error: {e}"]

parts = ["10067847-001RLF", "10078995-G01-30ULF", "10127716-06LF", "86552153TLF"]
for p in parts:
    res = test_yahoo(f"{p} connector")
    print(f"Yahoo for '{p} connector': {len(res)} results")
    for r in res[:3]:
        print("  ", r)
