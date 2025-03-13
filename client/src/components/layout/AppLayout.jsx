import React from "react";
import Header from "./Header";
import Title from "../shared/Title";
import { Grid } from "@mui/material";
import ChatList from "../specific/ChatList";
import { samplechats } from "../../constants/sampleData";
import { useParams } from "react-router-dom";
import Profile from "../specific/Profile";

const AppLayout = (WrappedComponent) => {
  return (props) => {
    const { chatId } = useParams();


    const handleDeleteChat=(e,_id,groupChat)=>{
      e.preventDefault();
      console.log("Delete Chat",_id,groupChat);
    }
    return (
      <>
        <Title />
        <Header />

        <Grid container height={"calc(100vh - 4rem)"}>
          {/* Chat List Section */}
          <Grid
            item
            sm={4}
            md={3}
            sx={{
              display: { xs: "none", sm: "block" },
             
            }}
            height={"100%"}
          >
            <ChatList
              chats={samplechats}
              chatId={chatId}
              handleDeleteChat={handleDeleteChat}
            
            />
          </Grid>

          {/* Main Chat Area */}
          <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
            <WrappedComponent {...props} />
          </Grid>

          {/* Third Column */}
          <Grid
            item
            md={4}
            lg={3}
            height={"100%"}
            sx={{
              display: { xs: "none", md: "block" },
              padding: "2rem",
              backgroundColor: "black",
              borderLeft: "1px solid #e0e0e0",
            }}
          >
            <Profile/>
          </Grid>
        </Grid>
      </>
    );
  };
};

export default AppLayout;