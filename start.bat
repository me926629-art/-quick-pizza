@echo off
cd /d "D:\froNt eNd\كويك"
set JWT_SECRET=quick_pizza_secret_key_2024
set MONGODB_URI=mongodb://localhost:27017/quick_pizza
set PORT=3000
node backend/server.js
