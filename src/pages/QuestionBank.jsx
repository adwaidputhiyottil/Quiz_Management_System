import React, { useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Download, Upload, Search, Edit2, Trash2, 
  Copy, X, Eye, ChevronUp, ChevronDown, FileText, FileSpreadsheet
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import './QuestionBank.css';

const QuestionPreviewModal = ({ isOpen, onClose, question }) => {
  if (!isOpen || !question) return null;

  return (
    <div className="modal-overlay">
      <div className="preview-modal-content">
        <div className="modal-header">
          <h2>Preview Question</h2>
          <button type="button" className="btn-icon-small" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="preview-body" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <span className="badge">{question.category}</span>
            <span className={`badge difficulty-${question.difficulty?.toLowerCase()}`}>{question.difficulty}</span>
            <span className="badge" style={{ background: 'var(--bg-card)' }}>{question.questionType}</span>
          </div>
          
          <div className="preview-question-text">{question.text}</div>
          
          {question.code && (
            <div className="preview-question-code">
              <pre>{question.code}</pre>
            </div>
          )}
          
          {question.options && Object.keys(question.options).length > 0 && question.questionType !== 'Guess Output' && (
            <div className="preview-options">
              {['A', 'B', 'C', 'D'].map(letter => {
                const optionText = question.options[letter];
                if (!optionText) return null;
                
                const isCorrect = question.correctAnswer === letter;
                
                return (
                  <div key={letter} className={`preview-option ${isCorrect ? 'correct' : ''}`}>
                    <div className="preview-option-letter">{letter}</div>
                    <div className="preview-option-text">{optionText}</div>
                  </div>
                );
              })}
            </div>
          )}
          
          {question.explanation && (
            <div className="preview-explanation">
              <strong>Explanation:</strong> {question.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionModal = ({ isOpen, onClose, onSave, editingQuestion }) => {
  const [formData, setFormData] = useState({
    text: '', code: '',
    questionType: 'Multiple Choice',
    optionA: '', optionB: '', optionC: '', optionD: '',
    correctAnswer: 'A', explanation: '',
    category: 'Python Basics', difficulty: 'Medium', roundNumber: 1
  });
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      if (editingQuestion) {
        setFormData({
          text: editingQuestion.text || '', 
          code: editingQuestion.code || '',
          questionType: editingQuestion.questionType || 'Multiple Choice',
          optionA: editingQuestion.options?.A || '', 
          optionB: editingQuestion.options?.B || '',
          optionC: editingQuestion.options?.C || '', 
          optionD: editingQuestion.options?.D || '',
          correctAnswer: editingQuestion.correctAnswer || 'A',
          explanation: editingQuestion.explanation || '',
          category: editingQuestion.category || 'Python Basics',
          difficulty: editingQuestion.difficulty || 'Medium',
          roundNumber: editingQuestion.roundNumber || 1
        });
      } else {
        setFormData({
          text: '', code: '',
          questionType: 'Multiple Choice',
          optionA: '', optionB: '', optionC: '', optionD: '',
          correctAnswer: 'A', explanation: '',
          category: 'Python Basics', difficulty: 'Medium', roundNumber: 1
        });
      }
      setError('');
    }
  }, [isOpen, editingQuestion]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      
      // Auto-adjust fields based on Question Type change
      if (name === 'questionType') {
        if (value === 'True / False') {
          next.optionA = 'True';
          next.optionB = 'False';
          next.optionC = '';
          next.optionD = '';
          if (next.correctAnswer !== 'A' && next.correctAnswer !== 'B') next.correctAnswer = 'A';
        } else if (value === 'Guess Output') {
          next.optionA = ''; next.optionB = ''; next.optionC = ''; next.optionD = '';
          next.correctAnswer = 'A'; // Usually there are no visible options, just the answer, but we map to A.
        }
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      setError('Question text is required.');
      return;
    }
    
    let opts = {
      A: formData.optionA.trim(),
      B: formData.optionB.trim(),
      C: formData.optionC.trim(),
      D: formData.optionD.trim(),
    };

    if (formData.questionType === 'Guess Output') {
      opts = { A: formData.optionA.trim() }; // Option A acts as the output string if needed, or we just rely on explanation
    }

    const newQuestion = {
      text: formData.text.trim(),
      code: formData.code.trim(),
      questionType: formData.questionType,
      options: opts,
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      roundNumber: parseInt(formData.roundNumber, 10) || 1
    };

    onSave(newQuestion);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="qb-modal-content">
        <div className="modal-header">
          <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
          <button type="button" className="btn-icon-small" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="qb-form-grid">
          
          <div className="form-group qb-full-width">
            <label>Question Type</label>
            <select name="questionType" className="form-input" value={formData.questionType} onChange={handleChange}>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True / False">True / False</option>
              <option value="Guess Output">Guess Output</option>
            </select>
          </div>

          <div className="form-group qb-full-width">
            <label>Question Text *</label>
            <textarea 
              name="text" className="form-input" required 
              value={formData.text} onChange={handleChange} 
              placeholder="What does this python code do?"
            />
          </div>
          
          <div className="form-group qb-full-width">
            <label>Python Code (Optional)</label>
            <textarea 
              name="code" className="form-input code-input" 
              value={formData.code} onChange={handleChange} 
              placeholder="print('Hello World')"
            />
          </div>
          
          {formData.questionType === 'Multiple Choice' && (
            <div className="form-group qb-full-width">
              <label>Options</label>
              <div className="options-grid">
                <div className="option-input-group">
                  <span className="option-label">A</span>
                  <input type="text" name="optionA" className="form-input" value={formData.optionA} onChange={handleChange} />
                </div>
                <div className="option-input-group">
                  <span className="option-label">B</span>
                  <input type="text" name="optionB" className="form-input" value={formData.optionB} onChange={handleChange} />
                </div>
                <div className="option-input-group">
                  <span className="option-label">C</span>
                  <input type="text" name="optionC" className="form-input" value={formData.optionC} onChange={handleChange} />
                </div>
                <div className="option-input-group">
                  <span className="option-label">D</span>
                  <input type="text" name="optionD" className="form-input" value={formData.optionD} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {formData.questionType === 'True / False' && (
            <div className="form-group qb-full-width">
              <label>Options (Locked)</label>
              <div className="options-grid">
                <div className="option-input-group">
                  <span className="option-label">A</span>
                  <input type="text" className="form-input" value="True" disabled />
                </div>
                <div className="option-input-group">
                  <span className="option-label">B</span>
                  <input type="text" className="form-input" value="False" disabled />
                </div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Correct Answer *</label>
            <select name="correctAnswer" className="form-input" value={formData.correctAnswer} onChange={handleChange}>
              <option value="A">A {formData.questionType === 'True / False' && '(True)'}</option>
              {formData.questionType !== 'Guess Output' && <option value="B">B {formData.questionType === 'True / False' && '(False)'}</option>}
              {formData.questionType === 'Multiple Choice' && <option value="C">C</option>}
              {formData.questionType === 'Multiple Choice' && <option value="D">D</option>}
            </select>
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select name="category" className="form-input" value={formData.category} onChange={handleChange}>
              <option value="Python Basics">Python Basics</option>
              <option value="Variables">Variables</option>
              <option value="Data Types">Data Types</option>
              <option value="Operators">Operators</option>
              <option value="Conditions">Conditions</option>
              <option value="Loops">Loops</option>
              <option value="Functions">Functions</option>
              <option value="Guess Output">Guess Output</option>
              <option value="True / False">True / False</option>
            </select>
          </div>

          <div className="form-group">
            <label>Difficulty</label>
            <select name="difficulty" className="form-input" value={formData.difficulty} onChange={handleChange}>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Round Number</label>
            <input type="number" min="1" name="roundNumber" className="form-input" value={formData.roundNumber} onChange={handleChange} />
          </div>

          <div className="form-group qb-full-width">
            <label>Explanation (Optional)</label>
            <textarea name="explanation" className="form-input" value={formData.explanation} onChange={handleChange} />
          </div>

          {error && <span className="error-message qb-full-width">{error}</span>}
          
          <div className="modal-actions qb-full-width" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingQuestion ? 'Save Changes' : 'Add Question'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Simple CSV parser
const parseCSV = (text) => {
  const result = [];
  let row = [];
  let inQuotes = false;
  let currentVal = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal);
      currentVal = '';
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      if (char === '\r') i++;
      row.push(currentVal);
      result.push(row);
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || row.length > 0) {
    row.push(currentVal);
    result.push(row);
  }
  return result;
};

const escapeCsv = (str) => {
  if (str === null || str === undefined) return '';
  const text = String(str);
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const QuestionBank = () => {
  const { state, actions } = useQuiz();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [filterRound, setFilterRound] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [sortField, setSortField] = useState('number'); // 'number', 'difficulty', 'round', 'category'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState(null);

  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const fileInputRef = useRef(null);

  // Memoized Filtering and Sorting
  const filteredAndSortedQuestions = useMemo(() => {
    let result = state.questions.filter(q => {
      const matchesSearch = q.text?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = filterCategory === 'all' || q.category === filterCategory;
      const matchesDiff = filterDifficulty === 'all' || q.difficulty === filterDifficulty;
      const matchesRound = filterRound === 'all' || q.roundNumber.toString() === filterRound;
      const matchesType = filterType === 'all' || q.questionType === filterType;
      return matchesSearch && matchesCat && matchesDiff && matchesRound && matchesType;
    });

    result.sort((a, b) => {
      let valA, valB;
      
      switch (sortField) {
        case 'difficulty':
          const diffMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          valA = diffMap[a.difficulty] || 0;
          valB = diffMap[b.difficulty] || 0;
          break;
        case 'round':
          valA = a.roundNumber;
          valB = b.roundNumber;
          break;
        case 'category':
          valA = a.category?.toLowerCase() || '';
          valB = b.category?.toLowerCase() || '';
          break;
        case 'number':
        default:
          valA = state.questions.findIndex(q => q.id === a.id);
          valB = state.questions.findIndex(q => q.id === b.id);
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [state.questions, searchTerm, filterCategory, filterDifficulty, filterRound, filterType, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleAddClick = () => {
    setEditingQuestion(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (q) => {
    setEditingQuestion(q);
    setIsModalOpen(true);
  };

  const handlePreviewClick = (q) => {
    setPreviewingQuestion(q);
    setIsPreviewOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      actions.removeQuestion(id);
      setSelectedQuestions(prev => prev.filter(qId => qId !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedQuestions.length} selected question(s)?`)) {
      actions.removeMultipleQuestions(selectedQuestions);
      setSelectedQuestions([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedQuestions(filteredAndSortedQuestions.map(q => q.id));
    } else {
      setSelectedQuestions([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedQuestions(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleSaveQuestion = (qData) => {
    if (editingQuestion) {
      actions.updateQuestion(editingQuestion.id, qData);
    } else {
      actions.addQuestion(qData);
    }
  };

  const handleExport = (format) => {
    if (format === 'json') {
      const dataStr = JSON.stringify(state.questions, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      downloadBlob(blob, 'question_bank.json');
    } else if (format === 'csv') {
      const headers = ['Question Text', 'Python Code', 'Question Type', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Explanation', 'Category', 'Difficulty', 'Round'];
      const rows = state.questions.map(q => [
        escapeCsv(q.text), escapeCsv(q.code), escapeCsv(q.questionType),
        escapeCsv(q.options?.A), escapeCsv(q.options?.B), escapeCsv(q.options?.C), escapeCsv(q.options?.D),
        escapeCsv(q.correctAnswer), escapeCsv(q.explanation),
        escapeCsv(q.category), escapeCsv(q.difficulty), escapeCsv(q.roundNumber)
      ].join(','));
      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, 'question_bank.csv');
    }
  };

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const extension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        let finalQuestions = [];
        
        if (extension === 'json') {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            finalQuestions = imported;
          } else if (imported && Array.isArray(imported.questions)) {
            finalQuestions = imported.questions;
          } else {
            throw new Error('Invalid JSON structure. Expected array or { "questions": [] }');
          }
        } else if (extension === 'csv') {
          const parsed = parseCSV(event.target.result);
          if (parsed.length < 2) throw new Error('CSV is empty or missing headers');
          
          const headers = parsed[0].map(h => h?.trim().toLowerCase());
          
          const findCol = (possibleNames) => {
            return headers.findIndex(h => possibleNames.some(name => h && h.includes(name)));
          };
          
          const textIdx = findCol(['question text', 'question', 'text']);
          const codeIdx = findCol(['python code', 'code']);
          const typeIdx = findCol(['question type', 'type']);
          const optionAIdx = findCol(['option a', 'opt a']);
          const optionBIdx = findCol(['option b', 'opt b']);
          const optionCIdx = findCol(['option c', 'opt c']);
          const optionDIdx = findCol(['option d', 'opt d']);
          const answerIdx = findCol(['correct answer', 'answer', 'correct']);
          const expIdx = findCol(['explanation', 'exp']);
          const catIdx = findCol(['category']);
          const diffIdx = findCol(['difficulty']);
          const roundIdx = findCol(['round']);

          const dataRows = parsed.slice(1);
          finalQuestions = dataRows.filter(r => r.length > 0 && r.some(c => c && c.trim() !== '')).map((row, index) => {
            let roundValue = 1;
            
            if (roundIdx !== -1) {
              const rawRound = row[roundIdx]?.trim();
              if (!rawRound) {
                throw new Error(`Row ${index + 2}: Round value cannot be empty.`);
              }
              const parsedRound = Number(rawRound);
              if (isNaN(parsedRound)) {
                throw new Error(`Row ${index + 2}: Invalid round value "${rawRound}". Round must be a valid number.`);
              }
              roundValue = parsedRound;
            }

            return {
              id: crypto.randomUUID(),
              text: textIdx !== -1 ? (row[textIdx] || '') : (row[0] || ''),
              code: codeIdx !== -1 ? (row[codeIdx] || '') : (row[1] || ''),
              questionType: typeIdx !== -1 ? (row[typeIdx] || 'Multiple Choice') : (row[2] || 'Multiple Choice'),
              options: {
                A: optionAIdx !== -1 ? (row[optionAIdx] || '') : (row[3] || ''),
                B: optionBIdx !== -1 ? (row[optionBIdx] || '') : (row[4] || ''),
                C: optionCIdx !== -1 ? (row[optionCIdx] || '') : (row[5] || ''),
                D: optionDIdx !== -1 ? (row[optionDIdx] || '') : (row[6] || '')
              },
              correctAnswer: answerIdx !== -1 ? (row[answerIdx] || 'A') : (row[7] || 'A'),
              explanation: expIdx !== -1 ? (row[expIdx] || '') : (row[8] || ''),
              category: catIdx !== -1 ? (row[catIdx] || 'Python Basics') : (row[9] || 'Python Basics'),
              difficulty: diffIdx !== -1 ? (row[diffIdx] || 'Medium') : (row[10] || 'Medium'),
              roundNumber: roundValue
            };
          });
        } else {
          throw new Error('Unsupported file format. Please upload .json or .csv');
        }

        if (finalQuestions && finalQuestions.length >= 0) {
          actions.setQuestions(finalQuestions);
          alert(`Imported ${finalQuestions.length} questions successfully!`);
        }
      } catch (err) {
        console.error('Import error:', err);
        alert(err.message || 'Error processing file. Please check the format.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return (
    <div className="bank-container page-container">
      <header className="bank-header glass-panel">
        <div className="header-left">
          <Link to="/" className="btn btn-secondary btn-icon">
            <ArrowLeft size={20} /> Back
          </Link>
          <h1>Question Bank</h1>
        </div>
        <div className="header-actions">
          <input 
            type="file" accept=".json,.csv" 
            ref={fileInputRef} className="file-input-hidden" 
            onChange={handleImportFile} 
          />
          <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} /> Import
          </button>
          
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className="btn btn-secondary" onClick={() => handleExport('json')} title="Export JSON">
              <FileText size={18} /> JSON
            </button>
            <button className="btn btn-secondary" onClick={() => handleExport('csv')} title="Export CSV">
              <FileSpreadsheet size={18} /> CSV
            </button>
          </div>
          
          {selectedQuestions.length > 0 && (
            <button className="btn btn-primary" style={{ background: 'var(--crimson)', borderColor: 'var(--crimson)' }} onClick={handleBulkDelete}>
              <Trash2 size={18} /> Delete Selected ({selectedQuestions.length})
            </button>
          )}

          <button className="btn btn-primary" onClick={handleAddClick}>
            <Plus size={18} /> New Question
          </button>
        </div>
      </header>

      <main className="bank-main glass-panel">
        <div className="bank-toolbar">
          <div className="search-bar">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filters">
            <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Multiple Choice">Multiple Choice</option>
              <option value="True / False">True / False</option>
              <option value="Guess Output">Guess Output</option>
            </select>
            <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Python Basics">Python Basics</option>
              <option value="Variables">Variables</option>
              <option value="Data Types">Data Types</option>
              <option value="Operators">Operators</option>
              <option value="Conditions">Conditions</option>
              <option value="Loops">Loops</option>
              <option value="Functions">Functions</option>
              <option value="Guess Output">Guess Output</option>
              <option value="True / False">True / False</option>
            </select>
            <select className="filter-select" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
            <select className="filter-select" value={filterRound} onChange={e => setFilterRound(e.target.value)}>
              <option value="all">All Rounds</option>
              {[1,2,3,4,5,6,7,8,9,10].map(r => (
                <option key={r} value={r.toString()}>Round {r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="questions-list">
          {filteredAndSortedQuestions.length === 0 ? (
            <div className="empty-state text-muted" style={{ textAlign: 'center', padding: '3rem 0' }}>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>No questions available</h2>
              <p>Add your first question to get started!</p>
            </div>
          ) : (
            <table className="questions-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      className="quiz-checkbox"
                      checked={filteredAndSortedQuestions.length > 0 && selectedQuestions.length === filteredAndSortedQuestions.length}
                      onChange={handleSelectAll}
                      title="Select All"
                    />
                  </th>
                  <th className="sortable-header" onClick={() => handleSort('number')}>
                    <span className="sortable-header-content"># <SortIcon field="number" /></span>
                  </th>
                  <th>Question Text</th>
                  <th>Type</th>
                  <th className="sortable-header" onClick={() => handleSort('category')}>
                    <span className="sortable-header-content">Category <SortIcon field="category" /></span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort('round')}>
                    <span className="sortable-header-content">Round <SortIcon field="round" /></span>
                  </th>
                  <th className="sortable-header" onClick={() => handleSort('difficulty')}>
                    <span className="sortable-header-content">Difficulty <SortIcon field="difficulty" /></span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedQuestions.map((q) => {
                  const idx = state.questions.findIndex(sq => sq.id === q.id) + 1;
                  const isSelected = selectedQuestions.includes(q.id);
                  return (
                    <tr key={q.id} className={isSelected ? 'selected-row' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          className="quiz-checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(q.id)}
                        />
                      </td>
                      <td>{idx}</td>
                      <td>{q.text.length > 50 ? q.text.substring(0, 50) + '...' : q.text}</td>
                      <td><span className="badge" style={{ background: 'var(--bg-card)' }}>{q.questionType || 'Multiple Choice'}</span></td>
                      <td><span className="badge">{q.category}</span></td>
                      <td>{q.roundNumber}</td>
                      <td>
                        <span className={`badge difficulty-${q.difficulty?.toLowerCase()}`}>{q.difficulty}</span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-icon-small" onClick={() => handlePreviewClick(q)} title="Preview"><Eye size={16}/></button>
                          <button className="btn-icon-small" onClick={() => handleEditClick(q)} title="Edit"><Edit2 size={16}/></button>
                          <button className="btn-icon-small" onClick={() => actions.duplicateQuestion(q.id)} title="Duplicate"><Copy size={16}/></button>
                          <button className="btn-icon-small danger" onClick={() => handleDeleteClick(q.id)} title="Delete"><Trash2 size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <QuestionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
      />
      
      <QuestionPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        question={previewingQuestion}
      />
    </div>
  );
};

export default QuestionBank;
