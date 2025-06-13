import React from 'react';
import { Card, CardContent, Typography, CardActionArea, alpha } from '@mui/material';
import { Location } from '../types';
import RoomIcon from '@mui/icons-material/Room';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessIcon from '@mui/icons-material/Business';
import { Box } from '@mui/material';
import FloorIcon from '@mui/icons-material/Layers';

interface LocationCardProps {
  location: Location;
  onClick: (location: Location) => void;
  disabled?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onClick, disabled = false }) => {
  const getIcon = () => {
    switch (location.type) {
      case 'room':
        if (location.id.startsWith('hod_')) return <BusinessIcon sx={{ fontSize: 32 }} />;
        return <MeetingRoomIcon sx={{ fontSize: 32 }} />;
      case 'lab':
        return <ScienceIcon sx={{ fontSize: 32 }} />;
      case 'facility':
        if (location.id === 'library') return <LocalLibraryIcon sx={{ fontSize: 32 }} />;
        if (location.id === 'admin_office' || location.id === 'principal_office') return <BusinessIcon sx={{ fontSize: 32 }} />;
        return <RoomIcon sx={{ fontSize: 32 }} />;
      default:
        return <RoomIcon sx={{ fontSize: 32 }} />;
    }
  };

  const getGradient = () => {
    switch (location.type) {
      case 'room':
        if (location.id.startsWith('hod_')) return 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)';
        return 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)';
      case 'lab':
        return 'linear-gradient(135deg, #d32f2f 0%, #ef5350 100%)';
      case 'facility':
        if (location.id === 'library') return 'linear-gradient(135deg, #7b1fa2 0%, #ba68c8 100%)';
        if (location.id === 'admin_office' || location.id === 'principal_office') return 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)';
        return 'linear-gradient(135deg, #455a64 0%, #90a4ae 100%)';
      default:
        return 'linear-gradient(135deg, #455a64 0%, #90a4ae 100%)';
    }
  };

  const getTypeColor = () => {
    switch (location.type) {
      case 'room':
        return location.id.startsWith('hod_') ? '#1976d2' : '#2e7d32';
      case 'lab':
        return '#d32f2f';
      case 'facility':
        if (location.id === 'library') return '#7b1fa2';
        if (location.id === 'admin_office' || location.id === 'principal_office') return '#1976d2';
        return '#455a64';
      default:
        return '#455a64';
    }
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: disabled ? 0.5 : 1,
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 0.1),
        borderRadius: 3,
        overflow: 'hidden',
        '&:hover': {
          transform: disabled ? 'none' : 'translateY(-8px)',
          boxShadow: disabled ? 'none' : (theme) => `0 12px 28px ${alpha(getTypeColor(), 0.2)}`,
        }
      }}
    >
      <CardActionArea 
        onClick={() => !disabled && onClick(location)}
        disabled={disabled}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          '&:hover': {
            '& .location-icon': {
              transform: 'scale(1.1) rotate(5deg)'
            }
          }
        }}
      >
        <Box
          sx={{
            background: getGradient(),
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
              opacity: 0.6
            }
          }}
        >
          <Box 
            className="location-icon"
            sx={{ 
              mr: 2,
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)'
            }}
          >
            {getIcon()}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                lineHeight: 1.2,
                mb: 0.5
              }}
            >
              {location.name}
            </Typography>
            <Typography 
              variant="caption"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontWeight: 500
              }}
            >
              <FloorIcon sx={{ fontSize: 16 }} />
              Floor {location.floor === 0 ? 'Ground' : location.floor}
            </Typography>
          </Box>
        </Box>
        {location.description && (
          <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                flex: 1,
                lineHeight: 1.6
              }}
            >
              {location.description}
            </Typography>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 2,
                pt: 2,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: getTypeColor(),
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {location.type}
              </Typography>
            </Box>
          </CardContent>
        )}
      </CardActionArea>
    </Card>
  );
};

export default LocationCard; 