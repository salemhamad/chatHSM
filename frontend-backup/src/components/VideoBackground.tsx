import React from 'react';

const VideoBackground: React.FC = () => {
  return (
    <video
      src="/video-placeholder.mp4"
      className="fixed inset-0 w-full h-full object-cover -z-10"
      autoPlay
      loop
      muted
      playsInline
    />
  );
};

export default VideoBackground;
