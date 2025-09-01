import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  SettingsBrightness as SettingsBrightnessIcon,
} from '@mui/icons-material';
import { useTheme } from '@/lib/theme-context';

const ThemeToggle: React.FC = () => {
  const { mode, setMode, actualMode } = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode);
    handleClose();
  };

  const getCurrentIcon = () => {
    if (mode === 'system') {
      return <SettingsBrightnessIcon />;
    }
    return actualMode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />;
  };

  const getTooltipText = () => {
    if (mode === 'system') {
      return `System (${actualMode === 'dark' ? 'Dark' : 'Light'})`;
    }
    return mode === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  return (
    <>
      <Tooltip title={getTooltipText()}>
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="toggle theme"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>
      
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleModeSelect('light')}
          selected={mode === 'light'}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        
        <MenuItem
          onClick={() => handleModeSelect('dark')}
          selected={mode === 'dark'}
        >
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
        </MenuItem>
        
        <MenuItem
          onClick={() => handleModeSelect('system')}
          selected={mode === 'system'}
        >
          <ListItemIcon>
            <SettingsBrightnessIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;