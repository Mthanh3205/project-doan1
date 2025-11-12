import React from 'react';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 text-center">
      <img src="404_NotFound.png" alt="not found" className="mb-6 w-96 max-w-full" />
      <p className="text-xl font-semibold">!!!</p>
      <a
        href="/"
        className="bg-primary hover:bg-primary-dark mt-6 inline-block px-6 py-3 font-medium text-white shadow-md transition"
      >
        Return home page
      </a>
    </div>
  );
};

export default NotFound;
