#!/bin/bash

# ──────────────────────────────────────────────────────────────
#  AI Personalized Learning — Server Launcher v6.0
# ──────────────────────────────────────────────────────────────

PORT=8080
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── 0. Load .env file if present (secure key storage) ─────────
if [ -f "$SCRIPT_DIR/.env" ]; then
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs) 2>/dev/null
  echo "📄 Loaded .env file"
fi

# ── 1. Kill any process already on the port ──────────────────
PID=$(lsof -t -i:$PORT 2>/dev/null)
if [ -n "$PID" ]; then
  echo "🔄 Killing process on port $PORT (PID: $PID)..."
  kill -9 "$PID"
  sleep 0.5
fi

# ── 2. Check for OpenAI API Key ───────────────────────────────
if [ -z "$OPENAI_API_KEY" ]; then
  echo ""
  echo "┌─────────────────────────────────────────────────────┐"
  echo "│  ⚠️  OPENAI_API_KEY is not set                      │"
  echo "│  AI Chatbot and TTS will not work.                  │"
  echo "│                                                     │"
  echo "│  Option 1 — Create a .env file in project root:    │"
  echo "│    echo 'OPENAI_API_KEY=sk-...' > .env             │"
  echo "│                                                     │"
  echo "│  Option 2 — Export before running:                 │"
  echo "│    export OPENAI_API_KEY=sk-...                     │"
  echo "│    bash run.sh                                      │"
  echo "└─────────────────────────────────────────────────────┘"
  echo ""
  echo "⚡ Starting server anyway (AI disabled)..."
else
  echo "✅ OpenAI API Key detected — AI Chatbot + TTS enabled!"
fi

# ── 3. Create bin directory ───────────────────────────────────
mkdir -p bin

# ── 4. Compile all Java files ─────────────────────────────────
echo "🔨 Compiling Java source files..."
javac -d bin \
  backend/Server.java \
  backend/Database.java \
  backend/ChatService.java \
  database/StudentProgress.java \
  ai_engine/RecommendationEngine.java

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Compilation failed. Check the errors above."
  exit 1
fi

echo "✅ Compilation successful."
echo ""
echo "🚀 Starting AI Learning Platform server..."
echo "   → Open: http://localhost:$PORT/frontend/index.html"
echo "   → Or:   file://$(pwd)/frontend/index.html"
echo ""

# ── 5. Start Node.js AI Backend in Background ────────────────
echo "🤖 Starting AI Backend (Node.js) on port 5001..."
/usr/local/bin/node backend/server.js > node_server.log 2>&1 &
NODE_PID=$!
echo "   → Node.js PID: $NODE_PID"

# ── 6. Start Java Server (Main Platform) ─────────────────────
echo "☕ Starting Java Server on port $PORT..."
OPENAI_API_KEY="$OPENAI_API_KEY" java -cp bin Server

# Cleanup Node on exit
kill $NODE_PID

