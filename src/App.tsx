import { useState, useRef, useEffect } from "react";
import VideoPlayer from "./components/VideoPlayer";
import TimePointManager from "./components/TimePointManager";
import { TimePoint } from "./types";

function App() {
  const [videoSrc, setVideoSrc] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timePoints, setTimePoints] = useState<TimePoint[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Add event listener for video upload
  useEffect(() => {
    const handleVideoUpload = (event: Event) => {
      const customEvent = event as CustomEvent;
      setVideoSrc(customEvent.detail.url);
    };

    window.addEventListener('video-upload', handleVideoUpload);
    
    return () => {
      window.removeEventListener('video-upload', handleVideoUpload);
    };
  }, []);

  // Add event listener for video time updates
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoSrc]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const seekOneFrame = (direction: 'forward' | 'backward') => {
    const video = videoRef.current;
    if (!video) return;

    // Pause the video when seeking frame by frame
    video.pause();
    
    // Typical video is 24-30 fps, using 1/60 as a reasonable frame duration
    const frameDuration = 1/60;
    
    if (direction === 'forward') {
      video.currentTime = Math.min(video.duration, video.currentTime + frameDuration);
    } else {
      video.currentTime = Math.max(0, video.currentTime - frameDuration);
    }
  };

  const recordCurrentTime = () => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    // Format to 3 decimal places for the label
      
    const newPoint: TimePoint = {
      id: Date.now().toString(),
      time: currentTime,
      label: `${timePoints.length + 1}`
    };
    
    // Add new point and sort by time
    const updatedPoints = [...timePoints, newPoint].sort((a, b) => a.time - b.time);
    setTimePoints(updatedPoints);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      seekOneFrame('backward');
    } else if (e.key === 'ArrowRight') {
      seekOneFrame('forward');
    } else if (e.key === ' ' || e.code === 'Space') {
      // Record time point when spacebar is pressed
      // Prevent default to avoid triggering video play/pause
      e.preventDefault();
      recordCurrentTime();
    }
  };

  useEffect(() => {
    // Add event listener for keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [timePoints, seekOneFrame, recordCurrentTime]); // Fixed dependencies

  // Function to add a new time point
  const addTimePoint = (label: string) => {
    if (!videoRef.current) return;
    
    const currentTime = videoRef.current.currentTime;
    const newPoint: TimePoint = {
      id: Date.now().toString(),
      time: currentTime,
      label: label || `Point ${timePoints.length + 1}`
    };
    
    // In simple mode, we only keep beginning and end
    if (!isAdvancedMode) {
      // If no points exist, this is the beginning
      if (timePoints.length === 0) {
        setTimePoints([newPoint]);
        return;
      }
      
      // If one point exists, this is the end
      if (timePoints.length === 1) {
        // Sort points by time
        const updatedPoints = [...timePoints, newPoint].sort((a, b) => a.time - b.time);
        setTimePoints(updatedPoints);
        return;
      }
      
      // If two points already exist, replace the end point
      if (timePoints.length === 2) {
        const beginning = timePoints[0];
        // Replace the end point
        const updatedPoints = [beginning, newPoint].sort((a, b) => a.time - b.time);
        setTimePoints(updatedPoints);
        return;
      }
    } else {
      // Advanced mode: add any number of points
      const updatedPoints = [...timePoints, newPoint].sort((a, b) => a.time - b.time);
      setTimePoints(updatedPoints);
    }
  };

  // Function to remove a time point
  const removeTimePoint = (id: string) => {
    setTimePoints(timePoints.filter(point => point.id !== id));
  };

  // Function to jump to a specific time point
  const jumpToTimePoint = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Format seconds to MM:SS.ms format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  return (
    <main className="mx-auto p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-white">Time of Flight Tool</h1>
      
      <div className="mb-6 bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Mode Selection</h2>
          <div className="flex items-center">
            <span className={`mr-2 ${!isAdvancedMode ? 'text-white font-bold' : 'text-gray-400'}`}>Simple</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isAdvancedMode}
                onChange={() => setIsAdvancedMode(!isAdvancedMode)}
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className={`ml-2 ${isAdvancedMode ? 'text-white font-bold' : 'text-gray-400'}`}>Advanced</span>
          </div>
        </div>
        <p className="text-gray-300 mt-2">
          {isAdvancedMode ? 
            "Advanced mode: Track multiple time points and calculate durations between them." : 
            "Simple mode: Track beginning and end points. Estimated time will be calculated as 78% of total duration."}
        </p>
      </div>
      
      <div className="md:flex md:gap-6">
        <div className="md:w-1/2">
          <VideoPlayer 
            videoSrc={videoSrc}
            videoRef={videoRef}
            handlePlayPause={handlePlayPause}
            seekOneFrame={seekOneFrame}
            currentTime={currentTime}
            formatTime={formatTime}
          />
        </div>

        {videoSrc && (
          <div className="md:w-1/2">
            <TimePointManager
              timePoints={timePoints}
              addTimePoint={addTimePoint}
              removeTimePoint={removeTimePoint}
              jumpToTimePoint={jumpToTimePoint}
              formatTime={formatTime}
              resetTimePoints={() => setTimePoints([])}
              isAdvancedMode={isAdvancedMode}
              updateTimePoint={(id, label, time) => {
                setTimePoints(points => points.map(point => 
                  point.id === id ? { ...point, label, time: time ?? point.time } : point
                ));
              }}
              getCurrentTime={() => videoRef.current?.currentTime || 0}
            />
          </div>
        )}
      </div>
    </main>
  );
}

export default App;
