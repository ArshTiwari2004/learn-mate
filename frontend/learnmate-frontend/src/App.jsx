import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import UploadTest from './pages/UploadTest';
import AskQuestions from './pages/AskQuestions';
import StudyScheduleGenerator from './pages/Generateschedule';
import AddContent from './pages/AddContent';
import PracticeQuestion from './pages/PracticeQuestion';
import SearchContent from './pages/SearchContent';
import Analytics from './pages/Analytics';

import { ApiProvider } from './context/ApiContext';

const App = () => {
  return (
    <ApiProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload-test" element={<UploadTest />} />
            <Route path="/ask-questions" element={<AskQuestions />} />
            <Route path="/generate-schedule" element={<StudyScheduleGenerator />} />
            <Route path="/add-content" element={<AddContent />} />
            <Route path="/practice-questions" element={<PracticeQuestion />} />
            <Route path="/search-content" element={<SearchContent />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </Router>
    </ApiProvider>
  );
};

export default App;
