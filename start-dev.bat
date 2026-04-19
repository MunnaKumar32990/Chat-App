@echo off
echo ========================================
echo   Chat Application - Development Mode
echo ========================================
echo.

echo Starting Backend Server...
start cmd /k "cd backend && npm install && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Client...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ========================================
echo   Servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5002
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit (servers will continue running)
pause > nul
