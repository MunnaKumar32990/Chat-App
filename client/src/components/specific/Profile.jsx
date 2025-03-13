import React from 'react'
import  {Avatar, Stack, Typography} from '@mui/material'

import { Face as FaceIcon, AlternateEmail as UserNameIcon , CalendarMonth as CalenderIcon } from "@mui/icons-material";
import moment from "moment";

const Profile = () => {
  return (
   <Stack spacing={"2rem"} direction={"column"} alignItems={"center"} >

    <Avatar
    sx= {{ 
      width: 200,
      height: 200,
      objectFit:"contain",
      marginBottom:"1rem",
      border:"5px solid white",
    }}
/>
<ProfileCard heading ={"Bio"} text={"helloooooo"}/>
<ProfileCard heading ={"Username"} text={"Munna@6556"} Icon={<UserNameIcon/>}/>
<ProfileCard heading ={"Name"} text={"Munna Kumar"} Icon={<FaceIcon/>}/>
<ProfileCard heading={"Joined"} text={moment('2025-03-13T00:00:00.000Z').fromNow()} Icon={<CalenderIcon />} />

   </Stack>
  )
}

const ProfileCard =({text,Icon,heading})=> 
<Stack
direction={"row"}
spacing={"1rem"}
alignItems={"center"}
color={"white"}
textAlign={"center"}

>
{Icon && Icon}


<Stack>

  <Typography
    variant="body1">{text}
  </Typography>

  <Typography color={'gray'}
  variant='caption'
  >
  {heading}
  </Typography>
</Stack>
</Stack>
export default Profile;
