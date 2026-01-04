import React, { useEffect, useRef, useState } from 'react';
import io from "socket.io-client";
// import TextField from '@mui/material/TextField';
import { Badge, IconButton, TextField } from '@mui/material';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam'
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from '../styles/videoComponent.module.css';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import server from "../environment";
import "../App.css";


const server_url = server;

var connections = {};

const peerConfigConnection = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}


export default function VideoMeetComponent(){

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [isCameraOn, setIsCameraOn] = useState(false); 
    let [isMicOn, setIsMicOn] = useState(false); 

    let [screen, setScreen] = useState();

    let [showModel, setShowModel] = useState();

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([]);

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);

    let [videos, setVideos] = useState([]);


    const getPermissions = async ()=>{
        try{
            const videoPermission = await navigator.mediaDevices.getUserMedia({video: true});

            if(videoPermission){
                setVideoAvailable(true);
            }else{
                setVideoAvailable(false); 
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({audio: true});

            if(audioPermission){
                setAudioAvailable(true);
            }else{
                setAudioAvailable(false); 
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailable(true);
            }else{
                setScreenAvailable(false);
            }

            if(videoAvailable || audioAvailable){
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvailable, audio: audioAvailable});

                if(userMediaStream){
                    window.localStream = userMediaStream;
                    if(localVideoRef.current){
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        }catch (err){
            console.log(err);
        }
    }

    useEffect(()=>{
        getPermissions();
    }, [])


    let getUserMediaSuccess = (stream) =>{
        try {

            window.localStream.getTracks().forEach(track => track.stop())
            
        } catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id == socketIdRef.current) continue;

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setIsCameraOn(false);
            setIsMicOn(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e)
            }

            // todo blacksilence

            let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSlience();
            localVideoRef.current.srcObject = window.localStream;


            for(let id in connections){
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                    .then(()=>{
                        socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                    }).catch(e => console.log(e));
                })
            }
        })
    }


    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false})
    }

    let black  = ({width = 640, height = 480} = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), {width, height});

        canvas.getContext('2d').fillRect( 0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], {enabled: false})
    }

    let getUserMedia = () =>{
        if((isCameraOn  && videoAvailable) || (isMicOn  && audioAvailable)){
            navigator.mediaDevices.getUserMedia({video: isCameraOn , audio: isMicOn})
            .then(getUserMediaSuccess) 
            .then((stream)=>{})
            .catch((e)=> console.log(e))
        }else{
            try{
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop())
            }catch(e){

            }
        }
    }

    useEffect(()=>{
        if(isCameraOn  !== undefined && isMicOn !== undefined){
            getUserMedia();
        }
    }, [isMicOn, isCameraOn]);


    let gotMessageFromServer = (fromId, message) =>{
        var signal = JSON.parse(message)

        if(fromId !== socketIdRef.current){
            if(signal.sdp){ // sdp = signal discription
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
                    if(signal.sdp.type === "offer"){

                        connections[fromId].createAnswer().then((description)=>{
                            connections[fromId].setLocalDescription(description).then(()=>{
                                socketRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if(signal.ice){
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () =>{

        socketRef.current = io.connect(server_url, {secure: false})

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", ()=>{
            socketRef.current.emit("join-call", window.location.href)

            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id)=>{
                setVideos((videos)=> videos.filter((video)=> video.socketId !== id))
            })

            socketRef.current.on("user-joined", (id, clients)=>{
                clients.forEach((socketListId) =>{

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnection)

                    connections[socketListId].onicecandidate = (event)=>{
                        if(event.candidate != null){
                            socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
                        }
                    }

                    connections[socketListId].onaddstream = (event) =>{

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if(videoExists){
                            setVideos(videos =>{
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? {...video, stream:event.stream} : video
                                );

                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        }else{

                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true
                            }

                            setVideos(videos =>{
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            })
                        }
                    }

                    if(window.localStream !== undefined && window.localStream !== null){
                        connections[socketListId].addStream(window.localStream);
                    }else{
                        // let blackSlience
                        let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSlience();
                        connections[socketListId].addStream(window.localStream);
                    }
                })

                if(id === socketIdRef.current){
                    for(let id2 in connections){
                        if(id2 === socketIdRef.current) continue

                        try{
                            connections[id2].addStream(window.localStream)
                        }catch(e){}

                        connections[id2].createOffer().then((description)=>{
                            connections[id2].setLocalDescription(description)
                            .then(()=>{
                                socketRef.current.emit("signal", id2, JSON.stringify({"sdp" : connections[id2].localDescription}))
                            })
                            .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let getMedia = () =>{
        setIsCameraOn(videoAvailable);
        setIsMicOn(audioAvailable);
        connectToSocketServer();
    }   

     const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let routeTo = useNavigate();

    let connect = () =>{
        setAskForUsername(false);
        getMedia();
    }


    let handleVideo = () => {
        setIsCameraOn(!isCameraOn);
    }

    let handleAudio = () => {
        setIsMicOn(!isMicOn);
    }

    
    let getDisplayMediaSuccess = (stream) => {
        try{
            window.localStream.getTracks().forEach(track => track.stop())
        }catch(e){
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for(let id in connections){
            if(id === socketIdRef.current) continue;

            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description)=> {
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal", id, JSON.stringify({"sdp": connections[id].localDescription}))
                })
                .catch(e => console.log(e))
            })
        }


          stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) {
                console.log(e)
            }

            let blackSlience = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSlience();
            localVideoRef.current.srcObject = window.localStream;


            getUserMedia();
        })
    }

    let getDisplayMedia = () => {
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video: true, audio: true})
                .then(getDisplayMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
            }
        }
    }


    useEffect(()=>{
        if(screen !== undefined){
            getDisplayMedia();
        }
    }, [screen])


    let handleScreen = () => {
        setScreen(!screen);
    }


    let sendMessage = () => {
        socketRef.current.emit("chat-message", message, username);
        setMessage("");
    }


    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        } catch (e) {
            
        }

        routeTo("/home")
    }

    return (
        <div className='videoMeetComponent'>
            
            {askForUsername === true ? 
                <div style={{textAlign:"center"}}>

       
                    <h2 style={{padding:"2rem"}}>Enter Your Meeting Space</h2>

                    <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined"  style={{ borderRadius: "7rem"}}/>
                    
                    <Button variant="contained" onClick={connect}  style={{marginLeft:"1rem", paddingBlock:"0.9rem", backgroundColor:"#6C63FF"}}>Connect</Button>
                    

                    <div>
                        <video ref={localVideoRef} autoPlay muted style={{borderRadius:"20px", width:"40%", marginTop:"2rem", boxShadow:"2px 4px 8px #211d74b7"}} className='yourVideo'></video>
                    </div>

                </div> : 
                <div className={styles.meetVideoContainer}>

                    {showModel ? <div className={styles.chatRoom}>
                       
                            <div className={styles.chatContainer}>
                                 <h1>Chat</h1>

                                <div className={styles.chattingDisplay}>

                                    {messages.length > 0 ? messages.map((item, index) => {
                                        return(
                                            <div style={{marginBottom:"20px"}} key={index}>
                                                <p style={{fontWeight:"bold"}}>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p>No Messages Yet!</p>}

                                </div>

                                <div className={styles.chattingArea}>
                                    {/* {message} */}
                                     <TextField value={message} onChange={e => setMessage(e.target.value)} id="outlined-basic" label="Write here..." variant="outlined" style={{width:"19rem"}}/>

                                     <Button variant='contained' onClick={sendMessage} className={styles.sendBtn}>Send</Button>
                                </div>

                            </div>

                    </div> : <></>}

                    <div className={styles.buttonContainer}>

                        <IconButton onClick={handleVideo} style={{color:"white"}}>
                            {(isCameraOn === true) ? <VideocamIcon/> : <VideocamOffIcon/>}
                        </IconButton>


                         <IconButton onClick={handleAudio} style={{color:"white"}}> 
                            {isMicOn === true ? <MicIcon/> : <MicOffIcon/>}
                         </IconButton>

                         {screenAvailable === true ? 
                            <IconButton onClick={handleScreen} style={{color:"white"}}>
                                {screen === true ? <ScreenShareIcon/> : <StopScreenShareIcon/>}
                            </IconButton>
                         : <></>}


                         <Badge badgeContent={newMessages} max={999} color='secondary'>
                            <IconButton onClick={()=> setShowModel(!showModel)} style={{color:"white"}}> 
                                <ChatIcon/>
                            </IconButton>
                         </Badge>


                         <IconButton onClick={handleEndCall} style={{color:"white", background:"red", height:"2.5rem",width:"2.5rem", marginLeft:"1rem", marginBottom:"0.1rem"}}> 
                            <CallEndIcon style={{fontSize:"1.8rem"}}/>
                         </IconButton>


                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted ></video>
                    
                    <div className={styles.conferenceView} style={{display:"flex"}}>
                    {videos.map((video) => (

                        <div key={video.socketId}>
                            {/* <h2>{video.socketId}</h2> */}

                            <video data-socket={video.socketId} ref={ref => {
                                if(ref && video.stream){
                                    ref.srcObject = video.stream;
                                }
                            }} autoPlay  style={{ width: '100%', height: 'auto', maxWidth: '600px', maxHeight: '400px' }}>

                            </video>
                        </div>
                    ))}
                    </div>

                </div>
            }

        </div>
    );
}
