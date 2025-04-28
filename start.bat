@echo off
echo Starting Chat Application...
echo.

echo Starting the backend server...
start cmd /k "cd server && npm install && npm start"

echo Starting the frontend client...
start cmd /k "cd client && npm install && npm run dev"

echo.
echo Servers are starting! Please wait...
echo Backend server will run on http://localhost:5002
echo Frontend client will run on http://localhost:5173
echo.
echo Press any key to exit this window (servers will continue running)
pause > nul 