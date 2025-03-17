import { RefObject, useState } from 'react';

interface VideoPlayerProps {
  videoSrc: string;
  videoRef: RefObject<HTMLVideoElement>;
  handlePlayPause: () => void;
  seekOneFrame: (direction: 'forward' | 'backward') => void;
  currentTime?: number;
  formatTime?: (seconds: number) => string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  videoRef,
  handlePlayPause,
  seekOneFrame,
  currentTime = 0,
  formatTime = (seconds) => seconds.toFixed(3)
}) => {
  const [showControls, setShowControls] = useState(true);
  
  // Add new function to seek by a specific amount of seconds
  const seekBySeconds = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    // Pause the video when seeking
    video.pause();
    
    // Seek by the specified seconds amount
    video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + seconds));
  };

  return (
    <div className="md:flex md:gap-6">
      <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Video Player</h2>
          {videoSrc && (
            <button
              onClick={() => setShowControls(!showControls)}
              className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm flex items-center gap-1"
            >
              {showControls ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  Hide Controls
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Show Controls
                </>
              )}
            </button>
          )}
        </div>
        <input 
          type="file" 
          accept="video/*" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              window.URL.revokeObjectURL(videoSrc);
              window.dispatchEvent(new CustomEvent('video-upload', { 
                detail: { url: URL.createObjectURL(file) } 
              }));
            }
          }}
          className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-gray-300" 
        />
        {videoSrc && (
          <div className="mt-4">
            <div>
              <video onKeyDown={(e) => e.stopPropagation()}
                ref={videoRef}
                src={videoSrc}
                width="100%"
                height="auto"
                controls={showControls}
                className="rounded-lg shadow mb-4 max-h-[60vh] object-contain"
              />
            </div>
            <div className="p-3 bg-gray-800 border-b border-gray-700">
              <p className="text-center text-blue-400 font-mono font-semibold">
                Current Time: {formatTime && `(${formatTime(currentTime)})`}
              </p>
            </div>
            <div className="flex flex-wrap justify-between mt-4">
              <div className="flex gap-2">
                <button 
                  onClick={handlePlayPause}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Play/Pause
                </button>
                <button 
                  onClick={() => seekOneFrame('backward')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Prev Frame
                </button>
                <button 
                  onClick={() => seekOneFrame('forward')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Next Frame
                </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => seekBySeconds(-1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Back 1s
                </button>
                <button 
                  onClick={() => seekBySeconds(-0.5)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Back 0.5s
                </button>
                <button 
                  onClick={() => seekBySeconds(0.5)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Skip 0.5s
                </button>
                <button 
                  onClick={() => seekBySeconds(1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Skip 1s
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
