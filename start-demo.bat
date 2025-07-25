@echo off
echo Starting the demo...
echo.
echo Step 1: Starting the backend server...
start "Backend Server" cmd /k "cd /d D:\tmp\demo-simple-md-viewer && node server.js"
timeout /t 3 /nobreak >nul
echo.
echo Step 2: Starting the frontend development server...
start "Frontend Server" cmd /k "cd /d D:\tmp\demo-simple-md-viewer && npm run dev"
echo.
echo Both servers should be starting now!
echo Backend: http://localhost:3300
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this script...
pause >nul
