#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test WebSocket streaming with Chinese text to verify UTF-8 encoding"""

import asyncio
import websockets
import json

async def test_websocket_generation():
    """Test WebSocket streaming with Chinese text"""
    print("=== Testing WebSocket Streaming with Chinese Text ===\n")

    uri = "ws://localhost:8001/ws/novel/test-client-001"

    try:
        async with websockets.connect(uri, ping_timeout=30) as websocket:
            print(f"✓ Connected to {uri}\n")

            # Send generation request
            request = {
                "type": "generate",
                "data": {
                    "prompt": "请续写故事：小明和小红在公园约会",
                    "generation_type": "continue",
                    "context": "这是一个都市爱情故事。续写要求：保持与前文一致的风格。",
                    "max_tokens": 200,
                    "temperature": 0.9,
                    "top_p": 0.9,
                    "top_k": 50,
                    "repetition_penalty": 1.1,
                    "stop_sequences": [],
                    "no_content_filter": True
                }
            }

            print("Sending generation request:")
            print(json.dumps(request, ensure_ascii=False, indent=2))
            print()

            await websocket.send(json.dumps(request, ensure_ascii=False))
            print("✓ Request sent\n")

            # Receive and process responses
            full_text = ""
            chunk_count = 0
            generation_started = False

            print("Receiving streaming chunks:")
            print("-" * 60)

            while True:
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10)
                    message = json.loads(response)

                    if message['type'] == 'generation_started':
                        generation_started = True
                        print("✓ Generation started\n")

                    elif message['type'] == 'generation_chunk':
                        chunk_count += 1
                        chunk_text = message['data']['text']
                        full_text = message['data']['total_text']
                        tokens = message['data']['tokens']

                        print(f"Chunk #{chunk_count} (tokens: {tokens}): {chunk_text}", end='', flush=True)

                        # Verify UTF-8 encoding for each chunk
                        try:
                            chunk_text.encode('utf-8').decode('utf-8')
                        except Exception as e:
                            print(f"\n✗ Encoding error in chunk: {e}")
                            return False

                    elif message['type'] == 'generation_complete':
                        print(f"\n\n✓ Generation complete\n")
                        final_text = message['data']['text']
                        tokens = message['data']['tokens']
                        finish_reason = message['data']['finish_reason']

                        print(f"Finish reason: {finish_reason}")
                        print(f"Total tokens: {tokens}")
                        print(f"Total chunks: {chunk_count}")
                        print(f"Text length: {len(final_text)} chars")
                        print()
                        print("-" * 60)
                        print("Full generated text:")
                        print(final_text)
                        print("-" * 60)
                        print()

                        # Verify UTF-8 encoding of final text
                        try:
                            encoded = final_text.encode('utf-8')
                            decoded = encoded.decode('utf-8')
                            print("✓ UTF-8 encoding/decoding successful")
                            print(f"✓ Encoded byte length: {len(encoded)}")

                            # Check for Chinese characters
                            if any('\u4e00' <= c <= '\u9fff' for c in final_text):
                                print("✓ Chinese characters detected and preserved")

                            # Check for system instructions leakage
                            leaked_instructions = ['续写要求', '保持与前文一致', '系统指令', '以上为系统指导']
                            leaked = [inst for inst in leaked_instructions if inst in final_text]
                            if leaked:
                                print(f"⚠ WARNING: System instructions leaked into output: {leaked}")
                                return False
                            else:
                                print("✓ No system instruction leakage detected")

                            # Verify full_text matches final_text
                            if full_text == final_text:
                                print("✓ Streaming text matches final text")
                            else:
                                print("⚠ WARNING: Streaming text doesn't match final text")
                                print(f"  Streaming length: {len(full_text)}")
                                print(f"  Final length: {len(final_text)}")

                            return True

                        except Exception as e:
                            print(f"✗ Encoding error: {e}")
                            return False

                    elif message['type'] == 'error':
                        print(f"\n✗ Error: {message['data']['message']}")
                        return False

                except asyncio.TimeoutError:
                    print("\n✗ Timeout waiting for response")
                    return False
                except websockets.exceptions.ConnectionClosed:
                    print("\n✗ Connection closed unexpectedly")
                    return False

    except Exception as e:
        print(f"✗ WebSocket connection failed: {e}")
        return False

async def test_websocket_ping():
    """Test WebSocket ping/pong"""
    print("\n=== Testing WebSocket Ping/Pong ===\n")

    uri = "ws://localhost:8001/ws/novel/test-client-002"

    try:
        async with websockets.connect(uri, ping_timeout=30) as websocket:
            print(f"✓ Connected to {uri}\n")

            # Send ping
            ping_message = {
                "type": "ping",
                "data": {}
            }

            await websocket.send(json.dumps(ping_message))
            print("✓ Ping sent")

            # Receive pong
            response = await asyncio.wait_for(websocket.recv(), timeout=5)
            message = json.loads(response)

            if message['type'] == 'pong':
                print("✓ Pong received")
                return True
            else:
                print(f"✗ Unexpected response: {message['type']}")
                return False

    except Exception as e:
        print(f"✗ Ping test failed: {e}")
        return False

async def main():
    print("=" * 60)
    print("NovelWriter WebSocket UTF-8 Encoding Test")
    print("=" * 60)
    print()

    results = []

    # Test ping/pong first
    results.append(("WebSocket Ping/Pong", await test_websocket_ping()))

    # Test generation
    results.append(("WebSocket Generation", await test_websocket_generation()))

    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")

    all_passed = all(result[1] for result in results)
    print()
    if all_passed:
        print("✓ ALL WEBSOCKET TESTS PASSED")
        return 0
    else:
        print("✗ SOME WEBSOCKET TESTS FAILED")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    exit(exit_code)