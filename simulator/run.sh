#!/bin/bash

echo "🦊 ClusterFox Module Simulator - Quick Start"
echo "=============================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

echo "✅ Python 3 found"

# Check if requests is installed
if ! python3 -c "import requests" &> /dev/null; then
    echo "📦 Installing required packages..."
    pip3 install -r requirements.txt
else
    echo "✅ Required packages already installed"
fi

echo ""
echo "🚀 Starting simulator..."
echo "   Press Ctrl+C to stop"
echo ""

python3 module_simulator.py
