import React from 'react';
import './PaperView.css';

export default function PaperView({ paper, progress, onToggleStatus }) {
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
    <div className="paper-view">
      <h4 className="paper-title">{paper.paperName}</h4>
      <div className="questions-grid">
        {paper.questions.map((q) => {
          const status = progress[q.id] || 'NOT_STARTED';
          return (
            <button
              key={q.id}
              className={`question-btn ${getStatusClass(q.id)}`}
              onClick={() => onToggleStatus(q.id)}
              title={`${q.id} - ${status}`}
            >
              <div className="q-number">Q{q.number}</div>
              {q.section !== 'N/A' && (
                <div className="q-section">Sec {q.section}</div>
              )}
              <div className="q-status-icon">{getStatusIcon(status)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
