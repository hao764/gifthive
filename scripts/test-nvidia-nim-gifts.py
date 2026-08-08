#!/usr/bin/env python3
"""NVIDIA NIM full gift recommendation call → validate JSON output."""
import urllib.request, json, sys

KEY = "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"
URL = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "nvidia/nemotron-3-super-120b-a12b"

body = json.dumps({
    "model": MODEL,
    "temperature": 0,
    "stream": False,
    "max_tokens": 1500,
    "messages": [
        {"role":"system","content":"You are a gift recommendation assistant for GiftHive. Always return STRICT JSON with this exact shape: {\"picks\": [{\"id\": \"ASIN_xxx\", \"reason\": \"short English sentence under 80 chars\"}]}. Pick exactly 5 picks from the candidates. IDs must match the candidate IDs exactly. No extra fields. No markdown."},
        {"role":"user","content": "Context: recipient = boyfriend, occasion = birthday, budget = $50-$100, interests = fishing + mechanical keyboards, personality = practical + thoughtful, closeness = dating 1-2 years.\nCandidates:\n[{\"id\":\"ASIN_B0C1D2E3F4\",\"name\":\"Carbon Fiber Mechanical Keyboard 75% ($89)\"},{\"id\":\"ASIN_X0Y1Z2A3B4\",\"name\":\"Fishing Tackle Box Waterproof 3600 ($59)\"},{\"id\":\"ASIN_M4N5O6P7Q8\",\"name\":\"Stainless Steel Fishing Pliers ($45)\"},{\"id\":\"ASIN_R8S9T0U1V2\",\"name\":\"Custom Engraved Leather Wallet ($69)\"},{\"id\":\"ASIN_W3X4Y5Z6A7\",\"name\":\"Beats Solo 4 Wireless Headphones ($129)\"},{\"id\":\"ASIN_B8C9D0E1F2\",\"name\":\"Portable Fish Finder Sonar ($85)\"},{\"id\":\"ASIN_G3H4I5J6K7\",\"name\":\"Artisan Aluminum Keycap ($35)\"},{\"id\":\"ASIN_L8M9N0O1P2\",\"name\":\"Fishing Rod Holder for Truck ($49)\"},{\"id\":\"ASIN_Q3R4S5T6U7\",\"name\":\"Cozy Heated Electric Blanket ($55)\"},{\"id\":\"ASIN_V8W9X0Y1Z2\",\"name\":\"Whiskey Glass Gift Set of 2 ($42)\"}]\nReturn JSON only, 5 picks."}
    ]
}).encode()

try:
    req = urllib.request.Request(URL, data=body, method="POST", headers={
        "Authorization": f"Bearer {KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=90) as resp:
        data = json.loads(resp.read().decode())
    content = data["choices"][0]["message"]["content"].strip()
    if content.startswith("```json"):
        content = content[len("```json"):].rstrip("`").strip()
    try:
        picks = json.loads(content)
        print(f"✅ Valid JSON — {len(picks.get('picks', []))} picks returned:")
        print(json.dumps(picks, indent=2))
    except Exception as e:
        print(f"⚠️  Content JSON parse fail: {e}")
        print("content[:1000] =", content[:1000])
except urllib.error.HTTPError as e:
    try:
        err = json.loads(e.read().decode())
        print(f"❌ HTTP {e.code}: {json.dumps(err, indent=2)[:600]}")
    except Exception:
        print(f"❌ HTTP {e.code}: {e.reason}")
except Exception as e:
    print(f"💥 {type(e).__name__}: {e}")
