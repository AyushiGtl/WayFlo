import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import { locations } from '../data/locations';
import { Location } from '../types';

const Navigate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [startLocation, setStartLocation] = useState<string>('');
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);

  useEffect(() => {
    const start = searchParams.get('start');
    const destination = searchParams.get('destination');
    
    if (location.state) {
      setStartLocation(location.state.startLocation);
      setDestinationLocation(location.state.destinationLocation);
    } else if (start && destination) {
      const startLoc = locations.find(loc => loc.id === start);
      const destLoc = locations.find(loc => loc.id === destination);
      
      if (startLoc && destLoc) {
        setStartLocation(start);
        setDestinationLocation(destLoc);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [searchParams, location.state, navigate]);

  const startLocationName = locations.find(loc => loc.id === startLocation)?.name || 'Unknown';
  const destinationLocationName = destinationLocation?.name || 'Unknown';

  const handleEndNavigation = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Navigation Active
        </Typography>
        
        <Box sx={{ my: 4 }}>
          <Typography variant="h6" gutterBottom>
            From: {startLocationName}
          </Typography>
          <Typography variant="h6" gutterBottom>
            To: {destinationLocationName}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 4 }}>
          AR navigation will be implemented here
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleEndNavigation}
          sx={{ mr: 2 }}
        >
          End Navigation
        </Button>
      </Box>
    </Container>
  );
};

export default Navigate; 