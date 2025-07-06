import React from 'react';
import "../App.css";
import {Link, useNavigate} from "react-router-dom";

export default function LandingPage(){

    const router = useNavigate();

    return (
        <div className='landingPageContainer'>
           <nav>
                <div className='navHeader'>
                    <h2>Video Call</h2>
                </div>

                <div className='navlist'>
                    <p onClick={()=>{
                        router("/random")
                    }}>Join as Guest</p>

                    <p onClick={() =>{
                        router("/auth")
                    }}>Register</p>

                    <div onClick={() =>{
                        router("/auth")
                    }} role='button'>
                        <p>Login</p>
                    </div>
                </div>
           </nav>



            <div className="landingMainContainer">
                <div>
                    <h1><span style={{color:"#FF9839"}}>Connect</span> with your loved Ones</h1>

                    <p>Cover a distance by Video Call</p>

                    <div role='button'>
                        <Link to={"/auth"}>Get Started</Link>
                    </div>
                </div>

                <div style={{display:"flex"}}>
                    <img src="/mobile.png" alt="" />

                    {/* <img src='/undraw_video-call_013n.png'/> */}
                </div>
            </div>

        </div>
    );
}


