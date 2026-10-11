from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time
import urllib.parse

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-blink-features=AutomationControlled")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

try:
    driver = webdriver.Chrome(options=options)
    driver.execute_cdp_cmd('Network.setUserAgentOverride', {
        "userAgent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    query = "10067847-001RLF Amphenol"
    driver.get(f"https://www.google.com/search?q={urllib.parse.quote(query)}&tbm=isch")
    time.sleep(2)
    print("Page Title:", driver.title)
    
    imgs = driver.find_elements(By.TAG_NAME, "img")
    srcs = [img.get_attribute("src") for img in imgs if img.get_attribute("src")]
    print(f"Total img elements: {len(imgs)}, with src: {len(srcs)}")
    valid = [s for s in srcs if s.startswith("http") or s.startswith("data:image")]
    print(f"Valid srcs: {len(valid)}")
    if valid:
        print("Sample src:", valid[0][:100])
    
    driver.quit()
except Exception as e:
    print("Error:", e)
