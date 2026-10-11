from duckduckgo_search import DDGS
import json

parts = [
    "10067847-001RLF",
    "10078995-G01-30ULF",
    "10127716-06LF",
    "86552153TLF",
    "51590291519620LF"
]

with DDGS() as ddgs:
    for p in parts:
        query = f'"{p}" Amphenol connector'
        results = list(ddgs.images(query, max_results=3))
        print(f"\nPart: {p} (query: {query}) -> {len(results)} results")
        for r in results:
            print("  Title:", r.get('title'))
            print("  Image URL:", r.get('image'))
            print("  Source:", r.get('url'))
