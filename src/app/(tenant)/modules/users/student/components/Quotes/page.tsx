"use client";
import React, { useState, useEffect } from "react";

const GeneratePage = () => {
  const [image, setImage] = useState<string | null>(null);

  // Array of image URLs
  const imageUrls = [
    "/assets/images/quote.jpg",
  ];

  // Function to determine the image based on the current date
  const getImageForToday = (): string => {
    const currentDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24)); // Days since epoch
    const index = currentDay % imageUrls.length; // Rotate through images
    return imageUrls[index];
  };

  useEffect(() => {
    const newImage = getImageForToday();
    setImage(newImage);
  }, []); // Runs only once when the component is mounted

  return (
    <div className=" p-6 mx-auto">
      <div className=" flex justify-center">
        {image ? (
          <img
            src={image}
            alt="Generated"
            className="rounded-lg shadow-lg w-full object-cover border border-[#727272]"
            style={{ maxWidth: "500px", height: "240px" }} // Increased maxWidth and added height: auto
            onError={(e) => {
              console.error("Image failed to load:", image);
              // Type assertion to tell TypeScript that `e.target` is an `HTMLImageElement`
              const target = e.target as HTMLImageElement;
              target.style.display = "none"; // Hide the image if it fails to load
            }}
          />
        ) : (
          <p>Loading image...</p>
        )}
      </div>
    </div>
  );
};

export default GeneratePage;