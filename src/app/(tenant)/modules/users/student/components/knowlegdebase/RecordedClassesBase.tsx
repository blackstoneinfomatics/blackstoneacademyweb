'use client';
import { useState } from 'react';

interface RecordedClass {
  id: string;
  courseName?: string;
  subjectTitle?: string;
  videoUrl: string;
  time?: string;
}

interface Props {
  displayedClassesRC: RecordedClass[];
}

const RecordedClassesTable: React.FC<Props> = ({ displayedClassesRC }) => {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto  shadow-sm border dark:border-[#3a3a3a]">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#3B568E] text-white text-sm text-left">
            <th className="px-4 py-3 font-medium">Course Name</th>
            <th className="px-4 py-3 font-medium">Subject</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {displayedClassesRC.length > 0 ? (
            displayedClassesRC.map((video, index) => (
              <tr
                key={video.id || index}
                className={`text-sm ${
                  index % 2 === 0
                    ? 'bg-white dark:bg-[#3b3b3b]'
                    : 'bg-gray-50 dark:bg-[#2f2f2f]'
                }`}
              >
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {video.courseName}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {video.subjectTitle}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {video.time}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setSelectedVideo(video.videoUrl)}
                    className="text-xs px-4 py-1 rounded-md transition bg-[#4459A9] text-white hover:bg-[#3a4c90]"
                  >
                    View file
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={4}
                className="text-center py-6 text-gray-500 dark:text-gray-400"
              >
                No recorded classes found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden max-w-2xl w-full">
            <video src={selectedVideo} controls className="w-full h-[300px]" />
            <div className="flex justify-end p-3">
              <button
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-2 text-white bg-gray-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordedClassesTable;
