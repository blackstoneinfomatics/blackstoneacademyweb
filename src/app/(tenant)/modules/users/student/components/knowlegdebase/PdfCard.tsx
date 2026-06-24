'use client';
import React from 'react';

interface PdfClass {
  id: string;
  courseName?: string;
  subjectTitle?: string;
  pdfUrl?: string;
  time?: string;
}

interface Props {
  displayedPdfs: PdfClass[];
}

const PdfTable: React.FC<Props> = ({ displayedPdfs }) => {
   const openPdfBlob = (base64: string) => {
    const byteCharacters = atob(base64);
    const byteArray = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArray[i] = byteCharacters.charCodeAt(i);
    }

    const blob = new Blob([byteArray], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, "_blank");
  };

  return (
    <div className="overflow-x-auto shadow-sm border dark:border-[#3a3a3a]">
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
          {displayedPdfs.length > 0 ? (
            displayedPdfs.map((pdf, index) => (
              <tr
                key={pdf.id || index}
                className={`text-sm ${
                  index % 2 === 0
                    ? 'bg-white dark:bg-[#3b3b3b]'
                    : 'bg-gray-50 dark:bg-[#2f2f2f]'
                }`}
              >
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {pdf.courseName || 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {pdf.subjectTitle || 'N/A'}
                </td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                  {pdf.time || '-'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                   onClick={() => openPdfBlob(pdf.pdfUrl?.split(",")[1]  ?? '')}
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
                No PDF files found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PdfTable;
