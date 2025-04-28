import React from 'react';
import { Stack } from '@mui/material';
import ChatItem from '../shared/ChatItem';

const ChatList = ({ w = "100%", chats = [], chatId, onlineUsers = [], newMessagesAlert = [{ chatId: "", count: 0 }], handleDeleteChat }) => {
  return (
    <Stack width={w} direction={"column"}>
      {chats?.map((data, index) => {
        const { avatar, _id, name, isGroupChat, users } = data;
        const newMessageAlert = newMessagesAlert.find(({ chatId }) => chatId === _id);
        
        // For a regular chat, check if any of the other users are online
        let isOnline = false;
        if (!isGroupChat && users?.length > 0) {
          // Find the other user in a one-to-one chat
          const otherUser = users.find(user => user._id !== localStorage.getItem('userId')); 
          if (otherUser) {
            isOnline = onlineUsers.includes(otherUser._id);
          }
        }
        
        return (
          <ChatItem
            index={index}
            newMessageAlert={newMessageAlert}
            isOnline={isOnline}
            avatar={avatar}
            key={_id}
            _id={_id}
            name={name}
            groupChat={isGroupChat}
            members={users}
            sameSender={chatId === _id}
            handleDeleteChat={handleDeleteChat}
          />
        );
      })}
    </Stack>
  );
};

export default ChatList;