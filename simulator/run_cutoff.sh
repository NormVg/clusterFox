#!/bin/bash

# Run Cutoff Module Simulator
# This script starts a cutoff module simulator

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Cutoff Module Simulator for ClusterFox  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Error: Python 3 is not installed${NC}"
    exit 1
fi

# Check if requests module is installed
if ! python3 -c "import requests" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Installing required dependencies...${NC}"
    pip3 install requests
fi

# Default values
UMID="CUTOFF-$(( RANDOM % 9000 + 1000 ))"
NAME="Cutoff Relay"
POOL="POOL001"
URL="http://localhost:3000"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --umid)
            UMID="$2"
            shift 2
            ;;
        --name)
            NAME="$2"
            shift 2
            ;;
        --pool)
            POOL="$2"
            shift 2
            ;;
        --url)
            URL="$2"
            shift 2
            ;;
        --help)
            echo "Usage: ./run_cutoff.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --umid <id>     Unique Module ID (default: auto-generated)"
            echo "  --name <name>   Module name (default: Cutoff Relay)"
            echo "  --pool <pool>   Pool ID (default: POOL001)"
            echo "  --url <url>     Server URL (default: http://localhost:3001)"
            echo "  --help          Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./run_cutoff.sh"
            echo "  ./run_cutoff.sh --name 'Emergency Relay' --umid CUTOFF-001"
            echo "  ./run_cutoff.sh --name 'Power Cutoff A' --pool POOL002"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}Starting cutoff module simulator...${NC}"
echo ""
echo -e "UMID: ${YELLOW}${UMID}${NC}"
echo -e "Name: ${YELLOW}${NAME}${NC}"
echo -e "Pool: ${YELLOW}${POOL}${NC}"
echo -e "Server: ${YELLOW}${URL}${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo ""

# Run the simulator
python3 cutoff_simulator.py \
    --umid "$UMID" \
    --name "$NAME" \
    --pool "$POOL" \
    --url "$URL"
