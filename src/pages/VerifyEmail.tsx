import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const VerifyEmail: React.FC = () => {
  const { user, isEmailVerified } = useAuth();
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        setMessage('Verification email sent. Please check your inbox.');
      } catch (error) {
        setMessage('Error sending verification email. Please try again later.');
      }
    }
  };

  if (isEmailVerified) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
      <p className="mb-4">
        Please verify your email address to access all features. Check your inbox for a verification link.
      </p>
      <button
        onClick={handleResendVerification}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-300"
      >
        Resend Verification Email
      </button>
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default VerifyEmail;