
import React, { useState, useRef, useEffect } from 'react';
import { continueConversation } from '../services/geminiService';
import { ChatMessage } from '../types';
import Card from './shared/Card';
import LoadingSpinner from './shared/LoadingSpinner';
import { PaperAirplaneIcon, MagnifyingGlassIcon, CpuChipIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';

interface ChatbotProps {
    initialHistory: ChatMessage[];
    formulaCode: string;
}

// Fix: Explicitly type SimpleMarkdownParser as a React.FC to ensure TypeScript correctly handles the 'key' prop.
const SimpleMarkdownParser: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return part;
      })}
    </>
  );
};

const HighlightedText = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim() || !text) {
    return <SimpleMarkdownParser text={text || ''} />;
  }
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedHighlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <span key={i} className="bg-yellow-500 text-black px-1 rounded">{part}</span>
        ) : (
          <SimpleMarkdownParser key={i} text={part} />
        )
      )}
    </>
  );
};


const Chatbot: React.FC<ChatbotProps> = ({initialHistory, formulaCode}) => {
  const storageKey = `chatHistory_${formulaCode}`;
  
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    try {
      const savedHistory = localStorage.getItem(storageKey);
      return savedHistory ? JSON.parse(savedHistory) : initialHistory;
    } catch (e) {
      console.error("Failed to parse chat history:", e);
      return initialHistory;
    }
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [useThinkingMode, setUseThinkingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(-1);
  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if(!isSearchVisible) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, isSearchVisible]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [history, storageKey]);

  useEffect(() => {
    messageRefs.current = messageRefs.current.slice(0, history.length);
    if (searchTerm.trim()) {
        const results = history.reduce((acc, msg, index) => {
            const text = msg.parts?.[0]?.text ?? '';
            if (text.toLowerCase().includes(searchTerm.toLowerCase())) {
                acc.push(index);
            }
            return acc;
        }, [] as number[]);
        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
    } else {
        setSearchResults([]);
        setCurrentResultIndex(-1);
    }
  }, [searchTerm, history]);

  useEffect(() => {
    if (isSearchVisible && currentResultIndex !== -1 && searchResults.length > 0) {
        const messageIndex = searchResults[currentResultIndex];
        messageRefs.current[messageIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentResultIndex, searchResults, isSearchVisible]);
  
  const closeSearch = () => {
    setIsSearchVisible(false);
    setSearchTerm('');
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    closeSearch();
    
    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }], timestamp: Date.now(), status: 'sent' };
    const conversationHistoryForApi = history;
    
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await continueConversation(conversationHistoryForApi, input, useThinkingMode, useSearch);
      const modelMessage: ChatMessage = { 
          role: 'model', 
          parts: [{ text: response.text }],
          groundingChunks: response.groundingChunks,
          timestamp: Date.now()
      };
      
      setHistory(prev => {
          const updatedHistory = [...prev];
          // FIX: Replace findLastIndex with a reverse for-loop for broader browser compatibility.
          let lastUserMessageIndex = -1;
          for (let i = updatedHistory.length - 1; i >= 0; i--) {
            if (updatedHistory[i].role === 'user') {
                lastUserMessageIndex = i;
                break;
            }
          }
          
          if (lastUserMessageIndex !== -1) {
              updatedHistory[lastUserMessageIndex] = { ...updatedHistory[lastUserMessageIndex], status: 'responded' };
          }
          return [...updatedHistory, modelMessage];
      });

    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', parts: [{ text: "متاسفم، با خطا مواجه شدم. لطفاً دوباره تلاش کنید." }], timestamp: Date.now() };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const handleNextResult = () => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex(prev => (prev + 1) % searchResults.length);
  };
  
  const handlePrevResult = () => {
    if (searchResults.length === 0) return;
    setCurrentResultIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
  };
  
  const handleToggleThinking = () => {
    const newState = !useThinkingMode;
    setUseThinkingMode(newState);
    if (newState) setUseSearch(false);
  };

  const handleToggleSearch = () => {
    const newState = !useSearch;
    setUseSearch(newState);
    if (newState) setUseThinkingMode(false);
  };

  const ToggleButton = ({ isEnabled, onToggle, icon: Icon, label }: {isEnabled: boolean, onToggle: ()=>void, icon: React.ElementType, label: string}) => (
      <button onClick={onToggle} className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${isEnabled ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
          <Icon className="h-4 w-4" />
          <span>{label}</span>
      </button>
  );

  return (
    <Card className="flex flex-col h-[70vh] animate-fade-in">
        <div className="flex justify-between items-center pb-2 border-b border-gray-700 mb-2">
            <h3 className="text-lg font-semibold text-gray-200">چت با ساسکا</h3>
            <div className="flex items-center gap-2">
                 <span className="text-[10px] text-gray-500 bg-black/20 px-2 py-1 rounded">REF: {formulaCode}</span>
                 <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                 </button>
            </div>
        </div>

        {isSearchVisible && (
            <div className="flex items-center gap-2 p-2 bg-gray-700 rounded-lg mb-2 animate-fade-in border border-gray-600">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                <input 
                    type="text"
                    placeholder="جستجو در گفتگو..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent focus:outline-none"
                    autoFocus
                />
                {searchTerm && searchResults.length > 0 && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">{currentResultIndex + 1} از {searchResults.length}</span>
                )}
                {searchTerm && searchResults.length === 0 && (
                    <span className="text-xs text-gray-400 whitespace-nowrap">یافت نشد</span>
                )}
                <button onClick={handlePrevResult} disabled={searchResults.length < 2} className="disabled:opacity-50 text-gray-400 hover:text-white">
                    <ChevronUpIcon className="h-5 w-5" />
                </button>
                 <button onClick={handleNextResult} disabled={searchResults.length < 2} className="disabled:opacity-50 text-gray-400 hover:text-white">
                    <ChevronDownIcon className="h-5 w-5" />
                </button>
                <button onClick={closeSearch} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        )}

      <div className="flex-1 overflow-y-auto pe-4 -me-4 space-y-4">
        {history.map((msg, index) => (
          <div 
            key={`${index}-${msg.timestamp}`}
            ref={el => { if(el) messageRefs.current[index] = el; }}
            className={`flex items-end gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0"></div>}
            
            <div className={`max-w-xl p-3 pb-1.5 rounded-2xl transition-all duration-300 ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-es-none' : 'bg-gray-700 text-gray-200 rounded-ss-none'} ${searchResults[currentResultIndex] === index ? 'ring-2 ring-cyan-500' : ''}`}>
                <div className="whitespace-pre-wrap">
                    <HighlightedText text={msg.parts[0].text} highlight={searchTerm} />
                </div>
                
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-3 border-t border-gray-600 pt-2">
                        <h4 className="text-xs font-semibold text-gray-400 mb-1">منابع:</h4>
                        <ul className="text-xs space-y-1">
                            {msg.groundingChunks.map((chunk, i) => (
                                chunk.web && chunk.web.uri && chunk.web.title && <li key={i}><a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline truncate block">{chunk.web.title}</a></li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="flex justify-end items-center gap-1.5 mt-1 text-xs opacity-75">
                    <span className="font-sans" dir="ltr">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </span>
                    {msg.role === 'user' && msg.status && (
                        msg.status === 'responded' ? (
                            <div className="relative w-4 h-4" title="خوانده شد">
                                <CheckIcon className="h-4 w-4 text-cyan-200 absolute right-0" />
                                <CheckIcon className="h-4 w-4 text-cyan-200 absolute right-1" />
                            </div>
                        ) : (
                            <CheckIcon className="h-4 w-4" title="ارسال شد" />
                        )
                    )}
                </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex-shrink-0"></div>
             <div className="max-w-xl p-4 rounded-2xl bg-gray-700 text-gray-200 rounded-ss-none"><LoadingSpinner/></div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-end gap-3 mb-2">
            <ToggleButton isEnabled={useSearch} onToggle={handleToggleSearch} icon={MagnifyingGlassIcon} label="جستجوی گوگل"/>
            <ToggleButton isEnabled={useThinkingMode} onToggle={handleToggleThinking} icon={CpuChipIcon} label="حالت تفکر عمیق"/>
        </div>
        <div className="flex items-center bg-gray-700 rounded-lg ps-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="از ساسکا بپرسید..."
            className="flex-1 bg-transparent p-3 focus:outline-none"
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 m-1 rounded-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-110">
            <PaperAirplaneIcon className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default Chatbot;
