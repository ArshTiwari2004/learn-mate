import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "../firebase"; 
import axios from 'axios';

const AskQuestions = () => {
  // Form state
  const [query, setQuery] = useState('');
  const [studentId, setStudentId] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [selectedBook, setSelectedBook] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Fetch available books from Firestore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'books'));
        const booksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (err) {
        console.error('Error fetching books from Firestore:', err);
        setError('Failed to load available books');
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  // Filter books based on selected class and subject
  useEffect(() => {
    const filtered = books.filter(book => {
      const classMatch = !selectedClass || book.class == selectedClass; // == to allow string/number match
      const subjectMatch = !selectedSubject || book.subject === selectedSubject;
      return classMatch && subjectMatch;
    });
    setFilteredBooks(filtered);
  }, [selectedClass, selectedSubject, books]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    if (!selectedBook) {
      setError('Please select a book first');
      setLoading(false);
      return;
    }

    console.log('Submitting query:', {
      query,
      student_id: studentId,
      difficulty,
      learning_style: learningStyle,
      book_path: selectedBook.path
    });

    try {
      const res = await axios.post('http://localhost:8001/api/v1/ask', {
        query,
        student_id: studentId,
        difficulty,
        learning_style: learningStyle,
        book_path: selectedBook.path
      });

      console.log('Response from backend:', res.data);
      setResponse(res.data);
    } catch (err) {
      console.error('Full error object:', err);

      if (err.response) {
        const status = err.response.status;
        const detail = err.response.data?.detail;

        console.error(`Error from backend ${status}:`, detail);

        if (status === 404) {
          setError('No relevant content found for your query in the selected book.');
        } else if (status === 422) {
          setError('Invalid input. Please fill all fields correctly.');
        } else if (status === 500) {
          setError('Server error: ' + detail);
        } else {
          setError('Unexpected error: ' + detail);
        }
      } else {
        setError('Network error or server is unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Get unique classes and subjects for filters
  const uniqueClasses = [...new Set(books.map(b => b.class))].sort();
  const uniqueSubjects = [...new Set(books.map(b => b.subject))].sort();

  console.log("subjects available:", uniqueSubjects);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-6">AI Textbook Tutor</h1>
      
      {/* Book Selection Section */}
      <div className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-bold mb-4">1. Select Your Textbook</h2>
        
        {loadingBooks ? (
          <div className="text-center py-4">Loading books...</div>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block font-medium mb-1">Filter by Class:</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex-1">
                <label className="block font-medium mb-1">Filter by Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map(book => (
                <div
                  key={book.id}
                  className={`p-4 border rounded cursor-pointer transition-colors ${
                    selectedBook?.path === book.path 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedBook(book)}
                >
                  {book.imageUrl && (
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="w-full h-40 object-contain mb-3 rounded"
                    />
                  )}
                  <h3 className="font-bold">{book.title}</h3>
                  <p className="text-sm text-gray-600">Subject: {book.subject}</p>
                  <p className="text-sm text-gray-600">Class: {book.class}</p>
                </div>
              ))}
            </div>
            
            {filteredBooks.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                No books match your filters
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Question Form Section */}
      <div className={`p-4 border rounded ${!selectedBook ? 'opacity-50' : ''}`}>
        <h2 className="text-xl font-bold mb-4">2. Ask Your Question</h2>
        
        {selectedBook && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="font-medium">Selected Book:</p>
            <p>{selectedBook.title} (Class {selectedBook.class}, {selectedBook.subject})</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Your Question:</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border rounded px-3 py-2 min-h-[100px]"
              required
              disabled={!selectedBook || loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium">Student ID:</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                disabled={!selectedBook || loading}
              />
            </div>

            <div>
              <label className="block font-medium">Difficulty Level:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={!selectedBook || loading}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block font-medium">Learning Style:</label>
              <select
                value={learningStyle}
                onChange={(e) => setLearningStyle(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={!selectedBook || loading}
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedBook || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Asking...' : 'Ask Question'}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 text-red-700 bg-red-100 rounded">
            {error}
          </div>
        )}

        {/* Success response */}
        {response && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 rounded border border-green-200">
              <h3 className="font-bold text-lg mb-2">Answer:</h3>
              <div className="whitespace-pre-wrap">{response.answer}</div>
            </div>

            {response.sources?.length > 0 && (
              <div className="p-4 bg-gray-50 rounded border border-gray-200">
                <h3 className="font-bold text-lg mb-2">Sources:</h3>
                <ul className="space-y-3">
                  {response.sources.map((src, idx) => (
                    <li key={idx} className="border-b pb-3 last:border-0">
                      <p>
                        <span className="font-medium">Chapter:</span> {src.chapter || 'N/A'}, 
                        <span className="font-medium ml-2">Page:</span> {src.page || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Excerpt:</span> {src.excerpt}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">Confidence:</span> 
                        <span className={`ml-1 ${
                          src.confidence > 0.7 ? 'text-green-600' : 
                          src.confidence > 0.4 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(src.confidence * 100).toFixed(1)}%
                        </span>
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AskQuestions;
