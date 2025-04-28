import React, { useState } from "react";
import Header from "./Header";
import Title from "../shared/Title";
import { 
  Grid, 
  Drawer, 
  useMediaQuery, 
  Box, 
  IconButton, 
  SwipeableDrawer,
  useTheme
} from '@mui/material';
import ChatList from "../specific/ChatList";
import { samplechats } from "../../constants/sampleData";
import { useParams } from "react-router-dom";
import Profile from "../specific/Profile";
import { Helmet } from 'react-helmet-async';
import { Menu as MenuIcon, ChevronLeft as ChevronLeftIcon } from '@mui/icons-material';

/**
 * Higher-order component that wraps pages with a common layout
 */
const AppLayout = (Component) => {
  const WrappedComponent = (props) => {
    const { chatId } = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleDeleteChat = (e, _id, groupChat) => {
      e.preventDefault();
      console.log("Delete Chat", _id, groupChat);
    };
    
    const handleDrawerToggle = () => {
      setMobileOpen(!mobileOpen);
    };
    
    const handleProfileToggle = () => {
      setProfileOpen(!profileOpen);
    };

    const drawer = (
      <Box sx={{ height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <ChatList chats={samplechats} chatId={chatId} handleDeleteChat={handleDeleteChat} onChatSelect={isMobile ? handleDrawerToggle : undefined} />
      </Box>
    );

    const profileDrawer = (
      <Box sx={{ width: 300, height: '100%', p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', p: 1 }}>
          <IconButton onClick={handleProfileToggle}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        <Profile />
      </Box>
    );

    return (
      <>
        <Helmet>
          <title>Chat App</title>
        </Helmet>
        <Title />
        <Header 
          onMenuClick={handleDrawerToggle} 
          onProfileClick={handleProfileToggle}
          isMobile={isMobile}
        />
        
        {/* Mobile drawer */}
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={handleDrawerToggle}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: '80%', maxWidth: 300, boxSizing: 'border-box' },
          }}
        >
          {drawer}
        </SwipeableDrawer>
        
        {/* Profile drawer for mobile/tablet */}
        <SwipeableDrawer
          variant="temporary"
          anchor="right"
          open={profileOpen}
          onOpen={handleProfileToggle}
          onClose={handleProfileToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: '80%', maxWidth: 300, boxSizing: 'border-box' },
          }}
        >
          {profileDrawer}
        </SwipeableDrawer>
        
        <Grid container height="calc(100vh - 4rem)" sx={{ display: "flex" }}>
          {/* Chat List Section - Permanent drawer for tablets and desktop */}
          <Grid item sx={{ 
            width: { sm: 300 }, 
            flexShrink: 0,
            display: { xs: "none", sm: "block" }, 
            height: "100%", 
            borderRight: '1px solid #e0e0e0'
          }}>
            <ChatList 
              chats={samplechats} 
              chatId={chatId} 
              handleDeleteChat={handleDeleteChat} 
            />
          </Grid>

          {/* Main Chat Area */}
          <Grid item xs={12} sx={{ 
            flexGrow: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column"
          }}>
            <Component {...props} />
          </Grid>

          {/* Profile Section - Permanent for desktop */}
          <Grid item sx={{ 
            width: { md: 300 },
            display: { xs: "none", md: "block" }, 
            padding: "2rem", 
            backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5', 
            borderLeft: "1px solid #e0e0e0", 
            height: "100%",
            overflow: "auto" 
          }}>
            <Profile />
          </Grid>
        </Grid>
      </>
    );
  };

  // Name for debugging
  WrappedComponent.displayName = `AppLayout(${Component.displayName || Component.name || 'Component'})`;
  
  return WrappedComponent;
};

export default AppLayout;