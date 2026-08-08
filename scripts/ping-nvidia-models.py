#!/usr/bin/env python3
"""Ping each candidate model on NVIDIA NIM to find one that's alive (post 2026-08-07 EOL of deepseek-v4-flash)."""
import urllib.request, json

KEY = "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"
URL = "https://integrate.api.nvidia.com/v1/chat/completions"

MODELS = [
    "meta/llama-4-scout-17b-16e-instruct",
    "meta/llama-4-maverick-17b-128e-instruct",
    "deepseek-ai/deepseek-v4-pro",
    "deepseek-ai/deepseek-r1",
    "qwen/qwen3.5-32b-instruct",
    "zai-org/glm-5.2",
    "mistralai/mistral-small-3.1-24b-instruct",
    "meta/llama-3.1-405b-instruct",
    "nvidia/nemotron-3-super-120b-a12b",
    "meta/llama-3.3-70b-instruct",
    "google/gemma-3-27b-it",
    "microsoft/phi-4-multimodal-instruct",
]

for m in MODELS:
    try:
        body = json.dumps({
            "model": m,
            "messages": [{"role": "user", "content": "Reply with exactly: pong"}],
            "max_tokens": 12,
            "temperature": 0,
            "stream": False,
        }).encode()
        req = urllib.request.Request(URL, data=body, method="POST", headers={
            "Authorization": f"Bearer {KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        })
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
        try:
            content = data["choices"][0]["message"]["content"].strip()
            print(f"✅ [{m}] -> {content[:50]}")
        except Exception:
            print(f"⚠️  [{m}] -> unexpected json: {str(data)[:180]}")
    except urllib.error.HTTPError as e:
        try:
            err = json.loads(e.read().decode())
            print(f"❌ [{m}] -> HTTP {e.code}: {err.get('title','')} {err.get('detail','')[:180]}")
        except Exception:
            print(f"❌ [{m}] -> HTTP {e.code}: {str(e.reason)[:150]}")
    except Exception as e:
        print(f"💥 [{m}] -> {type(e).__name__}: {str(e)[:150]}")
