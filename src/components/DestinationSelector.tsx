import React from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import { Location } from '../types';

interface DestinationSelectorProps {
  locations: Location[];
  currentLocationId: string | null;
  selectedDestination: Location | null;
  onDestinationSelect: (location: Location | null) => void;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  locations,
  currentLocationId,
  selectedDestination,
  onDestinationSelect,
}) => {
  // Filter out the current location from the available destinations
  const availableDestinations = locations.filter(
    (location) => location.id !== currentLocationId
  );

  return (
    <Box sx={{ my: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Select Destination
      </Typography>
      <Autocomplete
        id="destination-selector"
        options={availableDestinations}
        getOptionLabel={(option) => `${option.name} (${option.description || option.type})`}
        groupBy={(option) => `Floor ${option.floor}`}
        value={selectedDestination}
        onChange={(_, newValue) => onDestinationSelect(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Where do you want to go?"
            variant="outlined"
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Box>
              <Typography variant="body1">{option.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {option.description || option.type}
              </Typography>
            </Box>
          </li>
        )}
      />
    </Box>
  );
};

export default DestinationSelector;