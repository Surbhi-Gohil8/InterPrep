import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import uploadImage from '../../utils/uploadImage';
import axiosInstance from '../../utils/axiosInstances';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-hot-toast';

const SignUp = ({ setCurrentPage }) => {
  const { updateUser } = useContext(UserContext);
  const [profilePic, setProfilePic] = useState();
  const [profilePreview, setProfilePreview] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Validation
    if (!fullName) {
      setError("Please enter full name.");
      toast.error('Please enter full name')
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      toast.error('Please enter a valid email address')
      return;
    }
    if (!password) {
      setError("Please enter a valid password.");
      toast.error('Please enter a valid password')
      return;
    }

    setError("");
    setLoading(true);

    try {
      let profileImageUrl = "";

      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

          // API call to register
          const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
            name: fullName,
            email,
            password,
            profileImageUrl,
          });

          const { token } = response.data;
          if (token) {
            localStorage.setItem("token", token);
            await updateUser(token);
            toast.success('Account created successfully')
            navigate("/dashboard");
          }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        toast.error(err.response.data.message)
      } else {
        setError("Something went wrong. Please try again.");
        toast.error('Something went wrong. Please try again')
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-orange-200">
    <div className="w-[90vw] md:w-[33vw] p-8 flex flex-col justify-center bg-white rounded-2xl shadow-2xl">
      <h3 className="text-2xl font-bold text-gray-800 text-center">Create an Account</h3>
      <p className="text-sm text-gray-600 mt-2 mb-8 text-center">
        Join us today by entering your details below
      </p>
  
      <form onSubmit={handleSignUp} className="flex flex-col gap-5">
        <Input
          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
          label="Full Name"
          placeholder="John"
          type="text"
        />
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="john@example.com"
          type="text"
        />
        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
        />
        
        {/* Optional profile picture upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Picture (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setProfilePic(file);
              if (file) {
                const url = URL.createObjectURL(file);
                setProfilePreview(url);
              } else {
                setProfilePreview("");
              }
            }}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
          />
          {profilePreview && (
            <div className="mt-3 flex items-center gap-3">
              <img src={profilePreview} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
              <button
                type="button"
                onClick={() => {
                  setProfilePic(undefined);
                  setProfilePreview("");
                }}
                className="text-xs text-gray-600 underline"
              >
                Remove
              </button>
            </div>
          )}
        </div>
  
        {error && <p className="text-red-500 text-sm">{error}</p>}
  
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-400 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? "Signing Up..." : "SIGN UP"}
        </button>
  
        <p className="text-sm text-center mt-6 text-gray-700">
          Already have an account?{" "}
          <button
            type="button"
            className="text-orange-500 hover:underline font-medium"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  </div>
  
  );
};

export default SignUp;
