import urllib.request
import urllib.parse

parts = [
    "10067847-001RLF",
    "10078995-G01-30ULF",
    "10090769-P154ALF",
    "10090770-S154ALF",
    "10127716-06LF",
    "10127815-02LF",
    "10127815-04LF",
    "86552153TLF",
    "51590291519620LF",
    "51590291523660LF"
]

for p in parts:
    clean_p = urllib.parse.quote(p)
    urls = [
        f"https://media.digikey.com/Photos/FCI%20Photos/{clean_p}.jpg",
        f"https://media.digikey.com/Photos/FCI%20Photos/{clean_p}.JPG",
        f"https://media.digikey.com/photos/FCI%20Photos/{clean_p}.jpg",
        f"https://media.digikey.com/photos/FCI%20Photos/{clean_p}.JPG",
    ]
    found = False
    for u in urls:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    print(f"Direct DigiKey match for {p:25s}: {u}")
                    found = True
                    break
        except Exception as e:
            pass
    if not found:
        print(f"No direct match for {p:25s}")
