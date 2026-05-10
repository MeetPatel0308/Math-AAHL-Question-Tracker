import React from 'react';
import './ProgressOverview.css';

export default function ProgressOverview({ progress, totalQuestions }) {
  const completedCount = Object.values(progress).filter(status => status === 'COMPLETED').length;
  const reviewCount = Object.values(progress).filter(status => status === 'REVIEW').length;
  
  const percentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;
  
  return (
    <div className="progress-overview glass-panel animate-fade-in">
      <div className="progress-content">
        <div className="progress-text">
          <h2>Your Progress</h2>
          <p>Track your IB Math AA HL completion</p>
          
          <div className="stats-container">
            <div className="stat-box completed">
              <span className="stat-num">{completedCount}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-box review">
              <span className="stat-num">{reviewCount}</span>
              <span className="stat-label">Needs Review</span>
            </div>
            <div className="stat-box total">
              <span className="stat-num">{totalQuestions}</span>
              <span className="stat-label">Total Questions</span>
            </div>
          </div>
        </div>
        
        <div className="progress-circle-container">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring__circle-bg"
              stroke="var(--bg-tertiary)"
              strokeWidth="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              className="progress-ring__circle"
              stroke="var(--accent-color)"
              strokeWidth="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              style={{
                strokeDasharray: `${52 * 2 * Math.PI}`,
                strokeDashoffset: `${(52 * 2 * Math.PI) - (percentage / 100) * (52 * 2 * Math.PI)}`,
              }}
            />
          </svg>
          <div className="progress-percentage">{percentage}%</div>
        </div>
      </div>
    </div>
  );
}
