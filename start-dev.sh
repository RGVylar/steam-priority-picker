#!/bin/bash
# Start both backend and frontend servers

echo "🚀 Starting Steam Priority Picker..."
echo ""

# Start backend in background
echo "📡 Starting backend on http://localhost:8000"
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""

# Give backend time to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend on http://localhost:5173"
cd ../web
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo ""

echo "✅ Both servers running!"
echo "   Backend:  http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   Press Ctrl+C to stop both"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
