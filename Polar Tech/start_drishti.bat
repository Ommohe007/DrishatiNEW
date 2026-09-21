@echo off
title Project Drishti - SIH 2026 PS-26060
color 0B
echo.
echo  ================================================================
echo   PROJECT DRISHTI - Digital Twin for Antarctic Research Stations
echo   SIH 2026 ^| PS-26060 ^| Ministry of Earth Sciences (MoES)
echo  ================================================================
echo.
echo  [*] Starting backend (FastAPI + Socket.IO)...
start "Drishti Backend" cmd /k "cd /d %~dp0 && python backend\run_drishti.py"
timeout /t 3 >nul
echo  [*] Starting frontend (React + Three.js)...
start "Drishti Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo.
echo  Dashboard  : http://localhost:5173
echo  API Docs   : http://localhost:8000/docs
echo  WebSocket  : ws://localhost:8000/socket.io
echo.
echo  [OK] Both servers launching in separate windows.
echo  Close this window or press any key to exit.
pause >nul
