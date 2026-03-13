#!/bin/bash
echo "🧪 Synapse Frontend Test Runner"
echo "================================"

case "$1" in
    "unit") npm test ;;
    "e2e") npm run test:e2e ;;
    "all") npm test && npm run test:e2e ;;
    *) npm test ;;
esac
