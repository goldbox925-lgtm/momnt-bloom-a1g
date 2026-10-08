import requests
import json
import time
from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup

BASE = "https://momnt.ru"
CATALOG = BASE + "/catalog/vse-ukrasheniya/"

folder = Path("images")
folder.mkdir(exist_ok=True)

session = requests.Session()
session.headers.update({"User-Agent": "Mozilla/5.0"})

response = session.get(CATALOG, timeout=25)
response.raise_for_status()

soup = BeautifulSoup(response.text, "html.parser")

products = []
seen = set()

for img in soup.find_all("img"):
    src = img.get("data-src") or img.get("src") or ""
    alt = img.get("alt", "").strip()

    # Пропускаем логотипы, иконки и заглушки
    if "/upload/" not in src:
        continue

    url = urljoin(BASE, src)

    if url in seen:
        continue

    seen.add(url)

    try:
        r = session.get(url, timeout=20)
        r.raise_for_status()

        if not r.headers.get("Content-Type", "").startswith("image/"):
            continue

        if len(r.content) < 10000:
            continue

        number = len(products) + 1
        filename = f"jewelry{number}.jpg"

        # Сохраняем исходный формат изображения
        content_type = r.headers.get("Content-Type", "")
        if "png" in content_type:
            filename = f"jewelry{number}.png"
        elif "webp" in content_type:
            filename = f"jewelry{number}.webp"

        (folder / filename).write_bytes(r.content)

        products.append({
            "name": alt or f"Jewelry {number}",
            "image": "images/" + filename,
            "source": url
        })

        print(f"Downloaded {number}: {filename}")
        time.sleep(0.3)

        if len(products) >= 24:
            break

    except requests.RequestException as e:
        print("Skipped:", str(e)[:100])

Path("products.json").write_text(
    json.dumps(products, ensure_ascii=False, indent=2),
    encoding="utf-8"
)

print()
print("FINISHED!")
print("Downloaded:", len(products))
print("Saved to:", folder.resolve())
