import { useState, useEffect, useMemo } from 'react';
import { pastPapersData as initialData, ALL_TOPICS as initialTopics } from './data/pastPapers';
import ProgressOverview from './components/ProgressOverview';
import YearAccordion from './components/YearAccordion';
import TopicView from './components/TopicView';
import AdminView from './components/AdminView';
import { db } from './lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

function App() {
  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('mathTrackerProgress');
    return saved ? JSON.parse(saved) : {};
  });

  const [appData, setAppData] = useState(() => {
    const saved = localStorage.getItem('mathTrackerAppData');
    return saved ? JSON.parse(saved) : initialData;
  });
  
  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('mathTrackerTopics');
    return saved ? JSON.parse(saved) : initialTopics;
  });
  
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState('PAPER'); // 'PAPER' | 'TOPIC' | 'ADMIN'
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    localStorage.setItem('mathTrackerProgress', JSON.stringify(progress));
  }, [progress]);

  // Firebase Real-time Sync
  useEffect(() => {
    const dataRef = doc(db, 'trackerData', 'main');

    // First check if it exists, if not initialize it
    const initializeFirebase = async () => {
      try {
        const snap = await getDoc(dataRef);
        if (!snap.exists()) {
          // Initialize with local storage if it exists, else use mock data
          const localAppData = localStorage.getItem('mathTrackerAppData');
          const localTopics = localStorage.getItem('mathTrackerTopics');
          
          const defaultData = localAppData ? JSON.parse(localAppData) : initialData;
          const defaultTopics = localTopics ? JSON.parse(localTopics) : initialTopics;

          await setDoc(dataRef, {
            appData: defaultData,
            topics: defaultTopics
          });
        }
      } catch (err) {
        console.error("Error initializing Firebase:", err);
        setLoading(false);
      }
    };

    initializeFirebase();

    // Listen to changes
    const unsubscribe = onSnapshot(dataRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.appData) setAppData(data.appData);
        if (data.topics) setTopics(data.topics);
      }
      // Always stop loading once we get our first snapshot response
      setLoading(false);
    }, (error) => {
      console.error("Error fetching data from Firebase:", error);
      setLoading(false);
    });

    // Fallback timeout in case Firebase is completely blocked
    const fallbackTimeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(fallbackTimeout);
    };
  }, []);

  const toggleStatus = (questionId) => {
    setProgress(prev => {
      const currentStatus = prev[questionId] || 'NOT_STARTED';
      let nextStatus = 'NOT_STARTED';
      
      if (currentStatus === 'NOT_STARTED') nextStatus = 'COMPLETED';
      else if (currentStatus === 'COMPLETED') nextStatus = 'REVIEW';
      else if (currentStatus === 'REVIEW') nextStatus = 'NOT_STARTED';

      return {
        ...prev,
        [questionId]: nextStatus
      };
    });
  };

  const totalQuestions = useMemo(() => {
    let count = 0;
    appData.forEach(year => {
      year.seriesList.forEach(series => {
        series.timezones.forEach(tz => {
          tz.papers.forEach(paper => {
            count += paper.questions.length;
          });
        });
      });
    });
    return count;
  }, [appData]);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2 style={{ color: 'var(--text-primary)' }}>Loading Data from Cloud...</h2>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header animate-fade-in">
        <h1>Math AAHL Tracker</h1>
        <p>By Meet</p>
      </header>
      
      <main>
        <ProgressOverview progress={progress} totalQuestions={totalQuestions} />
        
        <div className="view-tabs animate-fade-in">
          <button 
            className={`tab-btn ${currentView === 'PAPER' ? 'active' : ''}`}
            onClick={() => setCurrentView('PAPER')}
          >
            View by Paper
          </button>
          <button 
            className={`tab-btn ${currentView === 'TOPIC' ? 'active' : ''}`}
            onClick={() => setCurrentView('TOPIC')}
          >
            View by Topic
          </button>
          <button 
            className={`tab-btn ${currentView === 'ADMIN' ? 'active' : ''}`}
            onClick={() => setCurrentView('ADMIN')}
            style={{ marginLeft: 'auto' }}
          >
            ⚙️ Admin Panel
          </button>
        </div>

        <div className="view-content animate-fade-in" key={currentView}>
          {currentView === 'PAPER' && (
            <div className="years-container">
              {appData.map((yearData, index) => (
                <YearAccordion 
                  key={index} 
                  yearData={yearData} 
                  progress={progress}
                  onToggleStatus={toggleStatus}
                />
              ))}
            </div>
          )}
          
          {currentView === 'TOPIC' && (
            <TopicView 
              appData={appData}
              topicsList={topics}
              progress={progress} 
              onToggleStatus={toggleStatus} 
            />
          )}

          {currentView === 'ADMIN' && (
            isAdminAuth ? (
              <AdminView 
                appData={appData}
                topicsList={topics}
              />
            ) : (
              <div className="admin-login glass-panel animate-fade-in" style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
                <h2 style={{ marginBottom: '8px' }}>Admin Login</h2>
                <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Enter password to manage data.</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (adminPassword === 'meet123') setIsAdminAuth(true);
                  else alert('Incorrect password');
                }}>
                  <input 
                    type="password" 
                    value={adminPassword} 
                    onChange={e => setAdminPassword(e.target.value)} 
                    placeholder="Password" 
                    style={{ 
                      boxSizing: 'border-box',
                      width: '100%', 
                      padding: '10px 14px', 
                      background: 'rgba(0,0,0,0.2)', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      borderRadius: 'var(--radius-sm)',
                      color: 'white',
                      marginBottom: '16px'
                    }} 
                  />
                  <button type="submit" style={{
                    background: 'var(--accent-color)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>Login</button>
                </form>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
