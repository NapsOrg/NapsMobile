@echo off
echo === STARTING REACT NATIVE APP ===

if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo npm install failed!
        exit /b 1
    )
)

echo Starting Expo with cache clear...
npx expo start -c
if %errorlevel% neq 0 (
    echo Failed to start Expo!
    exit /b 1
)

echo === APP STARTED ===
pause
