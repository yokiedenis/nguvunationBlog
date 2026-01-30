import React, { useState, useEffect } from "react";

const UploadProgressBar = ({
  isUploading,
  progress,
  uploadSpeed,
  timeRemaining,
  fileSize,
  uploadedSize,
  fileName,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (progress) {
      setDisplayProgress(progress);
    }
  }, [progress]);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatSpeed = (bytesPerSecond) => {
    if (!bytesPerSecond) return "0 B/s";
    return formatBytes(bytesPerSecond) + "/s";
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds < 0) return "calculating...";
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  if (!isUploading) return null;

  return (
    <div className="w-full bg-white rounded-lg border border-gray-300 p-3 sm:p-4 shadow-sm">
      {/* File name */}
      <div className="mb-2">
        <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
          {fileName}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>

      {/* Progress info */}
      <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
        <span className="font-medium">{displayProgress.toFixed(1)}%</span>
        <span className="text-gray-500">
          {formatBytes(uploadedSize)} / {formatBytes(fileSize)}
        </span>
      </div>

      {/* Stats grid - responsive */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-blue-50 rounded p-2">
          <p className="text-gray-500 font-medium text-xs">Speed</p>
          <p className="text-blue-600 font-semibold text-xs sm:text-sm">
            {formatSpeed(uploadSpeed)}
          </p>
        </div>
        <div className="bg-green-50 rounded p-2">
          <p className="text-gray-500 font-medium text-xs">Time Left</p>
          <p className="text-green-600 font-semibold text-xs sm:text-sm">
            {formatTime(timeRemaining)}
          </p>
        </div>
        <div className="bg-purple-50 rounded p-2">
          <p className="text-gray-500 font-medium text-xs">Status</p>
          <p className="text-purple-600 font-semibold text-xs sm:text-sm">
            {displayProgress === 100 ? "Processing..." : "Uploading..."}
          </p>
        </div>
      </div>

      {/* Animated dots */}
      {displayProgress < 100 && (
        <div className="mt-3 flex items-center justify-center space-x-1">
          <div
            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadProgressBar;
