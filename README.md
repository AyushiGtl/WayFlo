# WayFlo
# QR-Based Indoor Navigation System for College


---

### Place QR Codes

Start by walking through college and placing QR codes at important locations. These are **hot points**:

- Entrance
- Classrooms
- Labs
- Office / Reception
- Hallway junctions (where paths split)
- Staircases or lifts
- Library / Washroom / Canteen
- Placement Cell

Each QR code represents a **point in a map** and should be stuck where people make a choice — like a turn, entry, or junction.

Use a printed QR with a room name below it.

---

### Measure and Record Paths

Now, between every two QR points that are connected:
- Always stand in front of QR, that's the refrence point
- Measure the **distance** in steps or meters.
- Note the **direction** you move:  
  - `F` = Forward  
  - `L` = Left  
  - `R` = Right  
  - `B` = Back

---

### Example 

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

### Backend 

Once your JSON map is ready, the backend takes care of finding the shortest path between two places.

#### Backend follows:

1. **User scans** a QR code → backend gets their current location (e.g., `"id": 2`).
2. **User selects** a destination from the app or UI.
3. The backend runs a **shortest path algorithm** (probably Dijkstra) using the JSON map.
4. It builds **step-by-step directions** using the stored distances and directions.
5. The response looks like this:

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
