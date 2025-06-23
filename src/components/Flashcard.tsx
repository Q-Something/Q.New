import { useState, useEffect, useRef } from 'react';
import { BookOpen, X, ChevronLeft, ChevronRight, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-context';
import { getCurrentUserProfile } from '@/lib/api/social-api';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
  category: string;
  wikiUrl: string;
  emoji: string;
}

export function Flashcard() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userStream, setUserStream] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Get user profile and stream
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserStream(null);
        return;
      }

      try {
        const profile = await getCurrentUserProfile();
        setUserStream(profile?.stream?.toLowerCase() || null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserStream(null);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Load flashcards based on user's stream
  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true);
      try {
        let flashcardData = [];
        
        if (userStream) {
          try {
            // Try to load stream-specific flashcards
            const streamFlashcards = await import(`@/data/flashcards/${userStream}.json`);
            flashcardData = streamFlashcards.cards || [];
          } catch (e) {
            console.warn(`No flashcards found for stream ${userStream}, falling back to general`);
            const general = await import('@/data/flashcards/general.json');
            flashcardData = general.cards || [];
          }
        } else {
          // Load general flashcards for non-logged in users or users without a stream
          const general = await import('@/data/flashcards/general.json');
          flashcardData = general.cards || [];
        }
        
        setFlashcards(flashcardData);
        setCurrentIndex(0); // Reset to first card when flashcards change
      } catch (error) {
        console.error('Error loading flashcards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, [userStream]);

  const nextCard = () => {
    if (isAnimating || !flashcards.length) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
      setIsAnimating(false);
      if (cardRef.current) {
        cardRef.current.scrollTop = 0;
      }
    }, 200);
  };

  const prevCard = () => {
    if (isAnimating || !flashcards.length) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
      setIsAnimating(false);
      if (cardRef.current) {
        cardRef.current.scrollTop = 0;
      }
    }, 200);
  };

  const handleStudyMore = () => {
    if (flashcards[currentIndex]?.wikiUrl) {
      window.open(flashcards[currentIndex].wikiUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white p-4 rounded-l-lg shadow-lg">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  // Don't show anything if there are no flashcards
  if (!flashcards.length) return null;

  const currentCard = flashcards[currentIndex];

  return (
    <div 
      className={`fixed right-0 top-1/2 transform -translate-y-1/2 transition-all duration-300 z-50 flex ${
        isExpanded ? 'h-[28rem]' : 'h-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Collapsed State - Just the icon */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white p-4 rounded-l-xl flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-all">
        <BookOpen className="h-6 w-6" />
      </div>

      {/* Expanded Card */}
      {isExpanded && (
        <div 
          className="bg-white w-80 shadow-2xl rounded-l-xl overflow-hidden border border-gray-100 flex flex-col transform transition-all duration-300"
          onWheel={(e) => {
            if (!cardRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = cardRef.current;
            const isAtTop = scrollTop === 0;
            const isAtBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;
            const isScrollingUp = e.deltaY < 0;
            const isScrollingDown = e.deltaY > 0;

            if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <span className="text-xl">{currentCard.emoji}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-blue-100">
                  {userStream ? `${userStream.toUpperCase()} FLASHCARDS` : 'GENERAL FLASHCARDS'}
                </p>
                <h3 className="text-lg font-semibold">{currentCard.category}</h3>
              </div>
            </div>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Card Body */}
          <div 
            ref={cardRef}
            className="flex-1 p-6 flex flex-col bg-gradient-to-br from-gray-50 to-white overflow-y-auto custom-scrollbar"
          >
            <div className={`flex-1 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <h4 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {currentCard.term}
              </h4>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-4"></div>
              <p className="text-gray-600 leading-relaxed">
                {currentCard.definition}
              </p>
            </div>
            
            {/* Navigation */}
            <div className="mt-6 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={prevCard}
                  className="p-2 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 shadow-sm"
                  aria-label="Previous card"
                  disabled={isAnimating || flashcards.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-medium text-gray-500 w-8 text-center">
                  {`${currentIndex + 1}/${flashcards.length}`}
                </span>
                <button 
                  onClick={nextCard}
                  className="p-2 rounded-lg bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors border border-gray-200 shadow-sm"
                  aria-label="Next card"
                  disabled={isAnimating || flashcards.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              
              {currentCard.wikiUrl && (
                <Button 
                  onClick={handleStudyMore}
                  size="sm" 
                  className="text-xs bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Read Article
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add custom scrollbar styles
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background-color: rgba(0, 0, 0, 0.2);
    }
  </style>
`);
