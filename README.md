# WayFlo
# QR-Based Indoor Navigation System for College

A lightweight, QR-code-based indoor navigation system designed for colleges. This system helps students, visitors, and staff navigate complex indoor spaces using QR scans, shortest-path routing, and simple step-by-step directions.

<a href="https://wayflo-indoor-navigation.netlify.app/" target="_blank" rel="noopener noreferrer">Live Demo</a>


---

## Features

- Scan QR codes placed at rooms, junctions, and entry points
- Detect current location using the scanned QR
- Select a destination and get turn-by-turn directions
- Backend API computes the shortest path using Dijkstra’s algorithm
- JSON-based dynamic map representation
- Easy to update paths and directions without modifying code

---
## User Guide

Follow these steps to navigate your college using the QR-Based Indoor Navigation System:

### Option 1: QR-Based Navigation

#### 1. Scan Your Current Location
- Click the **Scan QR** button on the home screen.
- Point your camera at the QR code placed at your current location.
- The app will automatically detect and show your current location.

#### 2. Select Your Destination
- Once your location is scanned, a dropdown of possible destinations will appear.
- Choose your desired destination.
- Click **"Get Directions"** to fetch the shortest path.

### Option 2: Manual Selection

#### 1. Open Manual Navigation
- Click the **Manual Selection** button.
- Choose both **From** (source) and **To** (destination) locations from the dropdowns.

#### 2. Generate Directions
- Click **"Get Directions"** to receive the route.
- The system will calculate the shortest path between the two points.

> Use this method when QR scanning is unavailable or to explore routes beforehand.

### Follow Navigation Steps
- You’ll receive a list of directions like:
  > Go right for 7 steps to Lab 1
- Each step includes:
  - **Direction** (Forward / Left / Right / Back)
  - **Distance** in steps
  - **From → To** location info
- The current step is visually highlighted.

### Verify Each Step (Optional)
- During navigation, click **"Scan QR"**.
- Scan the QR at the next location to confirm you’ve reached it.
- The app automatically moves to the next step.

### Reset / Clear Route
- To reset everything and start over, click the **Clear Route** button.

> **Tip**: Always scan QR codes while standing right in front of them to ensure accuracy.
---

## How It Works

### 1. Place QR Codes

Print and place QR codes at important indoor locations like:

- Entrances  
- Classrooms & Labs  
- Office / Reception  
- Hallway Junctions  
- Staircases, Lifts  
- Library / Washroom / Canteen  
- Placement Cell

Each QR represents a point in a graph map. It’s placed at key decision points like turns, junctions, or doors.

Example: QR contains
```json
{ "id": 2, "name": "Reception" }
```

### 2. Measure and Record Paths

Between every two connected QR locations:

- Stand at the QR code (this is your reference point).
- Walk to the next QR code.
- Measure distance in steps or meters.
- Record the direction:
  - F = Forward
  - L = Left
  - R = Right
  - B = Back

---
## JSON Map Format
Here’s a sample JSON map representation:

```json
[
  {
    "id": 1,
    "name": "Entrance",
    "connections": [
      { "to": 2, "distance": 10, "direction": "F" }
    ]
  },
  {
    "id": 2,
    "name": "Reception",
    "connections": [
      { "to": 1, "distance": 10, "direction": "B" },
      { "to": 3, "distance": 7, "direction": "R" }
    ]
  },
  {
    "id": 3,
    "name": "Lab 1",
    "connections": [
      { "to": 2, "distance": 7, "direction": "L" }
    ]
  }
]
```
---
## Backend Logic
The backend is built using Rust and deployed on Render.

**Flow:**
1. User scans a QR → app gets the current location (e.g., "id": 2).
2. User selects the destination.
3. Backend computes the shortest path using Dijkstra.
4. Returns step-by-step instructions.

Sample API Response:
```json
{
  "from": "Reception",
  "to": "Lab 1",
  "path": [2, 3],
  "directions": [
    "Turn right and walk 7 steps to Lab 1"
  ],
  "total_distance": 7
}
```
---
## Live URLs
**Frontend:** https://wayflo-indoor-navigation.netlify.app/


---
## Tech Stack
- **Frontend:**	HTML, CSS, JavaScript
- **QR Scanner:**	Html5Qrcode.js
- **Backend:**	Rust
- **Hosting:**	Netlify (Frontend), Render (Backend)

---
## Challenges Faced
- **Accurate Mapping:** Measuring real-world distances in a repeatable way was tricky, especially with steps versus meters.
- **Indoor Positioning:** Without GPS, QR codes had to be placed at logical checkpoints to maintain context.
- **Error Handling:** Distinguishing between wrong QR scans and out-of-path scans was critical for good UX.

---
## Future Scope
- **Live Turn Detection:** Integrate compass/gyroscope for better orientation feedback.
- **Floor Plan Integration:** Overlay paths on digital floor maps for visual navigation.
- **Progressive Web App (PWA):** Allow offline usage inside buildings.
- **Dynamic QR Management:** Auto-generate QR codes with backend-linked metadata.
- **Admin Panel:** GUI for adding/removing paths and regenerating the map.




