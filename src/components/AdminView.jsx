import React, { useState, useEffect } from 'react';
import './AdminView.css';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AdminView({ appData, topicsList }) {
  // Topic
  const [newTopic, setNewTopic] = useState('');

  // Year
  const [newYear, setNewYear] = useState('');

  // Question Form
  const [qYear, setQYear] = useState(appData[0]?.year || '');
  const [qSeries, setQSeries] = useState('May');
  const [qTimezone, setQTimezone] = useState('TZ1');
  const [qPaper, setQPaper] = useState('Paper 1');
  const [qNum, setQNum] = useState('');
  const [qSection, setQSection] = useState('A');
  const [qTopics, setQTopics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Bulk Import
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    setIsEditing(false);
    if (!qYear || !qNum) return;
    
    const yearObj = appData.find(y => y.year.toString() === qYear.toString());
    if (!yearObj) return;

    const seriesObj = yearObj.seriesList.find(s => s.series === qSeries);
    if (!seriesObj) return;

    const tzObj = seriesObj.timezones.find(t => t.timezone === qTimezone);
    if (!tzObj) return;

    const paperObj = tzObj.papers.find(p => p.paperName === qPaper);
    if (!paperObj) return;

    const targetId = `${qYear}-${qSeries}-${qTimezone}-${qPaper.replace(" ", "")}-Q${qNum}`;
    const existing = paperObj.questions.find(q => q.id === targetId);
    
    if (existing) {
      setQSection(existing.section);
      setQTopics(existing.topics);
      setIsEditing(true);
    }
  }, [qYear, qSeries, qTimezone, qPaper, qNum, appData]);

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    if (topicsList.includes(newTopic.trim())) {
      alert('Topic already exists!');
      return;
    }
    
    try {
      const dataRef = doc(db, 'trackerData', 'main');
      await setDoc(dataRef, {
        topics: [...topicsList, newTopic.trim()]
      }, { merge: true });
      setNewTopic('');
    } catch (err) {
      console.error("Error adding topic:", err);
      alert('Failed to save topic to Firebase.');
    }
  };

  const handleAddYear = async (e) => {
    e.preventDefault();
    const yearInt = parseInt(newYear);
    if (!yearInt) return;
    
    const exists = appData.find(y => y.year === yearInt);
    if (exists) {
      alert('Year already exists!');
      return;
    }

    const newYearData = {
      year: yearInt,
      seriesList: [
        {
          series: "May",
          timezones: [
            { timezone: "TZ1", papers: [{ paperName: "Paper 1", questions: [] }, { paperName: "Paper 2", questions: [] }, { paperName: "Paper 3", questions: [] }] },
            { timezone: "TZ2", papers: [{ paperName: "Paper 1", questions: [] }, { paperName: "Paper 2", questions: [] }, { paperName: "Paper 3", questions: [] }] },
          ],
        },
        {
          series: "November",
          timezones: [
            { timezone: "TZ0", papers: [{ paperName: "Paper 1", questions: [] }, { paperName: "Paper 2", questions: [] }, { paperName: "Paper 3", questions: [] }] },
          ],
        },
      ]
    };

    try {
      const dataRef = doc(db, 'trackerData', 'main');
      const updatedData = [newYearData, ...appData].sort((a,b) => b.year - a.year);
      await setDoc(dataRef, {
        appData: updatedData
      }, { merge: true });
      setNewYear('');
      if (!qYear) setQYear(yearInt);
    } catch (err) {
      console.error("Error adding year:", err);
      alert('Failed to save year to Firebase.');
    }
  };

  const handleDeleteTopic = async (topic) => {
    if (!window.confirm(`Delete topic "${topic}"? It will also be removed from all existing questions.`)) return;
    try {
      // Strip topic from every question in appData
      const newAppdata = JSON.parse(JSON.stringify(appData));
      for (const yearObj of newAppdata) {
        for (const seriesObj of yearObj.seriesList) {
          for (const tzObj of seriesObj.timezones) {
            for (const paperObj of tzObj.papers) {
              paperObj.questions = paperObj.questions.map(q => ({
                ...q,
                topics: q.topics.filter(t => t !== topic)
              }));
            }
          }
        }
      }

      const dataRef = doc(db, 'trackerData', 'main');
      await setDoc(dataRef, {
        topics: topicsList.filter(t => t !== topic),
        appData: newAppdata
      }, { merge: true });
    } catch (err) {
      console.error('Error deleting topic:', err);
      alert('Failed to delete topic.');
    }
  };

  const handleDeleteQuestion = async (e) => {
    e.preventDefault();
    if (!qYear || !qNum) {
      alert('Please select a year and enter a question number.');
      return;
    }

    const targetId = `${qYear}-${qSeries}-${qTimezone}-${qPaper.replace(' ', '')}-Q${qNum}`;
    if (!window.confirm(`Delete question ${targetId}? This cannot be undone.`)) return;

    const newAppdata = JSON.parse(JSON.stringify(appData));
    const yearObj = newAppdata.find(y => y.year.toString() === qYear.toString());
    if (!yearObj) return alert('Year not found');
    const seriesObj = yearObj.seriesList.find(s => s.series === qSeries);
    if (!seriesObj) return alert('Series not found');
    const tzObj = seriesObj.timezones.find(t => t.timezone === qTimezone);
    if (!tzObj) return alert('Timezone not found in series');
    const paperObj = tzObj.papers.find(p => p.paperName === qPaper);
    if (!paperObj) return alert('Paper not found');

    const before = paperObj.questions.length;
    paperObj.questions = paperObj.questions.filter(q => q.id !== targetId);
    if (paperObj.questions.length === before) {
      alert('Question not found — nothing was deleted.');
      return;
    }

    try {
      const dataRef = doc(db, 'trackerData', 'main');
      await setDoc(dataRef, { appData: newAppdata }, { merge: true });
      setQNum('');
      setQTopics([]);
      setIsEditing(false);
      alert(`Deleted Q${qNum} successfully!`);
    } catch (err) {
      console.error('Error deleting question:', err);
      alert('Failed to delete question.');
    }
  };

  const handleTopicToggle = (topic) => {
    if (qTopics.includes(topic)) {
      setQTopics(qTopics.filter(t => t !== topic));
    } else {
      setQTopics([...qTopics, topic]);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!qYear || !qNum || qTopics.length === 0) {
      alert('Please fill out all fields and select at least one topic.');
      return;
    }

    const newAppdata = JSON.parse(JSON.stringify(appData));
    
    // Find hierarchy
    const yearObj = newAppdata.find(y => y.year.toString() === qYear.toString());
    if (!yearObj) return alert("Year not found");

    const seriesObj = yearObj.seriesList.find(s => s.series === qSeries);
    if (!seriesObj) return alert("Series not found");

    const tzObj = seriesObj.timezones.find(t => t.timezone === qTimezone);
    if (!tzObj) return alert("Timezone not found in series");

    const paperObj = tzObj.papers.find(p => p.paperName === qPaper);
    if (!paperObj) return alert("Paper not found");

    const newQ = {
      id: `${qYear}-${qSeries}-${qTimezone}-${qPaper.replace(" ", "")}-Q${qNum}`,
      number: parseInt(qNum),
      section: qSection,
      topics: qTopics,
      metadata: {
        year: parseInt(qYear),
        series: qSeries,
        timezone: qTimezone,
        paperName: qPaper
      }
    };

    // Update or Insert
    const existingIndex = paperObj.questions.findIndex(q => q.id === newQ.id);
    if (existingIndex !== -1) {
      paperObj.questions[existingIndex] = newQ;
    } else {
      paperObj.questions.push(newQ);
      paperObj.questions.sort((a, b) => a.number - b.number);
    }

    try {
      const dataRef = doc(db, 'trackerData', 'main');
      await setDoc(dataRef, {
        appData: newAppdata
      }, { merge: true });
      
      setQNum('');
      setQTopics([]);
      setIsEditing(false);
      alert(existingIndex !== -1 ? `Updated Q${newQ.number} successfully!` : `Added Q${newQ.number} successfully!`);
    } catch (err) {
      console.error("Error saving question:", err);
      alert("Failed to save question to Firebase.");
    }
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkJson.trim()) return;
    
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("Input must be a JSON array.");

      let newAppdata = JSON.parse(JSON.stringify(appData));

      for (const q of parsed) {
        let yearObj = newAppdata.find(y => y.year === parseInt(q.year));
        if (!yearObj) continue;
        let seriesObj = yearObj.seriesList.find(s => s.series === q.series);
        if (!seriesObj) continue;
        let tzObj = seriesObj.timezones.find(t => t.timezone === q.timezone);
        if (!tzObj) continue;
        let paperObj = tzObj.papers.find(p => p.paperName === q.paperName);
        if (!paperObj) continue;

        const newQ = {
          id: `${q.year}-${q.series}-${q.timezone}-${q.paperName.replace(" ", "")}-Q${q.number}`,
          number: parseInt(q.number),
          section: q.section || "N/A",
          topics: q.topics || [],
          metadata: { year: parseInt(q.year), series: q.series, timezone: q.timezone, paperName: q.paperName }
        };

        const existingIndex = paperObj.questions.findIndex(eq => eq.id === newQ.id);
        if (existingIndex !== -1) {
          paperObj.questions[existingIndex] = newQ;
        } else {
          paperObj.questions.push(newQ);
        }
        paperObj.questions.sort((a, b) => a.number - b.number);
      }

      const dataRef = doc(db, 'trackerData', 'main');
      await setDoc(dataRef, { appData: newAppdata }, { merge: true });
      
      setBulkJson('');
      alert(`Bulk import successful! Processed ${parsed.length} questions.`);
    } catch (err) {
      console.error(err);
      alert("Failed to import: " + err.message);
    }
  };

  return (
    <div className="admin-view">
      <h2>Admin Panel</h2>
      <p className="admin-desc">Manage your tracking data directly. Changes are automatically synced to the cloud.</p>

      <div className="admin-grid">
        <div className="admin-card glass-panel">
          <h3>1. Add Topic</h3>
          <form onSubmit={handleAddTopic} className="admin-form">
            <input 
              type="text" 
              placeholder="e.g. Matrices" 
              value={newTopic} 
              onChange={e => setNewTopic(e.target.value)} 
              className="admin-input"
            />
            <button type="submit" className="admin-btn">Add Topic</button>
          </form>
          <div className="current-topics">
            {topicsList.map(t => (
              <span key={t} className="topic-badge">
                {t}
                <button
                  className="topic-badge-delete"
                  onClick={() => handleDeleteTopic(t)}
                  title={`Delete "${t}"`}
                  type="button"
                >×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="admin-card glass-panel">
          <h3>2. Add Year</h3>
          <form onSubmit={handleAddYear} className="admin-form">
            <input 
              type="number" 
              placeholder="e.g. 2024" 
              value={newYear} 
              onChange={e => setNewYear(e.target.value)} 
              className="admin-input"
            />
            <button type="submit" className="admin-btn">Initialize Year</button>
          </form>
        </div>

        <div className="admin-card glass-panel full-width">
          <h3>3. Add / Edit Question</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Enter a Question Number. If it already exists, its details will load automatically so you can edit them.
          </p>
          <form onSubmit={handleAddQuestion} className="question-form">
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <select value={qYear} onChange={e => setQYear(e.target.value)} className="admin-input">
                  {appData.map(y => <option key={y.year} value={y.year}>{y.year}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Series</label>
                <select value={qSeries} onChange={e => {
                  const newSeries = e.target.value;
                  setQSeries(newSeries);
                  setQTimezone(newSeries === 'November' ? 'TZ0' : 'TZ1');
                }} className="admin-input">
                  <option value="May">May</option>
                  <option value="November">November</option>
                </select>
              </div>
              <div className="form-group">
                <label>Timezone</label>
                <select value={qTimezone} onChange={e => setQTimezone(e.target.value)} className="admin-input">
                  {qSeries === 'May' ? (
                    <>
                      <option value="TZ1">TZ1</option>
                      <option value="TZ2">TZ2</option>
                    </>
                  ) : (
                    <option value="TZ0">TZ0</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Paper</label>
                <select value={qPaper} onChange={e => setQPaper(e.target.value)} className="admin-input">
                  <option value="Paper 1">Paper 1</option>
                  <option value="Paper 2">Paper 2</option>
                  <option value="Paper 3">Paper 3</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Question Number</label>
                <input type="number" value={qNum} onChange={e => setQNum(e.target.value)} className="admin-input" min="1" required />
              </div>
              <div className="form-group">
                <label>Section</label>
                <select value={qSection} onChange={e => setQSection(e.target.value)} className="admin-input">
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="N/A">N/A (e.g. Paper 3)</option>
                </select>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Select Topics</label>
              <div className="topic-selector">
                {topicsList.map(t => (
                  <label key={t} className={`topic-checkbox ${qTopics.includes(t) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={qTopics.includes(t)} 
                      onChange={() => handleTopicToggle(t)} 
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-btn-row">
              <button type="submit" className="admin-btn add-q-btn">
                {isEditing ? 'Update Question' : 'Save Question'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="admin-btn delete-q-btn"
                  onClick={handleDeleteQuestion}
                >
                  Delete Question
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
