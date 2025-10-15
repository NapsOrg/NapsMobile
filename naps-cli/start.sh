/*
 * This is the source code of Naps for Mobile Devices v. 5.x.x.
 * It is licensed under GNU GPL v. 2 or later.
 * You should have received a copy of the license in this archive (see LICENSE).
 *
 * Copyright Dmytro Gnatyk, 2025.
 */

#!/bin/bash

echo "=== STARTING REACT NATIVE APP ==="

# Check if node_modules directory exists; if not, install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install || { echo "npm install failed!"; exit 1; }
fi

echo "Starting Expo with cache clear..."
npx expo start -c || { echo "Failed to start Expo!"; exit 1; }

echo "=== APP STARTED ==="