import React from 'react';
import DataForm from './components/DataForm';

const App = () => {
  return (
    <div className="min-h-screen py-10 px-4 flex justify-center items-center relative overflow-hidden">
      {/* Decorative background blurs for modern aesthetic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-7xl relative z-10 flex justify-center">
        <DataForm />
      </div>
    </div>
  );
};

export default App;