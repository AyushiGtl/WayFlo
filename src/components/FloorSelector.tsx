import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup, Typography, alpha, useTheme, useMediaQuery } from '@mui/material';
import FloorIcon from '@mui/icons-material/Layers';
import ApartmentIcon from '@mui/icons-material/Apartment';

interface FloorSelectorProps {
  currentFloor: number;
  onFloorChange: (floor: number) => void;
}

const FloorSelector: React.FC<FloorSelectorProps> = ({ currentFloor, onFloorChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleFloorChange = (
    event: React.MouseEvent<HTMLElement>,
    newFloor: number | null
  ) => {
    if (newFloor !== null) {
      onFloorChange(newFloor);
    }
  };

  return (
    <Box 
      sx={{ 
        mb: 4, 
        textAlign: 'center',
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        px: { xs: 1, sm: 2 }
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          mb: 2
        }}
      >
        <ApartmentIcon sx={{ 
          color: theme.palette.primary.main,
          fontSize: { xs: 24, sm: 28 },
          filter: `drop-shadow(0 2px 4px ${alpha(theme.palette.primary.main, 0.3)})`,
        }} />
        <Typography 
          variant="h6" 
          sx={{ 
            color: theme.palette.text.primary,
            fontWeight: 600,
            letterSpacing: '0.5px',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Select Floor
        </Typography>
      </Box>
      <Box
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 1,
          mx: -1,
          px: 1,
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none'
        }}
      >
        <ToggleButtonGroup
          value={currentFloor}
          exclusive
          onChange={handleFloorChange}
          aria-label="floor selection"
          sx={{
            background: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            borderRadius: 3,
            p: 0.75,
            gap: 0.75,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
            border: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            display: 'inline-flex',
            minWidth: isMobile ? 'max-content' : 'auto',
            mx: 'auto'
          }}
        >
          <ToggleButton 
            value={0} 
            aria-label="ground floor"
            sx={{ 
              minWidth: { xs: 80, sm: 90 },
              borderRadius: '12px !important',
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
              border: 'none !important',
              transition: 'all 0.2s ease-in-out',
              fontWeight: 600,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
              '&.Mui-selected': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                color: 'white',
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                }
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FloorIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              Ground
            </Box>
          </ToggleButton>
          {[1, 2, 3].map((floor) => (
            <ToggleButton
              key={floor}
              value={floor}
              aria-label={`floor ${floor}`}
              sx={{ 
                minWidth: { xs: 80, sm: 90 },
                borderRadius: '12px !important',
                px: { xs: 1.5, sm: 2 },
                py: 1.5,
                border: 'none !important',
                transition: 'all 0.2s ease-in-out',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
                '&.Mui-selected': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  color: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                  }
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FloorIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                {floor}{floor === 1 ? 'st' : floor === 2 ? 'nd' : 'rd'}
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
};

export default FloorSelector; 