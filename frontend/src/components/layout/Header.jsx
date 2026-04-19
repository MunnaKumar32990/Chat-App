import { 
  AppBar, 
  Backdrop, 
  Box, 
  IconButton, 
  Toolbar, 
  Tooltip, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Badge,
  Divider,
  useTheme,
  Button
} from '@mui/material';
import { blue } from "@mui/material/colors";
import React, { Suspense, useState, lazy, useContext } from 'react';
import { 
  Add as AddIcon, 
  Menu as MenuIcon, 
  Search as SearchIcon, 
  Group as GroupIcon, 
  Logout as LogoutIcon, 
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountCircleIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthProvider';
import { SocketContext } from '../../context/SocketProvider';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { disconnectSocket } from '../../services/socket';

const SearchDialog = lazy(() => import('../specific/Search'));
const NotificationDialog = lazy(() => import('../specific/Notifications'));
const NewGroupDialog = lazy(() => import('../specific/NewGroup'));

const Header = ({ onMenuClick, onProfileClick, isMobile }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { onlineUsers, isConnected } = useContext(SocketContext);
  const theme = useTheme();
  const { logout, user: storeUser } = useAuthStore();

  const [isSearch, setIsSearch] = useState(false);
  const [isNewGroup, setIsNewGroup] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const open = Boolean(anchorEl);
  const notifications = 3; // Example notification count - replace with real data later

  const openSearch = () => {
    setIsSearch(prev => !prev);
  };

  const openNewGroup = () => {
    setIsNewGroup(prev => !prev);
  };

  const openNotification = () => {
    setIsNotification(prev => !prev);
  };

  const navigateToGroup = () => navigate("/groups");
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      // Close menu
      handleMenuClose();
      
      // Use the store's logout function which properly handles socket disconnection
      const success = await logout();
      
      if (success) {
        toast.success('Logged out successfully');
      }
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out. Please try again.');
    }
  };
  
  const navigateToProfile = () => {
    handleMenuClose();
    
    if (isMobile) {
      onProfileClick();
    }
  };

  const connectionStatus = isConnected ? (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        ml: 1,
        fontSize: '0.75rem',
        color: 'success.main',
        '&::before': {
          content: '""',
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'success.main',
          mr: 0.5
        }
      }}
    >
      Online
    </Box>
  ) : (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        ml: 1,
        fontSize: '0.75rem',
        color: 'error.main',
        '&::before': {
          content: '""',
          display: 'inline-block',
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'error.main',
          mr: 0.5
        }
      }}
    >
      Offline
    </Box>
  );

  // Use store user if available, otherwise fall back to context user
  const currentUser = storeUser || user;

  return (
    <>
      <Box sx={{ flexGrow: 1 }} height={"4rem"}>
        <AppBar 
          position="static" 
          sx={{ 
            bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : blue[700],
            color: theme.palette.mode === 'dark' ? 'text.primary' : 'white',
            boxShadow: 3
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={onMenuClick}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                display: { xs: isMobile ? "none" : "block", sm: "block" },
                fontWeight: 600,
                letterSpacing: 0.5,
                mr: 2
              }}
            >
              Chat App
              {connectionStatus}
            </Typography>
            
            <Box sx={{ flexGrow: 1 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconBtn 
                title={"Search"} 
                icon={<SearchIcon />} 
                onClick={openSearch} 
              />
              
              <IconBtn 
                title={"New Group"} 
                icon={<AddIcon />} 
                onClick={openNewGroup}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              
              <IconBtn 
                title={"Manage Groups"} 
                icon={<GroupIcon />} 
                onClick={navigateToGroup}
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
              
              <IconBtn 
                title={"Notifications"} 
                icon={
                  <Badge badgeContent={notifications} color="error">
                    <NotificationsIcon />
                  </Badge>
                } 
                onClick={openNotification} 
              />
              
              {/* User Menu */}
              {!currentUser ? (
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small"
                  onClick={() => navigate('/login')}
                  sx={{ ml: 2 }}
                >
                  Login
                </Button>
              ) : (
                <Tooltip title="Account settings">
                  <IconButton
                    onClick={handleProfileMenuOpen}
                    size="small"
                    sx={{ ml: 1 }}
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    <Avatar 
                      src={currentUser?.avatar} 
                      alt={currentUser?.name} 
                      sx={{ width: 32, height: 32 }}
                    >
                      {currentUser?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              overflow: 'visible',
              mt: 1.5,
              width: 200,
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          <MenuItem onClick={navigateToProfile}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>
          
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'error.main' }}>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      
      {/* Dialogs */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSearch || isNewGroup || isNotification}
      >
        <Suspense fallback={<div>Loading...</div>}>
          {isSearch && <SearchDialog open={isSearch} handleClose={openSearch} />}
          {isNewGroup && <NewGroupDialog open={isNewGroup} handleClose={openNewGroup} />}
          {isNotification && <NotificationDialog open={isNotification} handleClose={openNotification} />}
        </Suspense>
      </Backdrop>
    </>
  );
};

// Utility IconButton component
const IconBtn = ({ title, icon, onClick, sx = {} }) => {
  return (
    <Tooltip title={title}>
      <IconButton color="inherit" onClick={onClick} sx={{ ...sx }}>
        {icon}
      </IconButton>
    </Tooltip>
  );
};

export default Header;