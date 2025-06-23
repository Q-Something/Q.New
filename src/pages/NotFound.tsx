import { useEffect } from "react";

const NotFound = () => {
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route"
    );
  }, []);

  // Skull SVG Component
  const Skull = ({ className = "" }) => (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Skull outline */}
      <path
        d="M50 10C35 10 25 20 25 35C25 40 26 45 28 49L30 65C30 70 35 75 50 75C65 75 70 70 70 65L72 49C74 45 75 40 75 35C75 20 65 10 50 10Z"
        fill="#e5e7eb"
        stroke="#10b981"
        strokeWidth="2"
      />
      {/* Eye sockets */}
      <circle cx="38" cy="35" r="8" fill="#000" />
      <circle cx="62" cy="35" r="8" fill="#000" />
      {/* Glowing eyes */}
      <circle cx="38" cy="35" r="3" fill="#10b981" className="animate-pulse" />
      <circle cx="62" cy="35" r="3" fill="#10b981" className="animate-pulse" />
      {/* Nasal cavity */}
      <path d="M50 45L45 55L50 60L55 55Z" fill="#000" />
      {/* Teeth */}
      <rect x="45" y="55" width="3" height="8" fill="#e5e7eb" />
      <rect x="49" y="58" width="3" height="5" fill="#e5e7eb" />
      <rect x="53" y="55" width="3" height="8" fill="#e5e7eb" />
    </svg>
  );

  // Bones SVG Component
  const Bone = ({ className = "" }) => (
    <svg
      className={className}
      viewBox="0 0 60 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 10L52 10M8 10C8 6 4 6 4 10C4 14 8 14 8 10ZM52 10C52 6 56 6 56 10C56 14 52 14 52 10Z"
        stroke="#e5e7eb"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="4" cy="7" r="2" fill="#e5e7eb" />
      <circle cx="4" cy="13" r="2" fill="#e5e7eb" />
      <circle cx="56" cy="7" r="2" fill="#e5e7eb" />
      <circle cx="56" cy="13" r="2" fill="#e5e7eb" />
    </svg>
  );

  // Ghost SVG Component
  const Ghost = ({ className = "" }) => (
    <svg
      className={className}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 15C25 15 15 25 15 40L15 75C15 80 20 85 25 85C30 85 35 80 40 85C45 80 50 85 55 85C60 85 65 80 65 75L65 40C65 25 55 15 40 15Z"
        fill="rgba(255, 255, 255, 0.1)"
        stroke="#8b5cf6"
        strokeWidth="2"
        className="animate-pulse"
      />
      <circle cx="30" cy="35" r="4" fill="#8b5cf6" className="animate-pulse" />
      <circle cx="50" cy="35" r="4" fill="#8b5cf6" className="animate-pulse" />
      <path d="M35 45C35 50 40 52 45 50" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating bones background */}
      <div className="absolute inset-0 pointer-events-none">
        <Bone className="absolute top-20 left-10 w-16 h-8 opacity-20 animate-pulse" />
        <Bone className="absolute top-40 right-20 w-12 h-6 opacity-15 rotate-45 animate-pulse" />
        <Bone className="absolute bottom-32 left-20 w-14 h-7 opacity-25 -rotate-12 animate-pulse" />
        <Bone className="absolute bottom-20 right-10 w-10 h-5 opacity-20 rotate-90 animate-pulse" />
        <Ghost className="absolute top-10 right-10 w-16 h-20 opacity-10" />
        <Ghost className="absolute bottom-10 left-10 w-20 h-25 opacity-15" />
      </div>

      {/* Main content */}
      <div className="text-center z-10 max-w-2xl mx-auto">
        {/* Large skull */}
        <div className="mb-8">
          <Skull className="w-32 h-32 mx-auto mb-4" />
        </div>

        {/* Error code */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-purple-400 to-green-400 animate-pulse">
            404
          </h1>
        </div>

        {/* Spooky message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">
            Huh... You Wanna Join The Ghost Party?
          </h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
            Looks like you've wandered into the digital graveyard. This page has crossed over to the other side!
          </p>
        </div>

        {/* Crossed bones decoration */}
        <div className="mb-8 flex justify-center items-center">
          <Bone className="w-20 h-8 rotate-45 opacity-60" />
          <Bone className="w-20 h-8 -rotate-45 opacity-60 -ml-6" />
        </div>

        {/* Return button */}
        <div className="space-y-4">
          <button 
            onClick={() => window.history.back()}
            className="bg-gradient-to-r from-green-600 to-purple-600 hover:from-green-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 border-2 border-green-500 hover:border-purple-500"
          >
            Escape the Graveyard
          </button>
          <p className="text-sm text-gray-400 mt-2">
            Return to the land of the living
          </p>
        </div>
      </div>

      {/* Eerie glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/5 to-purple-900/10 pointer-events-none"></div>
    </div>
  );
};

export default NotFound;