# 🎓 Attendance Tracker

A full-stack web application designed to help engineering students seamlessly track their mandatory class and lab attendance without the friction of manual data entry. 

## 🚀 The Problem & Solution

**The Problem:** 
As a first-year B.Tech student navigating a complex timetable and hostel life, keeping track of mandatory attendance across various lectures and labs is tedious. Relying on memory leaves students guessing if they are meeting strict attendance requirements (like the standard 75% threshold).

**The Solution:** 
A mobile-friendly web app that uses an AI agent to instantly convert timetable screenshots into a personalized, one-tap daily tracker. Students get their exact attendance percentage in real-time, eliminating the guesswork.

## ✨ Key Features
* **AI-Powered Setup:** Upload a screenshot of your university timetable, and the integrated Gemini AI agent automatically parses the image and builds your weekly schedule.
* **One-Tap Logging:** Quickly mark classes as "Attended" or "Missed" with a single click as you walk out of the lecture hall.
* **Real-Time Analytics:** Instantly calculates and displays your current attendance percentage.
* **Cloud Sync:** All data is securely saved to a Supabase PostgreSQL database, ensuring your progress is never lost across devices.

## 🛠️ Tech Stack
* **Frontend:** React, Vite, Tailwind CSS
* **Backend & Auth:** Supabase (PostgreSQL, Row Level Security)
* **AI Integration:** Google Gemini 1.5 Flash (via `@google/generative-ai` SDK)

## 🧪 Try It Out (Live Demo)
*(Note: Add your live hosting link here once deployed, e.g., Vercel or Netlify)*

You do not need to use your real email to test the application. You can log in instantly using the demo credentials:
* **Email:** `visitor@demo.com`
* **Password:** `password123`

*(Since email verification is intentionally disabled for demo purposes, you can also make up any fake email to instantly bypass the login screen).*
