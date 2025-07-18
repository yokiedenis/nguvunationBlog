import React from "react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-16 h-16 border-4 border-[#e7739a] border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default Loader;
