import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  X,
  ExternalLink,
  Github,
  Sparkles,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { projectsAPI } from "../services/api";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  liveLink: z.string().url("Please enter a valid URL for the live link"),
  githubLink: z.string().url("Please enter a valid GitHub URL"),
  technologies: z
    .array(z.string())
    .min(1, "At least one technology must be selected"),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectSubmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectSubmissionForm: React.FC<ProjectSubmissionFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [timeRestrictionMessage, setTimeRestrictionMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const description = watch("description", "");
  const descriptionLength = description.length;

  // Check time restrictions
  useEffect(() => {
    const checkTimeRestriction = () => {
      const now = new Date();
      const hour = now.getHours();

      if (hour < 7 || hour >= 24) {
        setTimeRestrictionMessage(
          "Project submissions are only allowed between 7:00 AM and 11:59 PM"
        );
      } else {
        setTimeRestrictionMessage("");
      }
    };

    checkTimeRestriction();
    const interval = setInterval(checkTimeRestriction, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const onSubmit = async (data: ProjectFormData) => {
    if (timeRestrictionMessage) {
      toast.error(timeRestrictionMessage, {
        icon: "⏰",
        duration: 4000,
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await projectsAPI.submit(data);
      setSuccess(true);

      // Success animation and notification
      toast.success("Project submitted successfully! 🎉", {
        duration: 4000,
        style: {
          background: "#10B981",
          color: "white",
        },
        iconTheme: {
          primary: "white",
          secondary: "#10B981",
        },
      });

      // Wait for animation then close
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit project. Please try again.";
      setError(errorMessage);

      // Error notification
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          background: "#EF4444",
          color: "white",
        },
        iconTheme: {
          primary: "white",
          secondary: "#EF4444",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Success modal component
  const SuccessModal = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-gray-600 mb-4">
          Your project has been submitted successfully and added to your streak!
        </p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl"
        >
          🎉
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <AnimatePresence>{success && <SuccessModal />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden max-w-2xl mx-auto before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:to-purple-600 before:rounded-t-3xl"
      >
        <style>{`
          .form-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              0 0 0 1px rgba(255, 255, 255, 0.1) inset;
            position: relative;
            overflow: hidden;
            max-width: 600px;
            margin: 0 auto;
          }

          .form-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px 24px 0 0;
          }

          .form-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          }

          .form-title {
            font-size: 1.75rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .close-button {
            background: rgba(0, 0, 0, 0.05);
            border: none;
            border-radius: 12px;
            padding: 0.75rem;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .close-button:hover {
            background: rgba(0, 0, 0, 0.1);
            color: #374151;
            transform: rotate(90deg);
          }

          .time-warning {
            background: rgba(245, 158, 11, 0.1);
            border: 1px solid rgba(245, 158, 11, 0.3);
            color: #d97706;
            padding: 1rem;
            border-radius: 16px;
            font-size: 0.875rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .form-body {
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .form-group {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-label {
            font-size: 0.875rem;
            font-weight: 600;
            color: #374151;
            display: flex;
            align-items: center;
            gap: 0.25rem;
          }

          .form-input, .form-textarea {
            width: 100%;
            padding: 1rem;
            border: 2px solid rgba(0, 0, 0, 0.1);
            border-radius: 16px;
            font-size: 1rem;
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            outline: none;
          }

          .form-input:focus, .form-textarea:focus {
            border-color: #667eea;
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
          }

          .form-input::placeholder, .form-textarea::placeholder {
            color: #9ca3af;
          }

          .form-textarea {
            resize: vertical;
            min-height: 120px;
          }

          .input-with-icon {
            position: relative;
          }

          .input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
            pointer-events: none;
            z-index: 1;
          }

          .input-with-icon .form-input {
            padding-left: 3rem;
          }

          .error-message {
            color: #dc2626;
            font-size: 0.875rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            animation: shake 0.3s ease-in-out;
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .error-alert {
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.3);
            color: #dc2626;
            padding: 1rem;
            border-radius: 16px;
            font-size: 0.875rem;
            font-weight: 500;
            animation: slideDown 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .character-counter {
            font-size: 0.75rem;
            color: ${descriptionLength < 50 ? "#dc2626" : "#16a34a"};
            font-weight: 500;
            text-align: right;
            margin-top: 0.25rem;
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            padding-top: 1.5rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }

          .btn {
            padding: 0.875rem 2rem;
            border-radius: 16px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            position: relative;
            overflow: hidden;
          }

          .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s;
          }

          .btn:hover::before {
            left: 100%;
          }

          .btn-secondary {
            background: rgba(0, 0, 0, 0.05);
            color: #374151;
            border: 2px solid rgba(0, 0, 0, 0.1);
          }

          .btn-secondary:hover {
            background: rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
          }

          .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
          }

          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none !important;
          }

          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        <div className="form-header">
          <h3 className="form-title">
            <Sparkles className="h-6 w-6" />
            Submit New Project
          </h3>
          <button onClick={onCancel} className="close-button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="form-body">
          {timeRestrictionMessage && (
            <div className="time-warning">
              <Clock className="h-5 w-5" />
              {timeRestrictionMessage}
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="error-alert"
            >
              <AlertTriangle className="h-5 w-5" />
              {error}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Project Name
            </label>
            <input
              {...register("name")}
              type="text"
              className="form-input"
              placeholder="Enter your amazing project name"
            />
            {errors.name && (
              <p className="error-message">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description
            </label>
            <textarea
              {...register("description")}
              className="form-textarea"
              placeholder="Tell the world about your project... What makes it special? What problem does it solve?"
            />
            <div className="character-counter">
              {descriptionLength}/50 characters minimum
            </div>
            {errors.description && (
              <p className="error-message">{errors.description.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="liveLink" className="form-label">
              <ExternalLink className="h-4 w-4" />
              Live Demo Link
            </label>
            <div className="input-with-icon">
              <ExternalLink className="input-icon h-5 w-5" />
              <input
                {...register("liveLink")}
                type="url"
                className="form-input"
                placeholder="https://your-amazing-project.com"
              />
            </div>
            {errors.liveLink && (
              <p className="error-message">{errors.liveLink.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="githubLink" className="form-label">
              <Github className="h-4 w-4" />
              GitHub Repository
            </label>
            <div className="input-with-icon">
              <Github className="input-icon h-5 w-5" />
              <input
                {...register("githubLink")}
                type="url"
                className="form-input"
                placeholder="https://github.com/username/your-repo"
              />
            </div>
            {errors.githubLink && (
              <p className="error-message">{errors.githubLink.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="technologies" className="form-label">
              Technologies Used
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                "React",
                "Vue",
                "Angular",
                "Node.js",
                "Express",
                "JavaScript",
                "TypeScript",
                "HTML",
                "CSS",
                "Sass",
                "Tailwind CSS",
                "Bootstrap",
                "MongoDB",
                "AWS",
                "Git",
                "Next.js",
                "Nuxt.js",
                "GraphQL",
                "REST API",
                "Redux",
                "Vite",
                "NPM",
                "Yarn",
              ].map((tech) => (
                <label
                  key={tech}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={tech}
                    {...register("technologies")}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{tech}</span>
                </label>
              ))}
            </div>
            {errors.technologies && (
              <p className="error-message">{errors.technologies.message}</p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !!timeRestrictionMessage}
              className="btn btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Submit Project
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
};

export default ProjectSubmissionForm;
