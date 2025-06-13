import React from 'react';
import { Fab, Tooltip, Box, useTheme, alpha } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';

interface VoiceCommandButtonProps {
  onClick: () => void;
  isListening?: boolean;
}

const VoiceCommandButton: React.FC<VoiceCommandButtonProps> = ({ onClick, isListening = false }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, sm: 24 },
        right: { xs: 16, sm: 24 },
        zIndex: theme.zIndex.speedDial,
      }}
    >
      <Tooltip 
        title={isListening ? "Listening..." : "Start voice command"} 
        placement="left"
        arrow
        sx={{
          '& .MuiTooltip-arrow': {
            color: alpha(theme.palette.background.paper, 0.9),
          },
          '& .MuiTooltip-tooltip': {
            background: alpha(theme.palette.background.paper, 0.9),
            color: theme.palette.text.primary,
            backdropFilter: 'blur(8px)',
            borderRadius: 2,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            fontSize: '0.875rem',
            padding: '8px 12px',
          },
        }}
      >
        <Fab
          color={isListening ? "secondary" : "primary"}
          onClick={onClick}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            background: isListening 
              ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
            boxShadow: `0 8px 24px ${alpha(
              isListening ? theme.palette.secondary.main : theme.palette.primary.main,
              0.25
            )}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 12px 32px ${alpha(
                isListening ? theme.palette.secondary.main : theme.palette.primary.main,
                0.35
              )}`,
              background: isListening 
                ? `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            },
            '&::before': isListening ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle at center, ${alpha(theme.palette.common.white, 0.2)} 0%, transparent 70%)`,
              animation: 'pulse 2s ease-in-out infinite',
            } : {},
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0.95)',
                opacity: 0.5,
              },
              '50%': {
                transform: 'scale(1.05)',
                opacity: 0.8,
              },
              '100%': {
                transform: 'scale(0.95)',
                opacity: 0.5,
              },
            },
          }}
        >
          <MicIcon 
            sx={{ 
              fontSize: 24,
              color: theme.palette.common.white,
              animation: isListening ? 'breathe 2s ease-in-out infinite' : 'none',
              '@keyframes breathe': {
                '0%': { 
                  opacity: 0.5,
                  transform: 'scale(0.95)',
                },
                '50%': { 
                  opacity: 1,
                  transform: 'scale(1.05)',
                },
                '100%': { 
                  opacity: 0.5,
                  transform: 'scale(0.95)',
                },
              }
            }} 
          />
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default VoiceCommandButton; 