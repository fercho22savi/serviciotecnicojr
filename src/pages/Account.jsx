
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config'; // Adjust the import path as needed
import { doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to view your account information.</div>;
  }

  return (
    <div>
      <h1>Account Information</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Address:</strong> {user.address.street}, {user.address.city}, {user.address.zipCode}</p>
    </div>
  );
};

export default Account;
