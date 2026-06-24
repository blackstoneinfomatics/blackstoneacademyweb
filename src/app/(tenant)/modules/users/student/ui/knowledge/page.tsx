'use client';

import React, { useEffect, useState } from 'react';
import PdfCard from '@/app/(tenant)/modules/users/student/components/knowlegdebase/PdfCard';
import BaseLayout2 from '@/app/(tenant)/modules/users/student/components/BaseLayout2';
import { MdTune } from 'react-icons/md';
import { Search, Zap } from 'lucide-react';
import RecordedClassesBase from '../../components/knowlegdebase/RecordedClassesBase';
import StudentHeader from '../../components/StudentHeader';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppFailureToastMessages } from '@/app/_components/contents/toast_message';
import { AppValidationMessages } from '@/app/_components/contents/validation_message';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';

interface Knowledge {
  id: string;
  time?: string;
  subjectTitle?: string;
  courseName?: string;
  pdfUrl?: string;
}

interface RecordedClass1 {
  id: string;
  videoUrl: string;
  time?: string;
  subjectTitle?: string;
  courseName?: string;
}

const arrayBufferToBase64 = (buffer: number[]) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

const Knowledge: React.FC = () => {
  // Knowledge Base states
  const [showPopup, setShowPopup] = useState(false);
  const [searchQueryKB, setSearchQueryKB] = useState('');
  const [showFilterKB, setShowFilterKB] = useState(false);
  const [filteredClass, setFilteredClass] = useState<Knowledge[]>([]);
  const [currentPageKB, setCurrentPageKB] = useState(1);

  // Recorded Classes states
  const [searchQueryRC, setSearchQueryRC] = useState('');
  const [showFilterRC, setShowFilterRC] = useState(false);
  const [recordedClasses, setRecordedClasses] = useState<RecordedClass1[]>([]);
  const [currentPageRC, setCurrentPageRC] = useState(1);

  const itemsPerPageKB = 5;
  const itemsPerPageRC = 5;

  const displayedClassesKB = filteredClass
    .filter((item) =>
      item.subjectTitle?.toLowerCase().includes(searchQueryKB.toLowerCase())
    )
    .slice((currentPageKB - 1) * itemsPerPageKB, currentPageKB * itemsPerPageKB);

  const displayedClassesRC = recordedClasses
    .filter((item) =>
      item?.subjectTitle?.toLowerCase().includes(searchQueryRC.toLowerCase())
    )
    .slice((currentPageRC - 1) * itemsPerPageRC, currentPageRC * itemsPerPageRC);

  // Check user package
  useEffect(() => {
    const userPackage = localStorage.getItem('StudentPackage');
    if (userPackage !== 'Pro') setShowPopup(true);
  }, []);

  // Fetch Knowledge Base data
  useEffect(() => {
    const fetchKnowledgeList = async () => {
      try {
        const token = localStorage.getItem('StudentAuthToken');
        if (!token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }

        const response = await fetch(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.KNOWLEDGE_BASE.LIST}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();
        if (result.status === 'success' && result.data) {
          const formatted : Knowledge[]= result.data.map((item: any) => ({
            id: item._id,
            subjectTitle: item.subjectTitle,
            pdfUrl: `data:application/pdf;base64,${arrayBufferToBase64(
              item.uploadedFile?.data || []
            )}` || '',
             courseName: item.courseName || 'Course Name',
             time: item.createdDate
            ? new Date(item.createdDate).toLocaleDateString()
            : 'Date not specified',
          }));
          setFilteredClass(formatted);
        }
      } catch (error) {
        console.error('❌ Error fetching knowledge list:', error);
        toast.error(AppFailureToastMessages.KNOWLEDGE_FETCH_FAILED);
      }
    };
    fetchKnowledgeList();
  }, []);

  // Fetch Recorded Classes (example static or API)
    useEffect(() => {
    const fetchRecordedClasses = async () => {
      try {
        const token = localStorage.getItem('StudentAuthToken');
        if (!token) {
          toast.error(AppValidationMessages.AUTH.TOKEN_REQUIRED);
          return;
        }

        const response = await axios.get(
          `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.KNOWLEDGE_BASE.LIST}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const filteredVideos = (response.data.data || []).filter(
          (item: any) =>
            item.uploadedFormat?.toLowerCase() === 'video' && item.uploadedFile?.data
        );

        const transformed : RecordedClass1[] = filteredVideos.map((item: any, index: number) => ({
          id: item._id || `video-${index}`,
          courseName: item.courseName || 'Course Name',
          videoUrl: `data:video/mp4;base64,${arrayBufferToBase64(item.uploadedFile.data)}`,
          subjectTitle: item.subjectTitle || 'Class Title',
          time: item.createdDate
            ? new Date(item.createdDate).toLocaleDateString()
            : 'Date not specified',
        }));

        setRecordedClasses(transformed);
      } catch (err) {
        console.error('Failed to fetch recorded classes:', err);
        toast.error(AppFailureToastMessages.RECORDED_CLASSES_FETCH_FAILED);
      }
    };

    fetchRecordedClasses();
  }, []);

  const totalPagesKB = Math.ceil(
    filteredClass.filter((item) =>
      item.subjectTitle?.toLowerCase().includes(searchQueryKB.toLowerCase())
    ).length / itemsPerPageKB
  );

  const totalPagesRC = Math.ceil(
    recordedClasses.filter((item) =>
      item?.subjectTitle?.toLowerCase().includes(searchQueryRC.toLowerCase())
    ).length / itemsPerPageRC
  );

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => {
    const pages = [];
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => setPage(currentPage - 1)}
          className="mx-1 w-8 h-8 text-[20px] rounded bg-[#F8F8FA] dark:bg-[#717171] dark:text-[#9A9A9A] text-[#223857]"
        >
          ‹
        </button>
      );
    }
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`mx-1 w-8 h-8 rounded text-sm font-medium ${
            i === currentPage
              ? 'bg-white dark:bg-[#717171] dark:text-white border border-[#223857] text-[#223857]'
              : 'bg-[#F8F8FA] dark:bg-[#3F3F3F] text-[#203F78] dark:text-[#BDBDBD]'
          }`}
        >
          {i}
        </button>
      );
    }
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => setPage(currentPage + 1)}
          className="mx-1 w-8 h-8 text-[20px] rounded bg-[#F8F8FA] dark:bg-[#717171] dark:text-[#9A9A9A] text-[#223857]"
        >
          ›
        </button>
      );
    }

    return (
      <div className="sticky bottom-0 w-full dark:bg-[#242424] z-10 py-3 px-2 flex justify-end border-t border-gray-200 dark:border-[#3b3b3b]">
        <div className="flex flex-wrap">{pages}</div>
      </div>
    );
  };

  return (
    <BaseLayout2>
      <StudentHeader currentSection="Knowledge Base" />

      <div className="w-full px-2 sm:px-4 py-6 min-h-screen relative">
        {/* ================= KNOWLEDGE BASE ================= */}
        <section className="w-full bg-[#F5F5F5] dark:bg-[#3B3B3B] pt-3 rounded-xl shadow">
          {/* Search + Filter */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full bg-[#FAFAFB] dark:bg-[#343434] px-4 sm:px-6 -mt-3 rounded-t-xl gap-4">
            <div className="flex-1 flex items-center gap-2 text-sm text-gray-500">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Knowledge"
                value={searchQueryKB}
                onChange={(e) => setSearchQueryKB(e.target.value)}
                className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => setShowFilterKB(true)}
              className="flex-1 flex items-center justify-between text-sm text-gray-400 border-y-0 border-x-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4"
            >
              <span className="flex items-center gap-2">
                <MdTune className="w-5 h-5" />
                Filter
              </span>
              <span className="ml-auto text-[20px]">&#9662;</span>
            </button>
            <div className="flex-1 flex items-center text-sm text-gray-500">
              <span>
                Showing {displayedClassesKB.length} of {filteredClass.length}
              </span>
            </div>
          </div>

              <PdfCard
               displayedPdfs={displayedClassesKB}
              />
        </section>

        {renderPagination(currentPageKB, totalPagesKB, setCurrentPageKB)}

        {/* ================= RECORDED CLASSES ================= */}
        <div className="mt-4">
          <h2 className="text-xl font-semibold text-[#0a0a0a] dark:text-white dark:bg-[#242424] pb-3">
            Recorded Classes
          </h2>
          <section className="w-full bg-[#F5F5F5] dark:bg-[#3b3b3b] pt-4 rounded-xl shadow">
            {/* Search + Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full bg-[#FAFAFB] dark:bg-[#343434] px-4 sm:px-6 -mt-4 rounded-t-xl gap-4">
              <div className="flex-1 flex items-center gap-2 text-sm text-gray-500">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Recorded Classes"
                  value={searchQueryRC}
                  onChange={(e) => setSearchQueryRC(e.target.value)}
                  className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
                />
              </div>
              <button
                onClick={() => setShowFilterRC(true)}
                className="flex-1 flex items-center justify-between text-sm text-gray-400 border-y-0 border-x-2 border-gray-300 dark:border-[#868585] h-full md:h-[40px] px-4"
              >
                <span className="flex items-center gap-2">
                  <MdTune className="w-5 h-5" />
                  Filter
                </span>
                <span className="ml-auto text-[20px]">&#9662;</span>
              </button>
              <div className="flex-1 flex items-center text-sm text-gray-500">
                <span>
                  Showing {displayedClassesRC.length} of {recordedClasses.length}
                </span>
              </div>
            </div>

         
                <RecordedClassesBase
                  displayedClassesRC={displayedClassesRC}
                />
           

          </section>
                      {renderPagination(currentPageRC, totalPagesRC, setCurrentPageRC)}

        </div>
      </div>

      {/* Pro Upgrade Popup */}
      {showPopup && (
        <div className="absolute top-0 right-0 bottom-0 left-60 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-white dark:bg-[#2c2c2c] text-gray-800 dark:text-white rounded-2xl p-6 w-[320px] shadow-2xl flex flex-col items-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-purple-500 to-cyan-400 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              !
            </div>
            <p className="text-center text-[16px] font-medium">
              Applicable for Only <br /> Pro Users!
            </p>
            <button className="w-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-[14px] font-semibold py-2 rounded-full hover:opacity-90 flex items-center justify-center gap-2">
              Upgrade Now <Zap className="w-4 h-4 stroke-[2.5] text-white" />
            </button>
          </div>
        </div>
      )}
    </BaseLayout2>
  );
};

export default Knowledge;
