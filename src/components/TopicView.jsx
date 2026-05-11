import React, { useState, useMemo } from 'react';
import '../components/PaperView.css'; // Re-use the question button styles
import './TopicView.css';

export default function TopicView({ appData, topicsList, progress, onToggleStatus }) {
  const [openTopic, setOpenTopic] = useState(null);

  // Group questions by topic
  const questionsByTopic = useMemo(() => {
    const grouped = {};
    topicsList.forEach(t => grouped[t] = []);

    appData.forEach(year => {
      year.seriesList.forEach(series => {
        series.timezones.forEach(tz => {
          tz.papers.forEach(paper => {
            paper.questions.forEach(q => {
              q.topics.forEach(topic => {
                if (grouped[topic]) {
                  grouped[topic].push(q);
                }
              });
            });
          });
        });
      });
    });
    return grouped;
  }, []);

  const getStatusClass = (id) => {
    const status = progress[id] || 'NOT_STARTED';
    return status.toLowerCase();
  };

  const getStatusIcon = (status) => {
    if (status === 'COMPLETED') return '✓';
    if (status === 'REVIEW') return '!';
    return '';
  };

  return (
    <div className="topic-view-container">
      {topicsList.map(topic => {
        const questions = questionsByTopic[topic] || [];
        const isOpen = openTopic === topic;

        return (
          <div key={topic} className={`topic-accordion glass-panel ${isOpen ? 'open' : ''}`}>
            <div 
              className="topic-header" 
              onClick={() => setOpenTopic(isOpen ? null : topic)}
            >
              <h3>{topic} <span className="topic-count">({questions.length})</span></h3>
              <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
            </div>
            
            {isOpen && (
              <div className="topic-content animate-fade-in">
                <div className="topic-questions-grid">
                  {questions.map((q) => {
                    const status = progress[q.id] || 'NOT_STARTED';
                    const label = `${q.metadata.year} ${q.metadata.series} ${q.metadata.timezone} ${q.metadata.paperName}`;
                    return (
                      <button
                        key={`${topic}-${q.id}`}
                        className={`topic-question-btn question-btn ${getStatusClass(q.id)}`}
                        onClick={() => onToggleStatus(q.id)}
                        title={`${label} - Q${q.number} - ${status}`}
                      >
                        <div className="tq-metadata">{label}</div>
                        <div className="tq-number">Q{q.number}</div>
                        {q.section !== 'N/A' && (
                          <div className="tq-section">Sec {q.section}</div>
                        )}
                        <div className="q-status-icon">{getStatusIcon(status)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
