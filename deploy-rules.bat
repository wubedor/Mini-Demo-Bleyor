@echo off
echo 🔥 Deploying Firestore Rules...
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools
)

echo 📝 Deploying updated Firestore rules...
firebase deploy --only firestore:rules

echo.
echo ✅ Rules deployed successfully!
echo 🔄 Wait 1-2 minutes for rules to propagate
echo 📱 Refresh your app and test My Bookings page
pause
