import { useState } from 'react';
import { TimePoint, DurationPair } from '../types';

interface TimePointManagerProps {
  timePoints: TimePoint[];
  addTimePoint: (label: string) => void;
  removeTimePoint: (id: string) => void;
  jumpToTimePoint: (time: number) => void;
  formatTime: (seconds: number) => string;
  resetTimePoints: () => void;
  isAdvancedMode: boolean;
  updateTimePoint?: (id: string, label: string, time?: number) => void; // Add this new prop
  getCurrentTime?: () => number; // Add this new prop to get current video time
}

const TimePointManager: React.FC<TimePointManagerProps> = ({
  timePoints,
  addTimePoint,
  removeTimePoint,
  jumpToTimePoint,
  formatTime,
  resetTimePoints,
  isAdvancedMode,
  updateTimePoint,
  getCurrentTime = () => 0
}) => {
  const [newPointLabel, setNewPointLabel] = useState("");
  const [editingPointId, setEditingPointId] = useState<string | null>(null);

  // Calculate durations between paired points (not adjacent ones)
  const calculateDurations = (): DurationPair[] => {
    const durations: DurationPair[] = [];
    
    // Sort points by time to ensure correct order
    const sortedPoints = [...timePoints].sort((a, b) => a.time - b.time);
    
    // Process points in pairs (0,1), (2,3), etc.
    for (let i = 0; i < sortedPoints.length - 1; i += 2) {
      if (i + 1 < sortedPoints.length) {
        const startPoint = sortedPoints[i];
        const endPoint = sortedPoints[i + 1];
        
        durations.push({
          startId: startPoint.id,
          endId: endPoint.id,
          duration: endPoint.time - startPoint.time
        });
      }
    }
    
    return durations;
  };

  // Calculate total duration by summing all pair durations or using first and last points
  const calculateTotalDuration = (): number => {
    if (timePoints.length < 2) return 0;
    
    if (isAdvancedMode) {
      // Advanced mode: sum all pair durations
      return calculateDurations().reduce((total, current) => total + current.duration, 0);
    } else {
      // Simple mode: use first and last points
      const sortedPoints = [...timePoints].sort((a, b) => a.time - b.time);
      return sortedPoints[sortedPoints.length - 1].time - sortedPoints[0].time;
    }
  };

  const durations = calculateDurations();
  const totalDuration = calculateTotalDuration();
  // Calculate estimated duration for simple mode (78% of total)
  const estimatedDuration = totalDuration * 0.78;

  const handleAddTimePoint = () => {
    if (editingPointId) {
      // If we're editing, update both label and time
      if (updateTimePoint) {
        const currentTime = getCurrentTime();
        updateTimePoint(editingPointId, newPointLabel || 'unlabeled', currentTime);
      }
      setEditingPointId(null);
    } else {
      // If this is the first time point, label it as 'start'
      if (timePoints.length === 0) {
        addTimePoint('Start');
      } else if (timePoints.length === 19) {
        addTimePoint('End');
      } else {
        addTimePoint(newPointLabel);
      }
    }
    setNewPointLabel("");
  };

  const handleEditPoint = (point: TimePoint) => {
    setNewPointLabel(point.label);
    setEditingPointId(point.id);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-white">Time Points</h3>
      <div className="border-b border-gray-700 pb-4 mb-6">
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input
            type="text"
            value={newPointLabel}
            onChange={(e) => setNewPointLabel(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder="Point label"
            className="py-2 px-4 border border-gray-600 bg-gray-700 text-white rounded flex-1 placeholder-gray-400"
          />
          <button 
            onClick={handleAddTimePoint}
            className={`${editingPointId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white py-2 px-4 rounded whitespace-nowrap`}
          >
            {editingPointId ? 'Update Time & Label' : 'Add Current Time'}
          </button>
          {editingPointId && (
            <button 
              onClick={() => {
                setEditingPointId(null);
                setNewPointLabel("");
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded whitespace-nowrap"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-semibold text-white">Marked Points:</h4>
          {timePoints.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all time points?')) {
                  resetTimePoints();
                }
              }}
              className="bg-red-700 hover:bg-red-800 text-white py-1 px-3 rounded text-sm"
            >
              Reset All
            </button>
          )}
        </div>
        {timePoints.length === 0 ? (
          <p className="text-gray-400">No time points added yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[...timePoints].sort((a, b) => a.time - b.time).map((point) => (
              <li key={point.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg list-none">
                <div>
                  <span className="font-medium text-gray-200">{point.label}</span>: 
                  <span className="ml-2 text-blue-400 font-mono">{formatTime(point.time)}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => jumpToTimePoint(point.time)}
                    className="bg-blue-800 hover:bg-blue-900 text-blue-200 px-3 py-1 rounded"
                  >
                    Jump
                  </button>
                  <button 
                    onClick={() => handleEditPoint(point)}
                    className="bg-yellow-800 hover:bg-yellow-900 text-yellow-200 px-3 py-1 rounded"
                    title="Edit label and update to current time position"
                  >
                    ✎
                  </button>
                  <button 
                    onClick={() => removeTimePoint(point.id)}
                    className="bg-red-800 hover:bg-red-900 text-red-200 px-3 py-1 rounded"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-lg font-semibold mb-3 text-white">
          Time of Flight Caclulations
        </h4>
        {(!isAdvancedMode && timePoints.length < 2) || (isAdvancedMode && durations.length === 0) ? (
          <p className="text-gray-400">
            {isAdvancedMode 
              ? "Add at least two points to calculate durations" 
              : "Add beginning and end points to calculate duration"}
          </p>
        ) : (
          <>
            {isAdvancedMode && (
              <>
                <p className="text-gray-400 mb-2">Each skill</p>
                <ul className="space-y-2 mb-6">
                  {durations.map((pair) => {
                    const start = timePoints.find(p => p.id === pair.startId);
                    const end = timePoints.find(p => p.id === pair.endId);
                    return (
                      <li key={`${pair.startId}-${pair.endId}`} className="flex justify-between bg-gray-700 p-3 rounded-lg">
                        <div>
                          <span className="text-gray-300">{start?.label}</span>
                          <span className="mx-2 text-gray-500">→</span>
                          <span className="text-gray-300">{end?.label}</span>
                        </div>
                        <span className="font-mono text-blue-400">{formatTime(pair.duration)}</span>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            
            <div className="bg-blue-900 border border-blue-800 rounded-lg p-4">
              <h4 className="font-bold text-blue-300">
                Total Duration: 
                <span className="font-mono ml-2">{formatTime(totalDuration)}</span>
              </h4>

              {!isAdvancedMode && totalDuration > 0 && (
                <h4 className="font-bold text-green-300 mt-2">
                  Estimated ToF (Total duration  x 0.78): 
                  <span className="font-mono ml-2">{formatTime(estimatedDuration)}</span>
                </h4>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TimePointManager;
