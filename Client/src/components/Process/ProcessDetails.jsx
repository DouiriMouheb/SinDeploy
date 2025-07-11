// src/components/Process/ProcessDetails.jsx - Show process details and activities
import React from "react";

export const ProcessDetails = ({ process }) => {
  if (!process) return null;
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{process.name}</h2>
      {process.description && (
        <p className="mb-2 text-gray-700">{process.description}</p>
      )}
      <h3 className="text-lg font-semibold mt-4 mb-2">Activities</h3>
      {process.activities && process.activities.length > 0 ? (
        <ul className="list-disc pl-6">
          {process.activities.map((activity) => (
            <li key={activity.id} className="mb-1">
              <span className="font-medium">{activity.name}</span>
              {activity.description && (
                <span className="text-gray-500 ml-2">
                  - {activity.description}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No activities for this process.</p>
      )}
    </div>
  );
};
