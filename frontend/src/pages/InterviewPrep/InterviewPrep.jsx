import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import moment from "moment";
import { AnimatePresence, motion } from "framer-motion";
import { LuCircleAlert, LuListCollapse } from "react-icons/lu";
import SpinnerLoader from "../../components/Loader/SpinnerLoder";
import { toast } from "react-hot-toast";
import RoleInfoHeader from "./components/RoleInfoHeader";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstances";
import { API_PATHS } from "../../utils/apiPaths";
import QuestionCard from "../../components/Cards/QuestionCard";
import Drawer from "../../components/Drawer";
import SkeletonLoader from "../../components/Loader/SkeletonLoader";
import AIResponsePreview from "./components/AIResponsePreview";

const InterviewPrep = () => {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [openLearnMoreDrawer, setOpenLearnMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);

  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if (response.data?.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to load session details')
    }
  };

  const generateConceptExplanation = async (question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        { question },
        { timeout: 120000 }
      );
      // backend returns { success, explanation }
      if (response.data) setExplanation(response.data?.explanation ?? null);
      toast.success('Explanation generated')
    } catch (error) {
      setExplanation(null);
      const isTimeout = error?.code === 'ECONNABORTED';
      setErrorMsg(
        isTimeout
          ? "Request timed out while generating explanation. Please try again."
          : "Failed to generate explanation. Try again later"
      );
      console.error("Error:", error);
      toast.error(isTimeout ? 'Explanation request timed out' : 'Failed to generate explanation')
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      if (response.data?.question) {
        fetchSessionDetailsById();
        toast.success(response.data?.question?.isPinned ? 'Pinned question' : 'Unpinned question')
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error('Failed to update pin status')
    }
  };

  const updateMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData.role,
          experience: sessionData.experience,
          topicsToFocus: sessionData.topicsToFocus,
          numberOfQuestions: 10,
        },
        { timeout: 120000 }
      );

      // Normalize AI response to an array of {question, answer}
      let generated = [];
      const payload = aiResponse?.data;
      if (Array.isArray(payload)) {
        generated = payload;
      } else if (Array.isArray(payload?.questions)) {
        generated = payload.questions;
      } else if (typeof payload?.questions === "string") {
        try {
          const parsed = JSON.parse(payload.questions);
          if (Array.isArray(parsed)) generated = parsed;
        } catch (_) {}
      }

      // Guard shape: map into {question, answer}
      const normalized = (generated || [])
        .map((q) =>
          typeof q === "object"
            ? { question: q.question || q.q || "", answer: q.answer || q.a || "" }
            : { question: String(q), answer: "" }
        )
        .filter((q) => q.question);

      if (normalized.length === 0) {
        throw new Error("No questions generated");
      }

      // Add to session: backend expects { sessionId, questions }
      const addResp = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: normalized,
        }
      );

      // Update local state optimistically with created questions
      const created = addResp?.data?.questions || [];
      if (created.length) {
        setSessionData((prev) =>
          prev
            ? { ...prev, questions: [...(prev.questions || []), ...created] }
            : prev
        );
        toast.success('Added more questions')
      } else {
        // fallback: refetch
        fetchSessionDetailsById();
        toast.success('Questions updated')
      }
    } catch (error) {
      const isTimeout = error?.code === 'ECONNABORTED';
      const message = isTimeout
        ? "Request timed out while generating questions. Please try again."
        : (error?.response?.data?.message || "Something went wrong");
      setErrorMsg(message);
      toast.error(isTimeout ? 'Questions request timed out' : message)
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchSessionDetailsById();
  }, []);

  return (
    <DashboardLayout>
      <RoleInfoHeader
        role={sessionData?.role || ""}
        topicsToFocus={sessionData?.topicsToFocus || ""}
        experience={sessionData?.experience || "-"}
        questions={sessionData?.questions?.length || "-"}
        description={sessionData?.description || ""}
        lastUpdated={
          sessionData?.updatedAt
            ? moment(sessionData.updatedAt).format("Do MMM YYYY")
            : ""
        }
      />

      <div className="container mx-auto pt-4 pb-4 px-4 md:px-0">
        <h2 className="text-lg font-semibold color-black">Interview Q & A</h2>

        <div className="grid grid-col-12 gap-4 mt-5 mb-10">
          <div className={`col-span-12 ${openLearnMoreDrawer ? "md:col-span-7" : "md:col-span-8"}`}>
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => (
                <motion.div
                  key={data._id || index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    type: "spring",
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 15,
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                >
                  <QuestionCard
                    question={data?.question}
                    answer={data?.answer}
                    onLearnMore={() => generateConceptExplanation(data.question)}
                    isPinned={data?.isPinned}
                    onTogglePin={() => toggleQuestionPinStatus(data._id)}
                  />

                  {!isLoading  && sessionData?.questions?.length == index+1 && (
                    <div className="flex items-center justify-center t-5">
                      <button
                        className="flex items-center gap-3 text-s text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer"
                        disabled={isLoading || isUpdateLoader}
                        onClick={updateMoreQuestions}
                      >
                        {isUpdateLoader ? <SpinnerLoader /> : <LuListCollapse className="text-lg" />}
                        Load More
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Drawer
          isOpen={openLearnMoreDrawer}
          onClose={() => setOpenLearnMoreDrawer(false)}
          title={
            !isLoading
              ? typeof explanation === "object"
                ? explanation?.title || "Explanation"
                : "Explanation"
              : undefined
          }
        >
          {errorMsg && (
            <p className="flex gap-2 text-sm text-amber-600 font-medium">
              <LuCircleAlert className="mt-1" /> {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && (
            <AIResponsePreview
              content={
                typeof explanation === "string"
                  ? explanation
                  : (
                      // common shapes: { title, explanation }, { content }, or raw text
                      explanation?.explanation || explanation?.content || ""
                    )
              }
            />
          )}
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default InterviewPrep;
