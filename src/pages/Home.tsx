import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Container, Modal, Typography, Box, Button, Paper, Chip, alpha } from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LocationCard from '../components/LocationCard';
import FloorSelector from '../components/FloorSelector';
import SearchBar from '../components/SearchBar';
import { QRScanner } from '../components/QRScanner';
import DestinationSelector from '../components/DestinationSelector';
import { locations } from '../data/locations';
import { Location } from '../types';
import ExploreIcon from '@mui/icons-material/Explore';
import NavigationIcon from '@mui/icons-material/Navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import VoiceAssistant from '../components/VoiceAssistant';

const Home: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [startLocation, setStartLocation] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [arMode, setArMode] = useState(false);
  const [currentFloor, setCurrentFloor] = useState(0);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  useEffect(() => {
    const start = searchParams.get('start');
    if (start) {
      const location = locations.find(loc => loc.id === start);
      if (location) {
        setStartLocation(start);
        setCurrentFloor(location.floor);
      }
    }
  }, [searchParams]);

  const handleLocationSelect = (location: Location) => {
    if (location.id !== startLocation) {
      setSelectedDestination(location);
    }
  };

  const handleStartNavigation = () => {
    if (selectedDestination && startLocation) {
      const navigationPath = `/navigate?start=${encodeURIComponent(startLocation)}&destination=${encodeURIComponent(selectedDestination.id)}&mode=${viewMode}${arMode ? '&ar=true' : ''}`;
      navigate(navigationPath, {
        state: { 
          startLocation,
          destinationLocation: selectedDestination,
          viewMode,
          arMode
        }
      });
    }
  };

  const handleSearchSelect = (location: Location | null) => {
    if (location && location.id !== startLocation) {
      setSelectedDestination(location);
      setCurrentFloor(location.floor);
    }
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleQrScan = (scannedText: string) => {
  const matchedLocation = locations.find(loc => loc.id === scannedText.trim());

  if (matchedLocation) {
    setStartLocation(matchedLocation.id);
    setCurrentFloor(matchedLocation.floor);
    enqueueSnackbar(`Location detected: ${matchedLocation.name}`, { variant: 'success' });
  } else {
    enqueueSnackbar('Invalid QR code. Please try again.', { variant: 'error' });
  }
};

  const currentLocationObj = locations.find(loc => loc.id === startLocation);
  const currentLocation = currentLocationObj ? currentLocationObj.name : 'Unknown Location';

  // Filter locations by floor
  const locationsOnFloor = locations.filter(loc => loc.floor === currentFloor);

  // Important destinations (facilities and HOD cabins)
  const importantDestinations = locations.filter(
    loc => loc.type === 'facility' || loc.id.startsWith('hod_')
  );

  const modalStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 320,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
};

  const handleVoiceCommand = (action: { 
    type: string; 
    params?: { 
      destination?: string;
      arMode?: boolean;
      viewMode?: '2d' | '3d';
      floor?: number;
    } 
  }) => {
    switch (action.type) {
      case 'NAVIGATE':
        const destination = locations.find(loc => 
          loc.name.toLowerCase().includes(action.params?.destination?.toLowerCase() || '')
        );
        if (destination) {
          handleLocationSelect(destination);
          if (action.params?.viewMode) {
            setViewMode(action.params.viewMode);
          }
        }
        break;
      case 'START_NAVIGATION':
        if (selectedDestination) {
          handleStartNavigation();
        }
        break;
      case 'TOGGLE_AR':
        setArMode(action.params?.arMode || false);
        if (action.params?.viewMode) {
          setViewMode(action.params.viewMode);
        }
        break;
      case 'SWITCH_VIEW':
        if (action.params?.viewMode) {
          setViewMode(action.params.viewMode);
        }
        break;
      case 'CHANGE_FLOOR':
        if (action.params?.floor !== undefined) {
          setCurrentFloor(action.params.floor);
        }
        break;
      case 'SHOW_HELP':
        // You can implement help functionality here
        break;
      default:
        console.log('Unknown action:', action.type);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f6f8fc 0%, #e3f2fd 100%)',
        py: { xs: 4, md: 6 }
      }}
    >
      <Container maxWidth="lg">
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 4 },
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)'
            }
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'inline-flex',
                p: 2,
                borderRadius: '50%',
                background: (theme) => alpha(theme.palette.primary.main, 0.1),
                mb: 2
              }}
            >
              <ExploreIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 3
              }}
            >
              Indoor Navigation
            </Typography>

            {/* QR Scan Button */}
            <Button
              variant="outlined"
              onClick={() => setQrScannerOpen(true)}
              startIcon={<QrCodeScannerIcon />}
              sx={{ mb: 2 }}
            >
              Scan QR Code for Start Location
            </Button>
            
            <Modal open={qrScannerOpen} onClose={() => setQrScannerOpen(false)}>
            <Box sx={modalStyle}>
              <h3>Scan QR Code</h3>
              <QRScanner onScanSuccess={handleQrScan} onClose={() => setQrScannerOpen(false)} />
            </Box>
          </Modal>
            <Box sx={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              background: (theme) => alpha(theme.palette.primary.main, 0.08),
              px: 3,
              py: 2,
              borderRadius: 3,
              mb: 3,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
              <NavigationIcon sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                {currentLocation}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 4 }}>
            <SearchBar 
              locations={locations}
              onLocationSelect={handleSearchSelect}
            />
          </Box>

          {startLocation && (
            <Box sx={{ mb: 4 }}>
              <DestinationSelector
                locations={locations}
                currentLocationId={startLocation}
                selectedDestination={selectedDestination}
                onDestinationSelect={setSelectedDestination}
              />
            </Box>
          )}

          <Box sx={{ mb: 4 }}>
            <FloorSelector 
              currentFloor={currentFloor}
              onFloorChange={setCurrentFloor}
            />
          </Box>

          {!selectedDestination ? (
            <>
              <Box sx={{ mb: 5 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    textAlign: 'center',
                    color: 'text.primary',
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  Important Destinations
                </Typography>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 1.5,
                    justifyContent: 'center'
                  }}
                >
                  {importantDestinations.map((location) => (
                    <Chip
                      key={location.id}
                      label={location.name}
                      onClick={() => handleLocationSelect(location)}
                      sx={{
                        borderRadius: 3,
                        py: 2.5,
                        px: 1,
                        backgroundColor: location.floor === currentFloor ? 'primary.main' : 'background.paper',
                        color: location.floor === currentFloor ? 'white' : 'text.primary',
                        border: (theme) => `1px solid ${location.floor === currentFloor ? 'transparent' : theme.palette.divider}`,
                        boxShadow: location.floor === currentFloor ? '0 4px 12px rgba(25, 118, 210, 0.2)' : 'none',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          backgroundColor: location.floor === currentFloor ? 'primary.dark' : alpha('#1976d2', 0.08),
                          transform: 'translateY(-2px)'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  color: 'text.primary',
                  fontWeight: 600
                }}
              >
                Locations on Floor {currentFloor === 0 ? 'Ground' : `${currentFloor}${currentFloor === 1 ? 'st' : currentFloor === 2 ? 'nd' : 'rd'}`}
              </Typography>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                gap: 3
              }}>
                {locationsOnFloor.map((location) => (
                  <LocationCard
                    key={location.id}
                    location={location}
                    onClick={handleLocationSelect}
                    disabled={location.id === startLocation}
                  />
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  mb: 3
                }}
              >
                Confirm Your Destination
              </Typography>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 4, 
                  my: 3, 
                  borderRadius: 3,
                  background: (theme) => alpha(theme.palette.primary.main, 0.04),
                  border: '1px solid',
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                  From: {currentLocation} (Floor {currentLocationObj?.floor === 0 ? 'Ground' : currentLocationObj?.floor})
                </Typography>
                <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                  To: {selectedDestination.name} (Floor {selectedDestination.floor === 0 ? 'Ground' : selectedDestination.floor})
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button
                    variant={viewMode === '2d' ? "contained" : "outlined"}
                    size="large"
                    onClick={() => setViewMode('2d')}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    2D View
                  </Button>
                  <Button
                    variant={viewMode === '3d' ? "contained" : "outlined"}
                    size="large"
                    onClick={() => setViewMode('3d')}
                    startIcon={<ViewInArIcon />}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    3D View
                  </Button>
                </Box>
              </Paper>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2,
                justifyContent: 'center',
                mt: 4
              }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleStartNavigation}
                  disabled={!currentLocationObj}
                  startIcon={<NavigationIcon />}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 'auto' },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)'
                    }
                  }}
                >
                  Start Navigation
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedDestination(null)}
                  startIcon={<ArrowBackIcon />}
                  size="large"
                  sx={{ 
                    minWidth: { xs: '100%', sm: 'auto' },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Change Destination
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
      <VoiceAssistant onCommand={handleVoiceCommand} />

      {/* QR Scanner Modal
    <Modal open={qrScannerOpen} onClose={() => setQrScannerOpen(false)}>
      <Box 
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 2,
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
          Scan QR Code
        </Typography>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => setQrScannerOpen(false)}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal> */}

    </Box>
  );
};

export default Home; 