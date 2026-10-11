from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

options = Options()
options.add_argument("--headless=new")
options.add_argument("--disable-gpu")
options.add_argument("--no-sandbox")
options.add_argument("--disable-dev-shm-usage")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

driver = webdriver.Chrome(options=options)
driver.get("https://www.google.com/search?q=10067847-001RLF+Amphenol&tbm=isch")
time.sleep(3)
print("Title:", driver.title)
html = driver.page_source
print("HTML length:", len(html))
print("HTML snippet:", html[:1000])
driver.quit()
