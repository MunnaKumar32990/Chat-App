import React from "react";
import Header from "./Header";
import Title from "../shared/Title";
import { Grid2 as Grid } from "@mui/material";
import ChatList from "../specific/ChatList";
import { samplechats } from "../../constants/sampleData";
import { useParams } from "react-router-dom";


const AppLayout = (WrappedComponent) => {
  return (props) => {

    const { chatId } = useParams();
    return(
    <>

      <Title />
      <Header />

      <Grid container height={"calc(100vh - 4rem)" }>
        <Grid item sm={4} md={3} sx={{ 
          display: { xs: "none", sm: "block" },
         
        }}   height={"100%"}>
          <ChatList chats={samplechats} chatId={chatId}
          newMessagesAlert={[{
            chatId,
            count: 4
          }]
        }onlineUsers={["1","2"]}
        
          />
        </Grid>
        <Grid item xs={12} sm={8} md={5} lg={6} height={"100%"}>
          <WrappedComponent {...props} />
        </Grid>

        <Grid item md={4} lg={3} height={"100%"} sx={{ 
          display: { xs: "none", md: "block" },
          padding: "2rem",
          backgroundColor: "#f5f5f5"
        }}>
          Third
        </Grid>
      </Grid>
    </>
  )};
};

export default AppLayout;