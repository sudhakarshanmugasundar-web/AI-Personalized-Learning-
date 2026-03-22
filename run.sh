#!/bin/bash

# Port number Server uses
PORT=8080

# Find and kill any process using the port
PID=$(lsof -t -i:$PORT)
if [ ! -z "$PID" ]; then
  echo "Killing process on port $PORT (PID: $PID)..."
  kill -9 $PID
fi

# Create bin directory for compiled files
mkdir -p bin

# Compile Java files
echo "Compiling..."
javac -d bin backend/Server.java backend/Database.java database/StudentProgress.java ai_engine/RecommendationEngine.java

# Check compilation success
if [ $? -eq 0 ]; then
  echo "Compilation successful."
  echo "Starting Server..."
  # Run the server with classpath set to the 'bin' directory
  java -cp bin Server
else
  echo "Compilation failed."
fi
