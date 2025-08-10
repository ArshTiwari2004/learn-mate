import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Settings } from "lucide-react";


const Profile = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
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
    phoneNumber: '',
    address: '',
    parentEmail: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setFormData({
            fullName: data.fullName || '',
            classLevel: data.classLevel || '',
            stream: data.stream || '',
            examTarget: data.examTarget || '',
            subjects: data.subjects || [],
            board: data.board || '',
            learningStyle: data.learningStyle || '',
            difficultyLevel: data.difficultyLevel || '',
            learningGoal: data.learningGoal || '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || '',
            parentEmail: data.parentEmail || ''
          });
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const updatedSubjects = checked
        ? [...prev.subjects, value]
        : prev.subjects.filter(s => s !== value);
      return { ...prev, subjects: updatedSubjects };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', user.id), formData);
      setUserData(formData);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (!user || !userData) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="flex bg-white">
      {/* Sidebar */}
      <div className="p-6 ">
        <div className="flex items-center space-x-3 p-3 mb-6">
          <img 
            src={user.imageUrl} 
            alt="Profile" 
            className="w-10 h-10 rounded-full"
          />
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-500 truncate">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        
        <nav>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-lg mb-1 flex items-center ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
          <span className="mr-3">
  <User className="w-5 h-5" />
</span>
            My Profile
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center ${activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
             <span className="mr-3">
  <Settings className="w-5 h-5" />
</span>
            Settings
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'profile' ? (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Name</div>
                  <div className="font-medium">{userData.fullName || user.fullName}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Email</div>
                  <div>{user.primaryEmailAddress?.emailAddress}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Phone</div>
                  <div>{userData.phoneNumber || 'Not provided'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Address</div>
                  <div>{userData.address || 'Not provided'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Class</div>
                  <div>{userData.classLevel || 'Not provided'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Board</div>
                  <div>{userData.board || 'Not provided'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Stream</div>
                  <div>{userData.stream || 'Not provided'}</div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-24 text-gray-500">Exam Target</div>
                  <div>{userData.examTarget || 'Not provided'}</div>
                </div>
                
                {userData.subjects?.length > 0 && (
                  <div className="flex items-start">
                    <div className="w-24 text-gray-500">Subjects</div>
                    <div className="flex flex-wrap gap-2">
                      {userData.subjects.map(subj => (
                        <span key={subj} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder=" "
                      className="block w-full appearance-none border border-gray-300 bg-white rounded-lg px-4 pt-6 pb-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Full Name
                    </label>
                  </div>
                  
                  <div className="relative">
                    <input
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder=" "
                      className="block w-full appearance-none border border-gray-300 bg-white rounded-lg px-4 pt-6 pb-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Phone Number
                    </label>
                  </div>
                  
                  <div className="relative">
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder=" "
                      className="block w-full appearance-none border border-gray-300 bg-white rounded-lg px-4 pt-6 pb-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Address
                    </label>
                  </div>
                  
                  <div className="relative">
                    <input
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      placeholder=" "
                      className="block w-full appearance-none border border-gray-300 bg-white rounded-lg px-4 pt-6 pb-2 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    />
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Parent's Email
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="classLevel"
                      value={formData.classLevel}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    >
                      <option value="" disabled>Select Class</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                      <option value="Dropper">Dropper</option>
                      <option value="2nd Dropper">2nd Dropper</option>
                      <option value="Other">Other</option>
                    </select>
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Class
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="stream"
                      value={formData.stream}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    >
                      <option value="" disabled>Select Stream</option>
                      <option value="PCM">PCM</option>
                      <option value="Biology">Biology</option>
                      <option value="PCMB">PCMB</option>
                      <option value="Other">Other</option>
                    </select>
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Stream
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="examTarget"
                      value={formData.examTarget}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    >
                      <option value="" disabled>Select Exam Target</option>
                      <option value="JEE">JEE</option>
                      <option value="NEET">NEET</option>
                      <option value="Boards">Boards</option>
                      <option value="CUET">CUET</option>
                      <option value="Other">Other</option>
                    </select>
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Exam Target
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select
                      name="board"
                      value={formData.board}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-lg px-4 pt-6 pb-2 bg-white text-gray-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all text-base shadow-sm"
                    >
                      <option value="" disabled>Select Board</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State">State</option>
                      <option value="Other">Other</option>
                    </select>
                    <label className="pointer-events-none absolute left-4 top-3 text-gray-400 bg-white px-1 transition-all duration-200 select-none text-xs">
                      Board
                    </label>
                  </div>
                </div>
                
                <fieldset className="border border-gray-200 rounded-xl px-4 py-4 bg-gray-50">
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
              </form>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Account Settings</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-gray-500">Receive promotional emails</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Dark Mode</p>
                      <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Security</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Two-factor Authentication</p>
                      <p className="text-sm text-gray-500">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                      Enable
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  Log Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;