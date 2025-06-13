import React, { useState } from 'react';
import { TextField, Autocomplete, Box, Paper, Typography, alpha } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RoomIcon from '@mui/icons-material/Room';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ScienceIcon from '@mui/icons-material/Science';
import BusinessIcon from '@mui/icons-material/Business';
import FloorIcon from '@mui/icons-material/Layers';
import { Location } from '../types';

interface SearchBarProps {
  locations: Location[];
  onLocationSelect: (location: Location | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ locations, onLocationSelect }) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const getIcon = (location: Location) => {
    switch (location.type) {
      case 'room':
        if (location.id.startsWith('hod_')) return <BusinessIcon sx={{ fontSize: 24, color: '#1976d2' }} />;
        return <MeetingRoomIcon sx={{ fontSize: 24, color: '#2e7d32' }} />;
      case 'lab':
        return <ScienceIcon sx={{ fontSize: 24, color: '#d32f2f' }} />;
      case 'facility':
        if (location.id === 'library') return <LocalLibraryIcon sx={{ fontSize: 24, color: '#7b1fa2' }} />;
        if (location.id === 'admin_office' || location.id === 'principal_office') 
          return <BusinessIcon sx={{ fontSize: 24, color: '#1976d2' }} />;
        return <RoomIcon sx={{ fontSize: 24, color: '#455a64' }} />;
      default:
        return <RoomIcon sx={{ fontSize: 24, color: '#455a64' }} />;
    }
  };

  return (
    <Box 
      sx={{ 
        mb: 4, 
        width: '100%', 
        maxWidth: 600, 
        mx: 'auto',
        position: 'relative'
      }}
    >
      <Autocomplete
        inputValue={inputValue}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        onChange={(event, newValue) => {
          onLocationSelect(newValue);
        }}
        options={locations}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search for a location..."
            variant="outlined"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <SearchIcon 
                  sx={{ 
                    color: isFocused ? 'primary.main' : 'action.active', 
                    mr: 1,
                    transition: 'color 0.2s ease-in-out',
                    fontSize: 24
                  }} 
                />
              ),
              sx: {
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                transition: 'all 0.2s ease-in-out',
                border: '2px solid transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                },
                '&.Mui-focused': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  borderColor: (theme) => theme.palette.primary.main,
                  boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <Paper 
            component="li" 
            {...props}
            elevation={0}
            sx={{ 
              mb: 0.5,
              mx: 1,
              borderRadius: 2,
              overflow: 'hidden',
              transition: 'all 0.2s ease-in-out',
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              p: 1.5,
              gap: 2
            }}>
              <Box 
                sx={{ 
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6)
                }}
              >
                {getIcon(option)}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 0.5,
                    color: 'text.primary'
                  }}
                >
                  {option.name}
                </Typography>
                {option.description && (
                  <Typography 
                    variant="body2"
                    sx={{ 
                      color: 'text.secondary',
                      lineHeight: 1.4
                    }}
                  >
                    {option.description}
                  </Typography>
                )}
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    mt: 1
                  }}
                >
                  <FloorIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 500
                    }}
                  >
                    Floor {option.floor === 0 ? 'Ground' : option.floor}
                  </Typography>
                  <Box 
                    sx={{ 
                      width: 4,
                      height: 4,
                      borderRadius: '50%',
                      backgroundColor: 'divider',
                      mx: 1
                    }} 
                  />
                  <Typography 
                    variant="caption"
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {option.type}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}
        PaperComponent={({ children }) => (
          <Paper 
            elevation={8}
            sx={{ 
              mt: 1,
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: (theme) => alpha(theme.palette.divider, 0.1),
              boxShadow: (theme) => `0 12px 28px ${alpha(theme.palette.common.black, 0.08)}`
            }}
          >
            <Box sx={{ p: 1 }}>
              {children}
            </Box>
          </Paper>
        )}
      />
    </Box>
  );
};

export default SearchBar; 