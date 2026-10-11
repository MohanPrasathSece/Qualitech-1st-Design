import requests
import json
import re

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
})

# Test Qwant
try:
    qwant_url = "https://api.qwant.com/v3/search/images?q=10067847-001RLF&count=5&locale=en_US&offset=0&device=desktop"
    r = session.get(qwant_url, timeout=10)
    print("Qwant status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        print("Qwant items:", len(data.get('data', {}).get('result', {}).get('items', [])))
except Exception as e:
    print("Qwant error:", e)

# Test Baidu image search
try:
    baidu_url = "https://image.baidu.com/search/acjson?tn=resultjson_com&logid=1&ipn=rj&ct=201326592&is=&fp=result&queryWord=10067847-001RLF&cl=2&lm=-1&ie=utf-8&oe=utf-8&adpicid=&st=-1&z=&ic=0&hd=&latest=&copyright=&word=10067847-001RLF&s=&se=&tab=&width=&height=&face=0&istype=2&qc=&nc=1&fr=&expermode=&nojc=&pn=30&rn=10"
    r = session.get(baidu_url, timeout=10)
    print("Baidu status:", r.status_code)
    if r.status_code == 200:
        data = r.json()
        imgs = [item.get('thumbURL') for item in data.get('data', []) if item.get('thumbURL')]
        print("Baidu images:", len(imgs), imgs[:3])
except Exception as e:
    print("Baidu error:", e)

# Test Yandex image search
try:
    yandex_url = "https://yandex.com/images/search?text=10067847-001RLF"
    r = session.get(yandex_url, timeout=10)
    print("Yandex status:", r.status_code)
    if r.status_code == 200:
        imgs = re.findall(r'//avatars\.mds\.yandex\.net/[^"\'\s]+', r.text)
        print("Yandex images:", len(imgs), imgs[:3])
except Exception as e:
    print("Yandex error:", e)
