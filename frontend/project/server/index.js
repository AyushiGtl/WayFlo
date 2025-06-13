import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Sample map data - this would typically come from a database
let mapData = [
  {
    "id": 1,
    "name": "Main Entrance",
    "type": "entrance",
    "connections": [
      { "to": 2, "distance": 15, "direction": "F" },
      { "to": 3, "distance": 8, "direction": "R" }
    ]
  },
  {
    "id": 2,
    "name": "Reception",
    "type": "office",
    "connections": [
      { "to": 1, "distance": 15, "direction": "B" },
      { "to": 4, "distance": 12, "direction": "L" },
      { "to": 5, "distance": 10, "direction": "R" }
    ]
  },
  {
    "id": 3,
    "name": "Security Office",
    "type": "office",
    "connections": [
      { "to": 1, "distance": 8, "direction": "L" },
      { "to": 6, "distance": 6, "direction": "F" }
    ]
  },
  {
    "id": 4,
    "name": "Cafeteria",
    "type": "facility",
    "connections": [
      { "to": 2, "distance": 12, "direction": "R" },
      { "to": 7, "distance": 20, "direction": "F" }
    ]
  },
  {
    "id": 5,
    "name": "Library",
    "type": "facility",
    "connections": [
      { "to": 2, "distance": 10, "direction": "L" },
      { "to": 8, "distance": 18, "direction": "F" }
    ]
  },
  {
    "id": 6,
    "name": "Hallway Junction A",
    "type": "junction",
    "connections": [
      { "to": 3, "distance": 6, "direction": "B" },
      { "to": 9, "distance": 14, "direction": "L" },
      { "to": 10, "distance": 14, "direction": "R" }
    ]
  },
  {
    "id": 7,
    "name": "Computer Lab 1",
    "type": "lab",
    "connections": [
      { "to": 4, "distance": 20, "direction": "B" },
      { "to": 11, "distance": 8, "direction": "R" }
    ]
  },
  {
    "id": 8,
    "name": "Classroom A1",
    "type": "classroom",
    "connections": [
      { "to": 5, "distance": 18, "direction": "B" },
      { "to": 12, "distance": 5, "direction": "L" }
    ]
  },
  {
    "id": 9,
    "name": "Physics Lab",
    "type": "lab",
    "connections": [
      { "to": 6, "distance": 14, "direction": "R" }
    ]
  },
  {
    "id": 10,
    "name": "Chemistry Lab",
    "type": "lab",
    "connections": [
      { "to": 6, "distance": 14, "direction": "L" }
    ]
  },
  {
    "id": 11,
    "name": "Computer Lab 2",
    "type": "lab",
    "connections": [
      { "to": 7, "distance": 8, "direction": "L" }
    ]
  },
  {
    "id": 12,
    "name": "Classroom A2",
    "type": "classroom",
    "connections": [
      { "to": 8, "distance": 5, "direction": "R" }
    ]
  }
];

// Dijkstra's algorithm for shortest path
function findShortestPath(start, end) {
  const distances = {};
  const previous = {};
  const unvisited = new Set();
  
  // Initialize distances
  mapData.forEach(node => {
    distances[node.id] = node.id === start ? 0 : Infinity;
    unvisited.add(node.id);
  });
  
  while (unvisited.size > 0) {
    // Find unvisited node with minimum distance
    let current = null;
    for (let nodeId of unvisited) {
      if (current === null || distances[nodeId] < distances[current]) {
        current = nodeId;
      }
    }
    
    if (current === end) break;
    if (distances[current] === Infinity) break;
    
    unvisited.delete(current);
    
    // Update distances to neighbors
    const currentNode = mapData.find(n => n.id === current);
    if (currentNode) {
      currentNode.connections.forEach(connection => {
        const neighbor = connection.to;
        const distance = distances[current] + connection.distance;
        
        if (distance < distances[neighbor]) {
          distances[neighbor] = distance;
          previous[neighbor] = { from: current, direction: connection.direction, distance: connection.distance };
        }
      });
    }
  }
  
  // Reconstruct path
  const path = [];
  let current = end;
  
  while (previous[current]) {
    const step = previous[current];
    const fromNode = mapData.find(n => n.id === step.from);
    const toNode = mapData.find(n => n.id === current);
    
    path.unshift({
      from: fromNode.name,
      to: toNode.name,
      direction: step.direction,
      distance: step.distance
    });
    
    current = step.from;
  }
  
  return path;
}

// API Routes
app.get('/api/locations', (req, res) => {
  const locations = mapData.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type
  }));
  res.json(locations);
});

app.get('/api/location/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const location = mapData.find(node => node.id === id);
  
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  
  res.json(location);
});

app.post('/api/navigate', (req, res) => {
  const { from, to } = req.body;
  
  if (!from || !to) {
    return res.status(400).json({ error: 'From and to locations are required' });
  }
  
  const path = findShortestPath(from, to);
  
  if (path.length === 0) {
    return res.status(404).json({ error: 'No path found between locations' });
  }
  
  res.json({ path, totalSteps: path.reduce((sum, step) => sum + step.distance, 0) });
});

app.post('/api/admin/location', (req, res) => {
  const { name, type, connections } = req.body;
  
  const newId = Math.max(...mapData.map(n => n.id)) + 1;
  const newLocation = {
    id: newId,
    name,
    type,
    connections: connections || []
  };
  
  mapData.push(newLocation);
  res.json(newLocation);
});

app.put('/api/admin/location/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const locationIndex = mapData.findIndex(n => n.id === id);
  
  if (locationIndex === -1) {
    return res.status(404).json({ error: 'Location not found' });
  }
  
  mapData[locationIndex] = { ...mapData[locationIndex], ...req.body };
  res.json(mapData[locationIndex]);
});

app.delete('/api/admin/location/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const locationIndex = mapData.findIndex(n => n.id === id);
  
  if (locationIndex === -1) {
    return res.status(404).json({ error: 'Location not found' });
  }
  
  mapData.splice(locationIndex, 1);
  
  // Remove connections to this location
  mapData.forEach(node => {
    node.connections = node.connections.filter(conn => conn.to !== id);
  });
  
  res.json({ message: 'Location deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`Navigation API running on http://localhost:${PORT}`);
});