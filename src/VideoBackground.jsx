import React from 'react';
import video from './assets/video.mp4'
import { NavLink } from 'react-router-dom';


const VideoBackground = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src= {video}
        autoPlay
        loop
        muted
        playsInline
      ></video>

      {/* Overlay and Animated Text */}
      <div className="relative z-10 flex items-center justify-center h-full bg-black/40 flex-col gap-8">
        <h1 className="text-white text-5xl md:text-7xl font-bold animate-pulse font-semibold">
         Welcome to SmartReconcile ...
        </h1>
        <NavLink to={'/brs'}><button className='px-4 py-2 bg-black text-white rounded full'>Lets get started</button></NavLink>
      </div>
    </div>
  );
};

export default VideoBackground;
