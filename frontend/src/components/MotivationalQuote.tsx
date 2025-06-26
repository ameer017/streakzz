import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Quote } from 'lucide-react';

const motivationalQuotes = [
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier"
  },
  {
    text: "Don't let yesterday take up too much of today.",
    author: "Will Rogers"
  },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House"
  },
  {
    text: "Programming isn't about what you know; it's about what you can figure out.",
    author: "Chris Pine"
  },
  {
    text: "The most important property of a program is whether it accomplishes the intention of its user.",
    author: "C.A.R. Hoare"
  },
  {
    text: "Every great developer you know got there by solving problems they were unqualified to solve.",
    author: "Patrick McKenzie"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson"
  },
  {
    text: "Experience is the name everyone gives to their mistakes.",
    author: "Oscar Wilde"
  },
  {
    text: "In order to be irreplaceable, one must always be different.",
    author: "Coco Chanel"
  },
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt"
  },
  {
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt"
  },
  {
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins"
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler"
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs"
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck"
  },
  {
    text: "Progress, not perfection.",
    author: "Unknown"
  }
];

const MotivationalQuote: React.FC = () => {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Get daily quote based on the day of the year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const quoteIndex = dayOfYear % motivationalQuotes.length;
    setCurrentQuote(motivationalQuotes[quoteIndex]);
  }, []);

  const getNewQuote = () => {
    setIsRefreshing(true);
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-100 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Quote className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Daily Motivation</h3>
        </div>
        <button
          onClick={getNewQuote}
          className={`p-2 rounded-lg hover:bg-blue-100 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
          title="Get new quote"
        >
          <RefreshCw className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      <motion.div
        key={currentQuote.text}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-3">
          "{currentQuote.text}"
        </blockquote>
        <cite className="text-blue-600 font-medium text-sm">
          — {currentQuote.author}
        </cite>
      </motion.div>
    </motion.div>
  );
};

export default MotivationalQuote; 