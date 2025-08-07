// src/pages/Onboarding.jsx
import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const Onboarding = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    classLevel: '',
    stream: '',
    examTarget: '',
    subjects: [],
    board: '',
    learningStyle: '',
    difficultyLevel: '',
    learningGoal: '',
    customFields: {}
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedSubjects = checked
        ? [...prev.subjects, value]
        : prev.subjects.filter((s) => s !== value);
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', user.id), {
        ...formData,
        email: user?.primaryEmailAddress?.emailAddress || '',
        createdAt: new Date(),
        onboarded: true
      });
      navigate('/');
    } catch (err) {
      console.error('Onboarding error:', err);
    }
  };

  console.log('Current user:', user);
  console.log("data stored in firebase:", formData);

return (
  <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 text-gray-900 flex items-center justify-center px-4">
    <div className="w-full max-w-3xl rounded-2xl  p-8 sm:p-12  backdrop-blur-lg transition-all">
<h2 className="text-3xl sm:text-3xl font-bold text-center mb-8 tracking-tight text-gray-900 drop-shadow">
  Welcome, {user?.firstName}! Let's get you onboarded 👋
</h2>

      <p className="text-sm sm:text-lg  text-center mb-6 text-gray-700">
        The data you provide will help us tailor your learning experience. You can update it later in your profile settings.
      </p>
      <form onSubmit={handleSubmit} className="grid gap-8">

        {/* Full Name */}
        <div className="relative">
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder=" "
            autoComplete="off"
            className="block w-full appearance-none border border-gray-300 bg-white/60 rounded-lg px-4 pt-6 pb-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
          />
          <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none
            peer-placeholder-shown:top-4
            peer-placeholder-shown:text-base
            peer-focus:top-1.5
            peer-focus:text-xs
            peer-focus:text-blue-500
            text-xs">
            Full Name
          </label>
        </div>

        {/* Class & Stream */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="relative">
            <select
              name="classLevel"
              value={formData.classLevel}
              onChange={handleChange}
              required
              className="block w-full appearance-none border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
            >
              <option value="" disabled hidden />
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="Dropper">Dropper</option>
              <option value="2nd Dropper">2nd Dropper</option>
              <option value="Other">Other</option>
            </select>
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
              Class
            </label>
          </div>
          <div className="relative">
            <select
              name="stream"
              value={formData.stream}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
            >
              <option value="" disabled hidden />
              <option value="PCM">PCM</option>
              <option value="Biology">Biology</option>
              <option value="PCMB">PCMB</option>
              <option value="Other">Other</option>
            </select>
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
              Stream
            </label>
          </div>
        </div>

        {/* Exam Target */}
        <div className="relative">
          <select
            name="examTarget"
            value={formData.examTarget}
            onChange={handleChange}
            required
            className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
          >
            <option value="" disabled hidden />
            <option value="JEE">JEE</option>
            <option value="NEET">NEET</option>
            <option value="Boards">Boards</option>
            <option value="CUET">CUET</option>
            <option value="Other">Other</option>
          </select>
          <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
            Exam Target
          </label>
        </div>

        {/* Subjects */}
        <fieldset className="border border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50">
          <legend className="text-xs font-medium text-black/80 mb-1">Subjects</legend>
          <div className="grid grid-cols-2 gap-2">
            {['Physics', 'Chemistry', 'Maths', 'Biology'].map((subj) => (
              <label
                key={subj}
                className="flex items-center space-x-2 cursor-pointer py-2 px-2 rounded-lg transition-all hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  value={subj}
                  checked={formData.subjects.includes(subj)}
                  onChange={handleCheckboxChange}
                  className="accent-blue-600 cursor-pointer h-5 w-5"
                />
                <span className="text-sm">{subj}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Board & Learning Style */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="relative">
            <select
              name="board"
              value={formData.board}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
            >
              <option value="" disabled hidden />
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="State">State</option>
              <option value="Other">Other</option>
            </select>
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
              Board
            </label>
          </div>
          <div className="relative">
            <select
              name="learningStyle"
              value={formData.learningStyle}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
            >
              <option value="" disabled hidden />
              <option value="Textual">Textual</option>
              <option value="Diagrammatic">Diagrammatic</option>
              <option value="Summarised">Summarised</option>
            </select>
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
              Preferred Learning Style
            </label>
          </div>
        </div>

        {/* Difficulty Level & Learning Goal */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="relative">
            <select
              name="difficultyLevel"
              value={formData.difficultyLevel}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
            >
              <option value="" disabled hidden />
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
              Difficulty Level
            </label>
          </div>
          <div className="relative">
            <select
              name="learningGoal"
              value={formData.learningGoal}
              onChange={handleChange}
              required
              className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white/60 text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
            >
              <option value="" disabled hidden />
              <option value="Revision">Revision</option>
              <option value="New Topic">New Topic</option>
              <option value="Practice">Practice</option>
            </select>
            <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white/90 px-1 transition-all duration-200 select-none text-xs">
              Learning Goal
            </label>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 cursor-pointer tracking-wide text-lg"
        >
          Submit
        </button>
      </form>
    </div>
  </div>
);



};

export default Onboarding;
