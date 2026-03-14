#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Unit tests for LLM handlers and prompt generation with UTF-8 encoding"""

import sys
import os
sys.path.insert(0, '/Users/jianphua/projects/NovelWriter/qwen-local-chat/backend')

import asyncio
from app.prompts import (
    get_chapter_prompt,
    get_dialogue_prompt,
    get_continue_prompt,
    get_scene_prompt,
    get_text_manipulation_prompt,
    ADULT_CONTENT_SYSTEM_PROMPT
)

def test_adult_content_system_prompt():
    """Test that system prompt contains Chinese text"""
    print("=== Testing ADULT_CONTENT_SYSTEM_PROMPT ===\n")

    print(f"Length: {len(ADULT_CONTENT_SYSTEM_PROMPT)} chars")
    print(f"First 200 chars: {ADULT_CONTENT_SYSTEM_PROMPT[:200]}")

    # Test UTF-8 encoding
    try:
        encoded = ADULT_CONTENT_SYSTEM_PROMPT.encode('utf-8')
        decoded = encoded.decode('utf-8')
        print(f"✓ UTF-8 encoding/decoding successful")
        print(f"✓ Encoded byte length: {len(encoded)}")

        # Check for expected Chinese terms
        expected_terms = ['成人文学', '激情', '情色场景', '专业技能']
        found_terms = [term for term in expected_terms if term in ADULT_CONTENT_SYSTEM_PROMPT]
        print(f"✓ Found expected terms: {found_terms}")

        return len(found_terms) == len(expected_terms)
    except Exception as e:
        print(f"✗ Encoding error: {e}")
        return False

def test_continue_prompt():
    """Test continue prompt generation"""
    print("\n=== Testing get_continue_prompt() ===\n")

    test_text = "小明和小红在公园里散步，天气很好。他们看着夕阳，心情愉悦。"
    style = {
        'genre': '言情',
        'style_preset': '现代',
        'tone': '浪漫'
    }

    context, prompt = get_continue_prompt(test_text, style)

    print(f"Context length: {len(context)} chars")
    print(f"Prompt length: {len(prompt)} chars")
    print(f"Prompt: {prompt}")
    print()

    # Test UTF-8 encoding
    try:
        context.encode('utf-8').decode('utf-8')
        prompt.encode('utf-8').decode('utf-8')
        print("✓ UTF-8 encoding/decoding successful")

        # Check for expected content
        checks = [
            ('续写要求' in context, "续写要求 in context"),
            ('保持与前文一致' in context, "保持与前文一致 in context"),
            (test_text[-200:] == prompt or test_text == prompt, "Prompt matches text"),
            ('系统指导' in context or '不要在生成内容中重复' in context, "Boundary marker in context")
        ]

        all_passed = True
        for check, desc in checks:
            if check:
                print(f"✓ {desc}")
            else:
                print(f"✗ {desc}")
                all_passed = False

        return all_passed
    except Exception as e:
        print(f"✗ Encoding error: {e}")
        return False

def test_chapter_prompt():
    """Test chapter prompt generation"""
    print("\n=== Testing get_chapter_prompt() ===\n")

    outline = "第一章：相遇\n主角在咖啡馆遇到了心仪的女孩，两人展开对话。"
    previous_chapters = [
        "序章：城市的清晨，阳光透过窗帘洒在床上。" * 50  # Make it long
    ]
    style = {
        'genre': '都市',
        'style_preset': '现代',
        'tone': '轻松'
    }
    chapter_length = 3000

    context, prompt = get_chapter_prompt(outline, previous_chapters, style, chapter_length)

    print(f"Context length: {len(context)} chars")
    print(f"Prompt length: {len(prompt)} chars")
    print(f"First 200 chars of context: {context[:200]}")
    print(f"Prompt: {prompt}")
    print()

    # Test UTF-8 encoding
    try:
        context.encode('utf-8').decode('utf-8')
        prompt.encode('utf-8').decode('utf-8')
        print("✓ UTF-8 encoding/decoding successful")

        # Check for expected content
        checks = [
            (outline in context or outline in prompt, "Outline present"),
            ('写作要求' in context, "写作要求 in context"),
            ('详细描写' in context, "详细描写 in context"),
            (str(chapter_length) in context, f"Target length {chapter_length} in context")
        ]

        all_passed = True
        for check, desc in checks:
            if check:
                print(f"✓ {desc}")
            else:
                print(f"✗ {desc}")
                all_passed = False

        return all_passed
    except Exception as e:
        print(f"✗ Encoding error: {e}")
        return False

def test_dialogue_prompt():
    """Test dialogue prompt generation"""
    print("\n=== Testing get_dialogue_prompt() ===\n")

    character_profiles = {
        "小明": "25岁，程序员，性格内向但真诚",
        "小红": "23岁，设计师，活泼开朗"
    }
    scene_context = "咖啡馆的午后，两人相对而坐"
    style = {
        'genre': '都市',
        'tone': '温馨'
    }
    dialogue_turns = 10

    context, prompt = get_dialogue_prompt(character_profiles, scene_context, style, dialogue_turns)

    print(f"Context length: {len(context)} chars")
    print(f"Prompt length: {len(prompt)} chars")
    print(f"First 200 chars of context: {context[:200]}")
    print(f"Prompt: {prompt}")
    print()

    # Test UTF-8 encoding
    try:
        context.encode('utf-8').decode('utf-8')
        prompt.encode('utf-8').decode('utf-8')
        print("✓ UTF-8 encoding/decoding successful")

        # Check for expected content
        checks = [
            (scene_context in context or scene_context in prompt, "Scene context present"),
            ('小明' in context, "小明 in context"),
            ('小红' in context, "小红 in context"),
            ('对话要求' in context, "对话要求 in context")
        ]

        all_passed = True
        for check, desc in checks:
            if check:
                print(f"✓ {desc}")
            else:
                print(f"✗ {desc}")
                all_passed = False

        return all_passed
    except Exception as e:
        print(f"✗ Encoding error: {e}")
        return False

def test_text_manipulation_prompt():
    """Test text manipulation prompt generation"""
    print("\n=== Testing get_text_manipulation_prompt() ===\n")

    test_text = "雨停了，他走出门外，看到彩虹挂在天边。"

    # Test enhance action
    context, prompt = get_text_manipulation_prompt(test_text, "enhance", {"details": ["breasts", "feet"]})

    print(f"Context length: {len(context)} chars")
    print(f"Prompt: {prompt}")
    print()

    # Test UTF-8 encoding
    try:
        context.encode('utf-8').decode('utf-8')
        prompt.encode('utf-8').decode('utf-8')
        print("✓ UTF-8 encoding/decoding successful")

        # Check for expected content
        checks = [
            (test_text in context, "Original text in context"),
            ('增强描写' in context or '任务' in context, "Task description present"),
            ('乳房' in context or '足部' in context, "Detail mappings present")
        ]

        all_passed = True
        for check, desc in checks:
            if check:
                print(f"✓ {desc}")
            else:
                print(f"✗ {desc}")
                all_passed = False

        return all_passed
    except Exception as e:
        print(f"✗ Encoding error: {e}")
        return False

def test_mock_handler():
    """Test mock LLM handler"""
    print("\n=== Testing Mock LLM Handler ===\n")

    os.environ['USE_MOCK_LLM'] = 'true'

    try:
        from app.llm_handler_mock import qwen_handler

        print(f"✓ Mock handler imported successfully")
        print(f"Mock mode: {qwen_handler.mock_mode}")

        # Test generation
        async def test_generation():
            prompt = "请续写：小明看着窗外的雨"
            context = "这是一个都市故事"

            full_text = ""
            chunk_count = 0

            async for chunk in qwen_handler.generate_stream(
                prompt=prompt,
                context=context,
                max_new_tokens=100
            ):
                chunk_count += 1
                full_text += chunk

                # Test UTF-8 encoding of each chunk
                try:
                    chunk.encode('utf-8').decode('utf-8')
                except Exception as e:
                    print(f"✗ Chunk encoding error: {e}")
                    return False

            print(f"✓ Generated {chunk_count} chunks")
            print(f"✓ Total text length: {len(full_text)} chars")
            print(f"✓ Text sample: {full_text[:100]}")

            # Verify UTF-8
            try:
                full_text.encode('utf-8').decode('utf-8')
                print("✓ Full text UTF-8 encoding successful")

                # Check for Chinese characters
                if any('\u4e00' <= c <= '\u9fff' for c in full_text):
                    print("✓ Chinese characters detected")

                return True
            except Exception as e:
                print(f"✗ Encoding error: {e}")
                return False

        return asyncio.run(test_generation())

    except Exception as e:
        print(f"✗ Mock handler test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("NovelWriter Unit Tests - UTF-8 Encoding")
    print("=" * 60)
    print()

    results = []

    # Test prompts
    results.append(("System Prompt", test_adult_content_system_prompt()))
    results.append(("Continue Prompt", test_continue_prompt()))
    results.append(("Chapter Prompt", test_chapter_prompt()))
    results.append(("Dialogue Prompt", test_dialogue_prompt()))
    results.append(("Text Manipulation Prompt", test_text_manipulation_prompt()))

    # Test mock handler
    results.append(("Mock LLM Handler", test_mock_handler()))

    # Summary
    print("\n" + "=" * 60)
    print("Unit Test Summary")
    print("=" * 60)

    for test_name, passed in results:
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")

    all_passed = all(result[1] for result in results)
    print()
    if all_passed:
        print("✓ ALL UNIT TESTS PASSED")
        exit(0)
    else:
        print("✗ SOME UNIT TESTS FAILED")
        exit(1)