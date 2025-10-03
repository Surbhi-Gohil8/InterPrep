import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input'; 
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstances';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-hot-toast';

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError("Please enter the password");
      toast.error('Please enter your password');
      return;
    }
    setError("");

    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        await updateUser(token);
        toast.success('Logged in successfully');
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again");
        toast.error('Something went wrong. Please try again');
      }
    }
  };

  return (
<div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-white to-orange-200">
  <div className="w-[90vw] md:w-[35vw] p-8 flex flex-col justify-center bg-white rounded-3xl shadow-2xl shadow-orange-300/40">
    <h3 className="text-2xl font-bold text-gray-800 text-center">Welcome Back 👋</h3>
    <p className="text-sm text-gray-600 mt-2 mb-8 text-center">
      Please enter your details to log in
    </p>

    <form onSubmit={handleLogin} className="flex flex-col gap-5">
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

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 transition duration-200 shadow-lg"
      >
        LOGIN
      </button>

      <p className="text-sm text-center mt-6 text-gray-700">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="text-orange-500 hover:underline font-medium"
          onClick={() => navigate("/signup")}
        >
          SIGNUP
        </button>
      </p>
    </form>
  </div>
</div>

  
  );
};

export default Login;
