const Session = require("../models/Session");
const Question = require("../models/Question");

exports.createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description, questions } = req.body;
    const userId = req.user._id;

    const session = await Session.create({
      user: userId,
      role,
      experience,
      topicsToFocus,
      description,
    });

    // Ensure questions is always an array
    const questionsArray = Array.isArray(questions) ? questions : [];

    const questionDocs = await Question.insertMany(
      questionsArray.map((q) => ({
        session: session._id,
        question: q.question || "Sample question",
        answer: q.answer || "Sample answer",
      }))
    );

    session.questions = questionDocs.map((q) => q._id);
    await session.save();

    const populatedSession = await Session.findById(session._id).populate("questions");

    res.status(201).json({ success: true, session: populatedSession });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};



exports.getSessionById = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate({
        path: "questions",
        options: { sort: { isPinned: -1, createdAt: 1 } },
      })
      .exec();
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMySession = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("questions");
    res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }
    //check if the logged in user is the owner of the session
    if (session.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized" });
    }
    //first delete all questions associated with the session
    await Question.deleteMany({ session: session._id });
    //then delete the session
    await session.deleteOne();
    res.status(200).json({ success: true, message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
