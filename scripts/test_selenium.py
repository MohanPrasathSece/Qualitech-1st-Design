from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

try:
    driver = webdriver.Chrome(options=options)
    driver.get("https://www.google.com/search?q=10067847-001RLF+Amphenol&tbm=isch")
    time.sleep(2)
    # Check images
    imgs = driver.find_elements(By.TAG_NAME, "img")
    print(f"Total img elements on page: {len(imgs)}")
    srcs = [img.get_attribute("src") for img in imgs if img.get_attribute("src")]
    print(f"Non-empty srcs: {len(srcs)}")
    valid_srcs = [s for s in srcs if s.startswith("http") or s.startswith("data:image")]
    print(f"Valid image srcs: {len(valid_srcs)}")
    for s in valid_srcs[:5]:
        print("  ", s[:100])
    driver.quit()
    print("Selenium Chrome headless worked successfully!")
except Exception as e:
    print("Selenium error:", e)
