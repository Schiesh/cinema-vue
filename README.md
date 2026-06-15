# Cinema Vue

A Vue.js 3 frontend for a cinema Point of Sale (POS) system.
Features both a customer booking interface and a cinema operator panel.

## Features

### Customer Booking
- Browse now showing movies
- Select a showing by date and time
- Interactive seat map with real-time availability
- Seat type indicators — standard, premium, wheelchair, companion
- Complete ticket booking with name and email

### Operator Panel (/operator)
- Dashboard with key stats — movies, screens, showings, tickets sold
- Movies manager — add, edit, delete movies
- Screens manager — configure screens and seat maps
- Showings manager — schedule movies with pricing and occupancy tracking

## Tech Stack

- Vue.js 3
- Vue Router
- JavaScript (ES6+)
- Connects to Cinema POS Rails API

## Project Structure

## Setup

```bash
# Install dependencies
npm install

# Set API URL in src/api.js
const API = "http://YOUR_SERVER_IP:3000"

# Start development server
npm run serve -- --host 0.0.0.0

# Build for production
npm run build
```

## Related

- [Cinema POS API](https://github.com/Schiesh/cinema-pos-api) — Rails backend
