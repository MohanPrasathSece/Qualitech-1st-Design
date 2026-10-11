import urllib.request
import urllib.parse
import re

folders = [
    "FCI%20Photos",
    "Amphenol%20Photos",
    "Amphenol%20Commercial%20Products%20Photos",
]

def test_query(q):
    q_clean = urllib.parse.quote(q)
    for folder in folders:
        for ext in ['.jpg', '.JPG', '.png']:
            u = f"https://media.digikey.com/Photos/{folder}/{q_clean}{ext}"
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
            try:
                with urllib.request.urlopen(req, timeout=3) as resp:
                    if resp.status == 200:
                        return u
            except:
                pass
    return None

test_prefixes = [
    "67094",
    "67094-002LF",
    "67094-002",
    "67096",
    "67096-002LF",
    "10135551",
    "10135554",
    "10131936",
    "10132450",
    "71918",
    "8613",
    "8614",
    "98414",
    "51720",
    "76624",
]

for p in test_prefixes:
    u = test_query(p)
    if u:
        print(f"FOUND: {p:20s} -> {u}")
    else:
        print(f"NOT FOUND: {p:20s}")
