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
      chats?.map((data) => {
          return <ChatItem />
      })
  }
  </Stack>
  )
}

export default ChatList;