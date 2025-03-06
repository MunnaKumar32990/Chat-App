import React ,{useState}from 'react'
import { Button, Paper, TextField,Container, Typography, Stack, Avatar, IconButton } from '@mui/material'
import { useFileHandler, useInputValidation ,useStrongPassword} from '6pp'
import { CameraAlt as CameraAltIcon } from '@mui/icons-material'
import { VisuallyHiddenInput } from '../components/styles/StyledComponents';
import { usernameValidator } from '../utils/validators';
const Login = () => {

    const [isLogin,setIsLogin] = useState(true);


    const toggleLogin = () => {
        setIsLogin(prev => !prev)
    }

    const name=useInputValidation('');
    const bio=useInputValidation('');
    const username=useInputValidation('',usernameValidator);
    const password=useStrongPassword();

    const avatar = useFileHandler('single');

    const handleLogin = (e) => {
        e.preventDefault();
    };

    const handleSignUp = (e) => {
        e.preventDefault();
    };

    return <Container component={"main"} maxWidth="xs"
        sx={{height:"100vh",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",

        }}
        >
        <Paper elevation={3}
            sx={{
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>

               {isLogin ? (
                <>
                <Typography variant="h4">Login</Typography>

                <form  style={{width: '100%', marginTop: '1rem'}}
                
                onSubmit={handleLogin}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="username"
                        variant="outlined"
                        value={username.value}
                        onChange={username.changeHandler}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password.value}
                        onChange={password.changeHandler}
                    />
                    
                    <Button
                        sx={{ mt: '1rem'}}
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                    >
                        Login
                    </Button>
                    <Typography textAlign={"center"} m={"1rem"} >
                        OR
                    </Typography>
                    <Button
                    
                        fullWidth
                        variant="text"
                        onClick={toggleLogin}
                    >
                       Sign Up Instead  
                        </Button>
                    
                </form>
                </>
                ) : (
                    <>
                    <Typography variant="h4">Sign Up</Typography>
    
                    <form  style={{width: '100%', marginTop: '1rem'}}
                    
                    onSubmit={handleSignUp}
                    >

                        <Stack position={"relative"} width={"10rem"} margin={"auto"}>
                        <Avatar sx={{
                            width: '10rem',
                            height: '10rem',
                            objectFit:'contain',
                        }}
                        src={avatar.preview}
                        />

{
                                avatar.error &&(
                                    <Typography color="error" variant='caption'>
                                        {avatar.error}
                                    </Typography>

                                )
                            }

                        <IconButton
                        
                        sx={{
                            position: 'absolute',
                            right: 0,
                            bottom: 0,
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            ":hover": {
                                backgroundColor: 'rgba(0,0,0,0.7)',
                            }
                        }}
                        component="label"
                        >
                            <>
                            <CameraAltIcon/>
                           <VisuallyHiddenInput type='file' onChange={avatar.changeHandler} />
                            </>
                        </IconButton
                        
                        >
                        </Stack>
                        
                        <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Name"
                        variant="outlined"
                        value={name.value}
                        onChange={name.changeHandler}
                        />
                         <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Bio"
                            variant="outlined"
                            value={bio.value}
                            onChange={bio.changeHandler}
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="username"
                            variant="outlined"
                            value={username.value}
                            onChange={username.changeHandler}
                            autoFocus
                        />
                            {
                                username.error &&(
                                    <Typography color="error" variant='caption'>
                                        {username.error}
                                    </Typography>

                                )
                            }

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Password"
                            name="password"
                           
                            variant="outlined"
                            value={password.value}
                        onChange={password.changeHandler}
                        />
                        {
                                password.error &&(
                                    <Typography color="error" variant='caption'>
                                        {password.error}
                                    </Typography>

                                )
                            }
                        <Button
                            sx={{ mt: '1rem'}}
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                        >
                            Sign Up
                        </Button>
                        <Typography textAlign={"center"} m={"1rem"} >
                            OR
                        </Typography>
                        <Button
                        
                            fullWidth
                            variant="text"
                            onClick={toggleLogin}
                        >
                           LogIn Instead  
                            </Button>
                        
                    </form>
                    </>
               )}

        </Paper>
    </Container>

}

export default Login
