import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Fab, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Snackbar,
  Tooltip,
  Zoom,
  alpha
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { useNavigate } from 'react-router-dom';
import { config } from '../config';

interface VoiceAssistantProps {
  onCommand: (action: { 
    type: string; 
    params?: { 
      destination?: string;
      arMode?: boolean;
      viewMode?: '2d' | '3d';
      floor?: number;
    } 
  }) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const reconnectTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 2000;
  const navigate = useNavigate();

  // Ref to store handleReconnect function
  const handleReconnectRef = useRef<() => void>(() => {});

  const handleIntent = useCallback((response: any) => {
    if (!response || !response.action) {
      console.log('Invalid intent data received:', response);
      return;
    }

    const { action } = response;
    
    switch (action.type) {
      case 'NAVIGATE':
        if (action.params?.destination) {
          onCommand({
            ...action,
            params: {
              ...action.params,
              viewMode: '2d'
            }
          });
        }
        break;
      case 'START_NAVIGATION':
        onCommand(action);
        break;
      case 'CANCEL_NAVIGATION':
        onCommand({ type: 'CANCEL_NAVIGATION' });
        navigate('/');
        break;
      case 'SHOW_HELP':
        onCommand(action);
        break;
      case 'TOGGLE_AR':
        onCommand({
          type: 'TOGGLE_AR',
          params: {
            arMode: true,
            viewMode: '3d'
          }
        });
        break;
      case 'SWITCH_VIEW':
        onCommand({
          type: 'SWITCH_VIEW',
          params: {
            viewMode: action.params?.viewMode || '2d'
          }
        });
        break;
      case 'CHANGE_FLOOR':
        if (action.params?.floor !== undefined) {
          onCommand({
            type: 'CHANGE_FLOOR',
            params: {
              floor: action.params.floor
            }
          });
        }
        break;
      default:
        console.log('Unknown action type:', action.type);
    }
  }, [navigate, onCommand]);

  const connectWebSocket = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      if (ws.current) {
        ws.current.close();
      }

      ws.current = new WebSocket(config.wsUrl + '/ws/voice');

      ws.current.onopen = () => {
        console.log('WebSocket connected to:', config.wsUrl);
        setIsConnected(true);
        setIsConnecting(false);
        setReconnectAttempts(0);
        setError(null);
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsListening(false);
        if (event.code !== 1000) { // 1000 is normal closure
          handleReconnectRef.current();
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        setError('Connection error occurred. Please check if the server is running.');
        setIsConnected(false);
        setIsListening(false);
      };

      ws.current.onmessage = (event) => {
        try {
          const response = JSON.parse(event.data);
          if (response.status === 'error') {
            setError(response.message);
          } else {
            setTranscript(response.text);
            if (response.intent) {
              handleIntent(response.intent);
            }
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
          setError('Error processing server response');
        }
      };
    } catch (e) {
      console.error('Error creating WebSocket:', e);
      setError(`Failed to establish connection to ${config.wsUrl}. Please check if the server is running.`);
      setIsConnecting(false);
      handleReconnectRef.current();
    }
  }, [handleIntent]);

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setReconnectAttempts(prev => prev + 1);
      reconnectTimeout.current = setTimeout(() => {
        console.log(`Attempting to reconnect... (${reconnectAttempts + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        connectWebSocket();
      }, RECONNECT_DELAY);
    } else {
      setError('Failed to connect after multiple attempts. Please try again later.');
      setIsConnecting(false);
    }
  }, [reconnectAttempts, connectWebSocket]);

  // Update handleReconnect ref
  useEffect(() => {
    handleReconnectRef.current = handleReconnect;
  }, [handleReconnect]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [connectWebSocket]);

  const startListening = async () => {
    if (!isConnected) {
      setError('Please wait for the connection to be established.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const base64Data = base64Audio.split(',')[1];
          if (ws.current?.readyState === WebSocket.OPEN) {
            ws.current.send(base64Data);
          } else {
            setError('Connection lost. Please try again.');
            setIsListening(false);
            connectWebSocket();
          }
        };
      };

      mediaRecorder.current.start();
      setIsListening(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Please allow microphone access to use voice commands');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  return (
    <>
      <Tooltip 
        title={isListening ? "Stop Voice Command" : "Start Voice Command"} 
        placement="left"
        TransitionComponent={Zoom}
      >
        <Fab
          color={isListening ? "secondary" : "primary"}
          onClick={toggleListening}
          disabled={!isConnected || isConnecting}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: isListening 
              ? 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)'
              : 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)',
            boxShadow: (theme) => `0 8px 24px ${alpha(
              isListening ? theme.palette.secondary.main : theme.palette.primary.main, 
              0.25
            )}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: (theme) => `0 12px 32px ${alpha(
                isListening ? theme.palette.secondary.main : theme.palette.primary.main,
                0.35
              )}`,
            }
          }}
        >
          {isConnecting ? (
            <CircularProgress size={24} color="inherit" />
          ) : isListening ? (
            <MicOffIcon />
          ) : (
            <MicIcon />
          )}
        </Fab>
      </Tooltip>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{ 
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={isListening || showTranscript}
        onClose={() => setShowTranscript(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isListening && (
              <>
                <CircularProgress size={16} color="inherit" />
                <Typography>Listening...</Typography>
              </>
            )}
            {transcript && (
              <Typography>
                {transcript}
              </Typography>
            )}
          </Box>
        }
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 2,
            background: (theme) => alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            color: 'text.primary',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minWidth: 'auto',
            maxWidth: '80vw'
          }
        }}
      />
    </>
  );
};

export default VoiceAssistant;
