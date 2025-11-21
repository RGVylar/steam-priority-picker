@echo off
REM Test script for Phase 5 - Dynamic game library expansion
REM This script tests the new dynamic game loading functionality

echo.
echo ============================================================
echo Testing Phase 5: Dynamic Game Library Expansion
echo ============================================================
echo.

REM Test 1: Get filters (no auth required)
echo [1] Testing GET /api/filters endpoint
echo.
curl -s http://localhost:8000/api/filters | findstr /v "^$"
echo.
echo.

REM Test 2: Get stats (no auth required) 
echo [2] Testing GET /api/stats endpoint
echo.
curl -s http://localhost:8000/api/stats | findstr /v "^$"
echo.
echo.

echo ============================================================
echo For /api/my-games, you need to be authenticated
echo Login at http://localhost:5173 first, then check browser console
echo for the authorization token
echo ============================================================
echo.
