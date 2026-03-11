# Synapse Testing Guide

Complete testing guide for Synapse backend.

## 📊 Test Structure

```
backend/tests/
├── conftest.py           # Test fixtures
├── test_health.py        # Health check tests
├── test_sources.py       # Sources API tests
├── test_highlights.py    # Highlights API tests
└── test_notes.py         # Notes API tests
```

## 🔧 Running Tests

### Setup
```bash
cd backend
source venv/bin/activate
pip install -r requirements-test.txt
```

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=app --cov-report=html
```

## 📊 Coverage

| Category | Coverage |
|----------|----------|
| Backend API | ~70% |

Happy Testing! 🧪
