import React from 'react'

import { Stack } from '@mui/material'
import ChatItem from '../shared/ChatItem'
const ChatList = ({w="100%",chats=[],chatId,onlineUsers=[], 
  newMessagesAlert=[{
  chatId: "",
  count: 0

},
],
handleDeleteChat,
}) => {
return (
 <Stack width={w} direction={"column"}>
  {
      chats?.map((data,index) => {

        const {avatar,_id,name, groupChat,members} = data

        const newMessageAlert= newMessagesAlert.find(
         ({chatId}) =>chatId === _id
        )

        const isOnline = members?.some((member) => onlineUsers.includes(_id))
          return <ChatItem 
          index={index}
          newMessageAlert={newMessageAlert}
          isOnline={isOnline}
          avatar={avatar}
          key={_id}
          _id={_id}
          name={name}
          groupChat={groupChat}
          members={members}
          sameSender={chatId === _id}
          handleDeleteChat={handleDeleteChat}
          />
      })
  }
  </Stack>
  )
}

export default ChatList;