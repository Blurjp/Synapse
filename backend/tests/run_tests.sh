#!/bin/bash
cd "$(dirname "$0")/.."

if [[ -z "${VIRTUAL_ENV}" ]]; then
    source venv/bin/activate
fi

case "$1" in
    "all") pytest -v ;;
    "coverage") pytest --cov=app --cov-report=html ;;
    "quick") pytest tests/test_health.py tests/test_sources.py tests/test_highlights.py tests/test_notes.py -v ;;
    *) pytest -v ;;
esac
