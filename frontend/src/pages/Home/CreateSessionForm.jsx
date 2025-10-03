import React, { useState } from "react";
import SpinnerLoader from "../../components/Loader/SpinnerLoder";
import Input from "../../components/Inputs/Input";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATHS } from "../../utils/apiPaths";
import { toast } from 'react-hot-toast';

const CreateSessionForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    role: "",
    topicsToFocus: "",
    experience: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

const handleCreateSession = async (e) => {
  e.preventDefault();
  const { role, experience, topicsToFocus } = formData;

  if (!role || !experience || !topicsToFocus) {
    setError("Please fill all the required fields");
    toast.error('Please fill all the required fields')
    return;
  }

  setError("");
  setIsLoading(true);

  try {
    // 1️⃣ Generate questions using AI
    const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
      role,
      experience,
      topicsToFocus,
      numberOfQuestions: 10,
    });

    // Ensure correct format
    const generatedQuestions = aiResponse.data?.questions || [];

    // 2️⃣ Create session with generated questions
    const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
      ...formData,
      questions: generatedQuestions,
    });

    if (response.data?.session?._id) {
      onSuccess && onSuccess();
      toast.success('Session created successfully')
    }
  } catch (err) {
    console.error(err);

    if (err.code === "ECONNABORTED") {
      setError("Request timed out. Please try again.");
      toast.error('Request timed out. Please try again.')
    } else if (err.response?.data?.message) {
      setError(err.response.data.message);
      toast.error(err.response.data.message)
    } else {
      setError("Something went wrong. Please try again.");
      toast.error('Something went wrong. Please try again')
    }
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="w-[90vw] md:w-[30vw] p-3 flex flex-col justify-center">
      <h3 className="text-lg font-semibold text-black">
        Start a New Interview Journey
      </h3>
      <p className="text-xs text-slate-700 mt-[5px] mb-3">
        Fill out a few quick details and unlock your personalized interview prep session.
      </p>

      <form onSubmit={handleCreateSession} className="flex flex-col gap-3">
        <Input
          value={formData.role}
          onChange={({ target }) => handleChange("role", target.value)}
          label="Target Role"
          placeholder="e.g. Software Engineer"
          type="text"
        />
        <Input
          value={formData.topicsToFocus}
          onChange={({ target }) => handleChange("topicsToFocus", target.value)}
          label="Topics to Focus"
          placeholder="e.g. Data Structures, Algorithms"
          type="text"
        />
        <Input
          value={formData.experience}
          onChange={({ target }) => handleChange("experience", target.value)}
          label="Years of Experience"
          placeholder="e.g. 3"
          type="number"
        />
        <Input
          value={formData.description}
          onChange={({ target }) => handleChange("description", target.value)}
          label="Session Description"
          placeholder="e.g. I want to focus on system design interviews"
          type="text"
        />

        {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading && <SpinnerLoader />}
          Create Session
        </button>
      </form>
    </div>
  );
};

export default CreateSessionForm;
