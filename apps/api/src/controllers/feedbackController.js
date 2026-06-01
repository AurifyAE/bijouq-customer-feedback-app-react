import {
    insertSurvey,
    getAllSurveys,
    getSurveyById,
    getSurveyByPhone,
    deleteSurveyById,
    getSurveyStats
  } from "../models/feedbackModel.js";
  
  // ─────────────────────────────────────────────
  //  GET /api/feedback/lookup?phone=  (public)
  //  Used by Form.jsx to check if phone already
  //  submitted and to pre-fill form fields
  // ─────────────────────────────────────────────
  
  const lookupByPhone = async (req, res) => {
    try {
      const { phone } = req.query;
  
      if (!phone) {
        return res.status(400).json({
          status: "error",
          message: "Phone number is required.",
        });
      }
  
      const survey = await getSurveyByPhone(phone.trim());
  
      if (!survey) {
        // No previous submission — form can proceed fresh
        return res.status(200).json({
          status: "not_found",
          message: "No previous submission found.",
          data: null,
        });
      }
  
      // Previous submission found — return data + already_submitted flag
      return res.status(200).json({
        status: "already_submitted",
        message: "This phone number has already submitted a survey.",
        data: {
          phone: survey.phone,
          full_name: survey.full_name,
          emirates_id: survey.emirates_id,
          date_of_birth: survey.date_of_birth,
          hear_about_us: survey.hear_about_us,
          hear_about_us_other: survey.hear_about_us_other,
          jewelry_collections: survey.jewelry_collections,
          jewelry_collections_other: survey.jewelry_collections_other,
          bijouq_branch: survey.bijouq_branch,
          feedback: survey.feedback,
          submitted_at: survey.submitted_at,
        },
      });
    } catch (err) {
      console.error("Lookup by phone error:", err.message);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  };
  
  // ─────────────────────────────────────────────
  //  POST /api/feedback/submit  (public)
  // ─────────────────────────────────────────────
  
  const submitSurvey = async (req, res) => {
    try {
      const {
        phone,
        country_code,
        country_name,
        full_name,
        emirates_id,
        date_of_birth,
        hear_about_us,
        hear_about_us_other,
        jewelry_collections,
        jewelry_collections_other,
        bijouq_branch,
        feedback,
        language,
      } = req.body;
  
      // Required field validation
      if (!phone || !full_name) {
        return res.status(400).json({
          status: "error",
          message: "Phone and full name are required.",
        });
      }
  
      const survey = await insertSurvey({
        phone,
        country_code,
        country_name,
        full_name,
        emirates_id,
        date_of_birth,
        hear_about_us,
        hear_about_us_other,
        jewelry_collections,
        jewelry_collections_other,
        bijouq_branch,
        feedback,
        language,
      });
  
      return res.status(201).json({
        status: "success",
        message: "Survey submitted successfully.",
        data: survey,
      });
    } catch (err) {
      console.error("Submit survey error:", err.message);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  };
  
  // ─────────────────────────────────────────────
  //  GET /api/feedback  (protected — admin only)
  //  Query params:
  //    page, limit, search, country, branch
  //    sortBy, sortOrder (asc | desc)
  // ─────────────────────────────────────────────
  
  const getAllFeedback = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        country = "",
        branch = "",
        sortBy = "submitted_at",
        sortOrder = "desc",
      } = req.query;
  
      const result = await getAllSurveys({
        page: parseInt(page),
        limit: parseInt(limit),
        search: search.trim(),
        country: country.trim(),
        branch: branch.trim(),
        sortBy: sortBy.trim(),
        sortOrder: sortOrder.trim(),
      });
  
      return res.status(200).json({
        status: "success",
        ...result,
      });
    } catch (err) {
      console.error("Get all feedback error:", err.message);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  };
  
  // ─────────────────────────────────────────────
  //  GET /api/feedback/:id  (protected — admin only)
  // ─────────────────────────────────────────────
  
  const getFeedbackById = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid survey ID.",
        });
      }
  
      const survey = await getSurveyById(parseInt(id));
  
      if (!survey) {
        return res.status(404).json({
          status: "error",
          message: "Survey not found.",
        });
      }
  
      return res.status(200).json({
        status: "success",
        data: survey,
      });
    } catch (err) {
      console.error("Get feedback by ID error:", err.message);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  };
  
  // ─────────────────────────────────────────────
  //  DELETE /api/feedback/:id  (protected — admin only)
  // ─────────────────────────────────────────────
  
  const deleteFeedback = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (isNaN(id)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid survey ID.",
        });
      }
  
      const deleted = await deleteSurveyById(parseInt(id));
  
      if (!deleted) {
        return res.status(404).json({
          status: "error",
          message: "Survey not found.",
        });
      }
  
      return res.status(200).json({
        status: "success",
        message: `Survey #${id} deleted successfully.`,
      });
    } catch (err) {
      console.error("Delete feedback error:", err.message);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  };
  
  // ─────────────────────────────────────────────
  //  GET /api/feedback/stats  (protected — admin only)
  // ─────────────────────────────────────────────
  
  const getStats = async (req, res) => {
    try {
      const stats = await getSurveyStats();
  
      return res.status(200).json({
        status: "success",
        data: stats,
      });
    } catch (err) {
      console.error("Get stats error:", err.message);
      return res.status(500).json({
        status: "error",
        message: "Internal server error.",
      });
    }
  };
  
  export {
    lookupByPhone,
    submitSurvey,
    getAllFeedback,
    getFeedbackById,
    deleteFeedback,
    getStats,
  };