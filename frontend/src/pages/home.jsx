import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css"
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';


function HomeComponent () {

    let navigate = useNavigate();

    const [meetingCode, setMeetingCode] = useState("");

    const {addToUserHistory} = useContext(AuthContext);

    let handleJoinVideoCall = async () =>{
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`); 
    }


    return (
        <>
            <div className='navBar'>
                <div style={{display:"flex", alignItems:"center", cursor:"pointer"}} onClick={()=>{
                    navigate("/")
                }} className='navHeading'>
                    <h2>Video Call</h2>
                </div>

                <div style={{display:"flex", alignItems:"center"}}>
                    <div  onClick={()=>{
                        navigate("/history")
                    }} style={{display:"flex", alignItems:"center", cursor:"pointer"}}>
                    <IconButton>
                        <RestoreIcon/>
                    </IconButton>
                        <p>History</p>

                    </div>
                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }} style={{marginLeft:"1rem", color:"#6c63ff"}}>
                        Logout
                    </Button>
                </div>
            </div>


            <div className='meetContainer'>
                <div className='leftPanel'>
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{display:"flex", gap:"10px", marginTop:"1.3rem"}}>

                            <TextField onChange={e => setMeetingCode(e.target.value)}   id="outlined-basic" label="Meeting Code"variant="outlined" />

                            <Button onClick={handleJoinVideoCall} variant='contained' style={{backgroundColor:"#6c63ff"}}>Join</Button>
                        </div>
                    </div>
                </div>

                <div className='rightPanel'>
                    <img srcSet='/logo4.png' alt=''/>
                </div>
            </div>
        </>
    );
}

export default withAuth(HomeComponent);
