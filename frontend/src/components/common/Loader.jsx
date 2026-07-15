import React, { useEffect } from 'react';
import { square } from 'ldrs';

const Loader = ({ text = "Loading...", fullScreen = true }) => {
  useEffect(() => {
    square.register();
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <l-square
        size="55"
        stroke="5"
        stroke-length="0.25"
        bg-opacity="0.1"
        speed="1.2"
        color="#2962ff" 
      ></l-square>
      {text && <p className="text-gray-600 font-medium animate-pulse tracking-wide">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center w-full">
        {content}
      </div>
    );
  }

  return (
    <div className="py-16 flex items-center justify-center w-full">
      {content}
    </div>
  );
};

export default Loader;
