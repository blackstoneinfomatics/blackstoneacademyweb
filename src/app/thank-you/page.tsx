'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
export default function ThankYou() {
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        setShowContent(true);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className={`max-w-md w-full p-8 bg-white rounded-br-[20px] rounded-tl-[20px] rounded-bl-[10px] rounded-tr-[10px] shadow-[8px_8px_50px_0px_rgba(0,0,0,0.4)] transform transition-all duration-700 ${
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
                <div className="text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <svg 
                                className="w-8 h-8 text-green-500" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                    </div>
                    <Image 
                        src="/assets/images/alf.png" 
                        alt="Logo" 
                        width={160} 
                        height={160} 
                        className="mx-auto mb-6"
                    />
                    <h2 className="text-3xl font-bold text-[#293552] mb-4">
                        Thank You!
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Your form has been successfully submitted. We will contact you soon.
                    </p>
                </div>
            </div>
        </div>
    );
} 