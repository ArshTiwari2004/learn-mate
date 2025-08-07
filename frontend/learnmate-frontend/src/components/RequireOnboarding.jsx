import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const RequireOnboarding = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isLoaded || !user) return;

      const userRef = doc(db, 'users', user.id);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || !userSnap.data().onboarded) {
        navigate('/onboarding');
      } else {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [isLoaded, user, navigate]);

  if (loading) return <div className="p-6">Loading...</div>;

  return children;
};

export default RequireOnboarding;
