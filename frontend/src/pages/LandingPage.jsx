import React, { useState, useContext } from 'react';
import { APP_FEATURES } from '../utils/data';
import HERO_IMG from '../assets/hero-img.png';
import { useNavigate } from 'react-router-dom';
import Login from './Auth/Login';
import { UserContext } from '../context/userContext';
import ProfileInfoCard from '../components/Cards/ProfileInfoCard';
import interprep from '../assets/logo.svg';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [openAuthModal, setOpenAuthModal] = useState(false);

  const handleCTA = () => {
    if (!user) {
      setOpenAuthModal(true);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <>
      <div className="font-sans">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-4 fixed w-full z-10 bg-transparent">
          <div className="text-xl font-semibold text-gray-900">   <img
                      src={interprep}
                      alt="InterPrep Logo"
                      className="h-20 md:h-20 w-auto hover:scale-105 transition-transform duration-200"
                    /></div>
          {user ? (
            <ProfileInfoCard />
          ) : (
            <button
              onClick={() => setOpenAuthModal(true)}
              className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition duration-200"
            >
              Login / Sign Up
            </button>
          )}
        </header>

        {/* Hero Section */}
        <section className="pt-28 pb-20 bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-block mb-3 px-3 py-1 bg-yellow-200 text-orange-500 text-sm rounded-full font-medium">
              AI Powered
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Ace Interviews with <span className="text-orange-500">AI-Powered</span> Learning
            </h1>
            <p className="text-gray-700 max-w-xl mx-auto mb-6">
              Get role-specific questions, expand answers when you need them, dive deeper into concepts, and organize everything your way. From preparation to mastery — your ultimate interview toolkit is here.
            </p>
            <button
              onClick={handleCTA}
              className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition duration-200"
            >
              Get Started
            </button>

            {/* Hero Image */}
            <div className="mt-10 flex justify-center">
              <img
                src={HERO_IMG}
                alt="Hero"
                className="w-full max-w-5xl rounded-lg shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Features that make you shine
            </h2>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {APP_FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="p-6 border rounded-xl hover:shadow-lg transition bg-gray-50"
                >
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 bg-gray-50 text-center text-gray-700">
          Made with ❤️ by Surbhi | Happy Coding
        </footer>
      </div>

      {/* Auth Modal */}
      {openAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90vw] md:w-[40vw] relative">
            <button
              onClick={() => setOpenAuthModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <Login setCurrentPage={() => {}} />
          </div>
        </div>
      )}
    </>
  );
};

export default LandingPage;
