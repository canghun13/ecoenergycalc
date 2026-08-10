#!/usr/bin/env python3
"""
IndexNow bulk URL submission for ecoenergycalc.com.

Reads sitemap.xml, POSTs the full URL list to the IndexNow API in one
request (bulk endpoint supports up to 10,000 URLs/request).

Key file: /{key}.txt at the site root (already committed to repo root).
Docs: https://www.bing.com/indexnow

Usage:
    python3 scripts/submit_indexnow.py            # submit all sitemap URLs
    python3 scripts/submit_indexnow.py url1 url2   # submit specific URLs only

Requires network access to api.indexnow.org (not reachable from the
sandboxed session that wrote this script - see handover.md section 0-2/0-7-3
for why this had to be committed unexecuted).
"""
import json
import re
import sys
import urllib.request

HOST = "ecoenergycalc.com"
KEY = "284760dd18f46ec1273996ed32a8e5f4"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
SITEMAP_PATH = "sitemap.xml"


def load_sitemap_urls(path=SITEMAP_PATH):
    xml = open(path, encoding="utf-8").read()
    return re.findall(r"<loc>(.*?)</loc>", xml)


def submit(urls):
    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        ENDPOINT,
        data=data,
        method="POST",
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            print(f"HTTP {resp.status}")
            if body:
                print(body[:500])
            return resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"HTTP {e.code} (error)")
        if body:
            print(body[:500])
        return e.code
    except urllib.error.URLError as e:
        print(f"Request failed (no HTTP response): {e.reason}")
        return None


if __name__ == "__main__":
    urls = sys.argv[1:] if len(sys.argv) > 1 else load_sitemap_urls()
    print(f"Submitting {len(urls)} URL(s) to {ENDPOINT} ...")
    status = submit(urls)
    if status == 200:
        print("OK - submitted (200). Some engines return 202 Accepted instead.")
    elif status == 202:
        print("Accepted (202) - queued for processing.")
    elif status is not None:
        print(f"Unexpected status {status} - check key file and payload.")
