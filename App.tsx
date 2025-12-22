
import React, { useState, useEffect } from 'react';
import { AnalysisResult, QuizData, User } from './types';
import FormulaFitQuiz from './components/FormulaFitQuiz';
import Dashboard from './components/Dashboard';
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import Auth from './components/Auth';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import AdminPanel from './components/AdminPanel';
import * as authService from './utils/authService';
import { generateFormulaAndRecommendations } from './services/geminiService';
import GuestWelcome from './components/GuestWelcome';
import WelcomeModal from './components/WelcomeModal';

type View = 'quiz' | 'dashboard' | 'auth' | 'admin';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('quiz');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    // Session persistent check
    const user = authService.getCurrentUser();
    if (user) {
      handleLoginSuccess(user, false);
    }
  }, []);
  
  const handleQuizSubmit = async (quizData: QuizData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFormulaAndRecommendations(quizData);
      const newHistory = [result, ...analysisHistory];
      setAnalysisHistory(newHistory);
      setCurrentAnalysisIndex(0);
      if (currentUser) {
        authService.saveUserHistory(currentUser.id, newHistory);
      }
      setView('dashboard');
    } catch (err: any) {
        setError(err.message || 'خطا در تحلیل توسط ساسکا. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: User, shouldRedirect: boolean = true) => {
    setCurrentUser(user);
    const history = authService.getUserHistory(user.id);
    setAnalysisHistory(history);
    if (history.length > 0) setCurrentAnalysisIndex(0);

    if (shouldRedirect) {
        if (user.role === 'admin') setView('admin');
        else if (history.length > 0) setView('dashboard');
        else setView('quiz');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAnalysisHistory([]);
    setCurrentAnalysisIndex(null);
    setView('quiz');
  };

  const handleProfileUpdate = async (updatedUser: User) => {
      const savedUser = await authService.updateUserProfile(updatedUser);
      setCurrentUser(savedUser);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-black selection:bg-cyan-500/30">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/40 via-gray-900 to-black"></div>
      </div>
      
      <div className="relative z-10 flex-grow flex flex-col">
        <WelcomeModal />
        
        {isProfileModalOpen && currentUser && (
            <ProfileSettingsModal 
                user={currentUser} 
                onSave={handleProfileUpdate} 
                onClose={() => setIsProfileModalOpen(false)} 
            />
        )}
        
        <Header 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onNavigateToAuth={() => setView('auth')}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onNavigateToAdmin={() => setView('admin')}
        />
        
        <main className="flex-grow container mx-auto px-4 py-8">
            {view === 'auth' && (
                <Auth onLoginSuccess={(user) => handleLoginSuccess(user)} />
            )}
            {view === 'admin' && (
                <AdminPanel />
            )}
            {view === 'quiz' && (
                <FormulaFitQuiz 
                    onSubmit={handleQuizSubmit} 
                    isLoading={isLoading} 
                    error={error} 
                />
            )}
            {view === 'dashboard' && currentAnalysisIndex !== null && analysisHistory[currentAnalysisIndex] && (
                <Dashboard 
                    analysisResult={analysisHistory[currentAnalysisIndex]}
                    analysisHistory={analysisHistory}
                    currentAnalysisIndex={currentAnalysisIndex}
                    onSwitchAnalysis={(idx) => setCurrentAnalysisIndex(idx)}
                    onUpdateAnalysis={(res) => {
                      const history = [...analysisHistory];
                      history[currentAnalysisIndex!] = res;
                      setAnalysisHistory(history);
                      if (currentUser) authService.saveUserHistory(currentUser.id, history);
                    }}
                    onReset={() => setView('quiz')}
                />
            )}
        </main>
        
        <GuestWelcome />
        <Footer />
      </div>
    </div>
  );
};

export default App;
