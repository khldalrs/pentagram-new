"use client";

import { useState } from "react";

interface GeneratedImage {
  url: string;
  caption: string;
  showCaption?: boolean;
}

// SVG Icon components — not used below, but kept in case you need them
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAllCaptions, setShowAllCaptions] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Sending prompt:", inputText);

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      console.log("Received response:", data);

      if (data.success && data.image) {
        setGeneratedImages(prevImages => [
          ...prevImages,
          {
            url: data.image,
            caption: data.caption,
            showCaption: showAllCaptions,
          },
        ]);
      } else {
        setError(data.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearImages = () => {
    setGeneratedImages([]);
  };

  const toggleAllCaptions = () => {
    setShowAllCaptions(!showAllCaptions);
    setGeneratedImages(prevImages =>
      prevImages.map(img => ({
        ...img,
        showCaption: !showAllCaptions,
      }))
    );
  };

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white flex flex-col items-center py-6 px-4">
      {/* App Header with Instagram-like gradient */}
      <header className="w-full max-w-4xl flex justify-center items-center mb-8">
        <div className="w-full h-16 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 flex items-center justify-center shadow-md">
          <h1 className="text-lg md:text-xl font-semibold tracking-wide drop-shadow-sm">
            AI Image Generator
          </h1>
        </div>
      </header>

      {/* Main container/card */}
      <div className="w-full max-w-4xl bg-neutral-800/60 rounded-xl backdrop-blur-md p-6 sm:p-8 shadow-lg">
        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-600/10 border border-red-600 rounded-md">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row w-full gap-3">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Describe the image you want..."
              disabled={isLoading}
              className="flex-1 p-3 rounded-lg bg-neutral-700 placeholder-gray-400 
                         focus:ring-2 focus:ring-purple-500 focus:outline-none
                         border border-neutral-700 text-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600
                         hover:to-pink-500 disabled:opacity-50 transition-all 
                         font-medium"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>

        {/* Action buttons (toggle captions & clear) if images exist */}
        {generatedImages.length > 0 && (
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={toggleAllCaptions}
              className="flex items-center gap-2 px-4 py-2 rounded-md 
                         bg-neutral-700 hover:bg-neutral-600 transition-colors"
            >
              {showAllCaptions ? (
                <>
                  <EyeOffIcon />
                  <span>Hide Captions</span>
                </>
              ) : (
                <>
                  <EyeIcon />
                  <span>Show Captions</span>
                </>
              )}
            </button>
            <button
              onClick={handleClearImages}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 
                         transition-colors"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Images Grid */}
        {generatedImages.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {generatedImages.map((image, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-lg bg-neutral-800 shadow-md"
              >
                {/* Base image */}
                <img
                  src={image.url}
                  alt={image.caption}
                  className="w-full h-64 object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
                {/* Caption overlay (on hover OR always if showCaption is true) */}
                <div
                  className={`${
                    image.showCaption
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  } absolute inset-0 bg-black/60 flex items-end p-4 transition-opacity duration-300`}
                >
                  <p className="text-sm font-medium leading-tight text-white">
                    {image.caption}
                  </p>
                </div>
                {/* Touch device button */}
                <button
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                  aria-label="Toggle caption visibility"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
