import React from 'react';
import { Routes, Route } from 'react-router-dom';

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

import {
  SignedIn,
  SignedOut,
  SignIn,
  RedirectToSignIn,
} from '@clerk/clerk-react';

const App = () => {
  return (
    <Routes>
      {/* Route for the sign-in form itself */}
      <Route path="/sign-in" element={<SignIn routing="path" path="/sign-in" />} />

      {/* Protect everything else */}
      <Route
        path="*"
        element={
          <>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
              <ApiProvider>
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
              </ApiProvider>
            </SignedIn>
          </>
        }
      />
    </Routes>
  );
};

export default App;
