// src/components/gallery/VideoPlayer.jsx
import React, { useState } from 'react';

const VideoPlayer = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {isPlaying ? (
        <video 
          src={`${process.env.REACT_APP_GALLERY_SERVICE_URL}${video.url}`} 
          controls
          autoPlay
          className="w-full aspect-video bg-black"
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <div 
          className="relative w-full aspect-video bg-gray-800 cursor-pointer"
          onClick={() => setIsPlaying(true)}
        >
          {video.thumbnail ? (
            <img 
              src={video.thumbnail} 
              alt={video.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="bg-black bg-opacity-50 rounded-full p-3">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{video.title}</h3>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{video.description}</p>
        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          <span>{formatFileSize(video.size)}</span>
        </div>
      </div>
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

export default VideoPlayer;