import React, { useState,useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input'; 
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstances';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-hot-toast';

const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState(null);
  const {updateUser} = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault()
    if(!validateEmail(email)){
      seterror("Please enter a valid email address")
      toast.error('Please enter a valid email address')
      return;
    }
    if(!password){
      seterror("please enter the password");
      toast.error('Please enter your password')
      return;
    }
    seterror("");

    //Login api call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
  email,
  password,
});

const { token } = response.data;

if (token) {
  localStorage.setItem("token", token);
  await updateUser(token);
  toast.success('Logged in successfully')
  navigate("/dashboard");
}
    } catch (error) {
      if(error.response && error.response.data.message){
        seterror(error.response.data.message)
        toast.error(error.response.data.message)
      }else{
        seterror("Something went wrong. Please try again");
        toast.error('Something went wrong. Please try again')
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="w-[90vw] md:w-[33vw] p-8 flex flex-col justify-center bg-white rounded-2xl shadow-2xl">
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
            onChange={({ target }) => setpassword(target.value)}
            label="Password"
            placeholder="Min 8 characters"
            type="password"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
          >
            LOGIN
          </button>

          <p className="text-sm text-center mt-6 text-gray-700">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline font-medium"
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
