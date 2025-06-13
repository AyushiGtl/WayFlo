from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import numpy as np
import soundfile as sf
import io
import json
import torch
from pydantic import BaseModel
from typing import List, Dict
import base64
import logging
import asyncio
from starlette.websockets import WebSocketState

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jovial-madeleine-8f088f.netlify.app",  # Your Netlify app
        "http://localhost:3000",  # React development server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the intent recognition pipeline
intent_classifier = pipeline(
    "text-classification",
    model="facebook/bart-large-mnli",
    device=0 if torch.cuda.is_available() else -1
)

# Define intents and their corresponding actions
INTENTS = [
    "navigate to location",
    "find nearest facility",
    "current location",
    "change destination",
    "start navigation",
    "cancel navigation",
    "help"
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Total connections: {len(self.active_connections)}")

manager = ConnectionManager()

class IntentRequest(BaseModel):
    text: str

class IntentResponse(BaseModel):
    intent: str
    confidence: float
    action: Dict

def classify_intent(text: str) -> dict:
    # Create hypothesis pairs for zero-shot classification
    candidate_labels = INTENTS
    result = intent_classifier(text, candidate_labels)
    
    # Get the highest scoring intent
    intent = result['labels'][0]
    confidence = result['scores'][0]
    
    # Define actions based on intent
    actions = {
        "navigate to location": {
            "type": "NAVIGATE",
            "params": {"destination": extract_location(text)}
        },
        "find nearest facility": {
            "type": "FIND_NEAREST",
            "params": {"facility_type": extract_facility_type(text)}
        },
        "current location": {
            "type": "GET_LOCATION",
            "params": {}
        },
        "change destination": {
            "type": "CHANGE_DESTINATION",
            "params": {}
        },
        "start navigation": {
            "type": "START_NAVIGATION",
            "params": {}
        },
        "cancel navigation": {
            "type": "CANCEL_NAVIGATION",
            "params": {}
        },
        "help": {
            "type": "SHOW_HELP",
            "params": {}
        }
    }
    
    return {
        "intent": intent,
        "confidence": confidence,
        "action": actions.get(intent, {"type": "UNKNOWN", "params": {}})
    }

def extract_location(text: str) -> str:
    # Simple location extraction - in production, use a more sophisticated NER model
    locations = ["room 101", "room 102", "lab a3", "library", "canteen", "admin office"]
    for location in locations:
        if location in text.lower():
            return location
    return ""

def extract_facility_type(text: str) -> str:
    # Simple facility type extraction
    facilities = ["library", "canteen", "lab", "room", "office"]
    for facility in facilities:
        if facility in text.lower():
            return facility
    return ""

@app.post("/api/intent")
async def process_intent(request: IntentRequest) -> IntentResponse:
    result = classify_intent(request.text)
    return IntentResponse(**result)

@app.websocket("/ws/voice")
async def voice_websocket(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            try:
                # Receive audio data as base64 string
                data = await websocket.receive_text()
                logger.info("Received audio data")
                
                try:
                    # Convert base64 to audio data
                    audio_bytes = base64.b64decode(data)
                    audio_io = io.BytesIO(audio_bytes)
                    
                    # Process audio (in production, use a speech-to-text model)
                    # For testing, we'll send a mock response
                    mock_text = "show me the way to the library"
                    intent_result = classify_intent(mock_text)
                    
                    response = {
                        "status": "success",
                        "text": mock_text,
                        "intent": intent_result
                    }
                    
                    logger.info(f"Sending response: {response}")
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json(response)
                    
                except Exception as e:
                    logger.error(f"Error processing audio: {str(e)}")
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({
                            "status": "error",
                            "message": "Error processing audio data"
                        })
            
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected")
                break
                
            except Exception as e:
                logger.error(f"WebSocket error: {str(e)}")
                try:
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_json({
                            "status": "error",
                            "message": "Internal server error"
                        })
                except:
                    break
                
    except Exception as e:
        logger.error(f"Fatal WebSocket error: {str(e)}")
    finally:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    import socket
    import sys
    from contextlib import closing
    
    def find_free_port():
        with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
            s.bind(('', 0))
            s.listen(1)
            port = s.getsockname()[1]
            return port
    
    # Get the local IP address
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    # Try port 8000 first, if not available, find a free port
    try:
        port = 8000
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('', port))
    except OSError:
        port = find_free_port()
        print(f"Port 8000 is in use, using port {port} instead")
    
    print(f"Server running at: http://{local_ip}:{port}")
    
    try:
        uvicorn.run(
            app, 
            host="0.0.0.0",
            port=port,
            ws_ping_interval=20.0,
            ws_ping_timeout=20.0
        )
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1) 