import React, { useState } from 'react';
import PaperView from './PaperView';
import './YearAccordion.css';

export default function YearAccordion({ yearData, progress, onToggleStatus }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`year-accordion glass-panel ${isOpen ? 'open' : ''}`}>
      <div 
        className="accordion-header" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3>{yearData.year} Papers</h3>
        <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
      </div>
      
      {isOpen && (
        <div className="accordion-content animate-fade-in">
          {yearData.seriesList.map((seriesData, sIndex) => (
            <div key={sIndex} className="series-section">
              <h4 className="series-title">{seriesData.series} Series</h4>
              
              {seriesData.timezones.map((tzData, tIndex) => (
                <div key={tIndex} className="timezone-section">
                  <h5 className="timezone-title">{tzData.timezone}</h5>
                  
                  <div className="papers-container">
                    {tzData.papers.map((paper, pIndex) => (
                      <PaperView 
                        key={pIndex} 
                        paper={paper} 
                        progress={progress} 
                        onToggleStatus={onToggleStatus} 
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
