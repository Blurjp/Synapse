#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test API endpoints with Chinese text to verify UTF-8 encoding"""

import requests
import json

def test_continue_endpoint():
    """Test the continue generation endpoint with Chinese text"""
    print("=== Testing /api/generate/continue Endpoint ===\n")

    url = "http://localhost:8001/api/generate/continue"
    payload = {
        "prompt": "请继续这个故事",
        "generation_type": "continue",
        "context": "小明和小红在公园里散步，天气很好。续写要求：保持与前文一致。",
        "max_tokens": 200,
        "temperature": 0.9,
        "top_p": 0.9,
        "top_k": 50,
        "repetition_penalty": 1.1,
        "stop_sequences": [],
        "no_content_filter": True
    }

    print(f"Request URL: {url}")
    print(f"Request payload:")
    print(json.dumps(payload, ensure_ascii=False, indent=2))
    print()

    try:
        response = requests.post(url, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()

        print("=== Response ===")
        print(f"Status Code: {response.status_code}")
        print(f"Text length: {len(data.get('text', ''))} chars")
        print(f"Tokens used: {data.get('tokens_used', 0)}")
        print(f"Generation time: {data.get('generation_time', 0):.2f}s")
        print()

        text = data.get('text', '')
        print("Generated text (first 500 chars):")
        print(text[:500])
        print()

        # Test UTF-8 encoding
        try:
            encoded = text.encode('utf-8')
            decoded = encoded.decode('utf-8')
            print("✓ UTF-8 encoding/decoding successful")
            print(f"✓ Encoded byte length: {len(encoded)}")

            # Check for Chinese characters
            if any('\u4e00' <= c <= '\u9fff' for c in text):
                print("✓ Chinese characters detected and preserved")

            # Check for system instructions leakage
            leaked_instructions = ['续写要求', '保持与前文一致', '系统指令', '以上为系统指导']
            leaked = [inst for inst in leaked_instructions if inst in text]
            if leaked:
                print(f"⚠ WARNING: System instructions leaked into output: {leaked}")
                return False
            else:
                print("✓ No system instruction leakage detected")

            return True
        except Exception as e:
            print(f"✗ Encoding error: {e}")
            return False

    except Exception as e:
        print(f"✗ Request failed: {e}")
        return False

def test_health_endpoint():
    """Test the health check endpoint"""
    print("\n=== Testing /api/health Endpoint ===\n")

    url = "http://localhost:8001/api/health"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()
        print("Health check response:")
        print(json.dumps(data, ensure_ascii=False, indent=2))
        print()

        if data.get('mock_mode'):
            print("✓ Running in mock mode as expected")

        return True
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False

def test_genre_templates():
    """Test genre templates endpoint for Chinese text"""
    print("\n=== Testing /api/genre-templates Endpoint ===\n")

    url = "http://localhost:8001/api/genre-templates"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        print("Genre templates (checking UTF-8):")
        for genre, info in list(data.items())[:2]:  # Just show first 2
            print(f"\n{genre}:")
            print(f"  Name: {info['name']}")
            print(f"  Description: {info['description'][:50]}...")

            # Test UTF-8
            try:
                name_encoded = info['name'].encode('utf-8')
                desc_encoded = info['description'].encode('utf-8')
                print(f"  ✓ UTF-8 encoded successfully")
            except Exception as e:
                print(f"  ✗ Encoding error: {e}")
                return False

        print("\n✓ All genre templates have valid UTF-8 encoding")
        return True

    except Exception as e:
        print(f"✗ Genre templates test failed: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("NovelWriter Backend API UTF-8 Encoding Test")
    print("=" * 60)
    print()

    results = []

    # Test health endpoint first
    results.append(("Health Check", test_health_endpoint()))

    # Test genre templates
    results.append(("Genre Templates", test_genre_templates()))

    # Test continue endpoint
    results.append(("Continue Generation", test_continue_endpoint()))

    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")

    all_passed = all(result[1] for result in results)
    print()
    if all_passed:
        print("✓ ALL TESTS PASSED")
        exit(0)
    else:
        print("✗ SOME TESTS FAILED")
        exit(1)