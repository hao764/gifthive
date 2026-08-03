# Dogfood Report: GiftHive

| Field | Value |
|-------|-------|
| **Date** | 2026-07-22 |
| **App URL** | http://localhost:3000 |
| **Session** | gifthive |
| **Scope** | Full app: home, finder, results, For Him |
| **Method** | HTTP inspection of rendered output (browser screenshots unavailable — Chrome download timed out in sandbox) |

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 2 |
| Medium | 3 |
| Low | 0 |
| **Total** | **6** |

## Issues

### ISSUE-001: Over half the images are broken (HTTP 404)  — CRITICAL

14 of ~23 unique Unsplash image URLs return 404, including the **homepage hero image** and 4 of 6 recipient tiles (For Her/Kids/Parents/Friends).

Repro: `curl -s -o /dev/null -w "%{http_code}" "https://images.unsplash.com/photo-1513885535751-8b9238bd3dda?..."` -> 404

### ISSUE-002: 5 nav links lead to 404 — HIGH

Only `/for-him` exists. `/for-her`, `/for-kids`, `/for-parents`, `/for-friends`, `/for-coworkers` all 404, but the navbar + homepage grid link to all 6.

### ISSUE-003: For Him filter buttons do nothing — HIGH

Tech/Wear/Home/Sports/Audio/Daily filters have no state or click handler; grid never filters.

### ISSUE-004: Results page ignores quiz answers — MEDIUM

Profile summary always shows hardcoded "For Him / Birthday" regardless of actual answers; results identical for everyone.

### ISSUE-005: Wrong/duplicated product image — MEDIUM

Candle image reused for "Insulated Travel Mug"; same URL most-repeated on For Him.

### ISSUE-006: Newsletter form is a dead end — MEDIUM

Footer form has no onSubmit/action; submitting a valid email gives no feedback.
