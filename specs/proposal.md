# Socratic Tutor App - Feature Specification

## Overview
An AI-powered educational application that implements the Socratic method of teaching through dialogue. The tutor asks guiding questions rather than providing direct answers, helping learners discover knowledge through critical thinking.

## Core Features

### 1. Interactive Dialogue System
- Natural conversation interface with AI tutor
- Context-aware questioning that adapts to learner's understanding
- Multi-turn dialogue with memory of previous interactions

### 2. Subject Domain Support
- Math (algebra, geometry, calculus)
- Science (physics, chemistry, biology)
- Humanities (philosophy, literature, history)
- Custom subject upload

### 3. Learning Progress Tracking
- Session history and review
- Concept mastery indicators
- Personalized learning paths

### 4. User Management
- User authentication (OAuth + email)
- Profile and preferences
- Learning goals setting

## Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Redis (caching)
- **AI**: OpenAI API / Claude API for Socratic dialogue
- **Deployment**: Docker + Docker Compose

## Success Criteria
- Tutor maintains Socratic style (questions vs answers ratio > 3:1)
- Response latency < 2s
- Context retention across 10+ turns
- Mobile-responsive UI
