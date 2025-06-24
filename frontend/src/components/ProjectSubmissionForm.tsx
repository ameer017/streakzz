import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ExternalLink, Github, Sparkles, Upload } from 'lucide-react';
import { projectsAPI } from '../services/api';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  liveLink: z.string().url('Please enter a valid URL for the live link'),
  githubLink: z.string().url('Please enter a valid GitHub URL'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectSubmissionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProjectSubmissionForm: React.FC<ProjectSubmissionFormProps> = ({ onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const description = watch('description', '');
  const descriptionLength = description.length;

  const onSubmit = async (data: ProjectFormData) => {
    setIsLoading(true);
    setError('');

    try {
      await projectsAPI.submit(data);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <style jsx>{`
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
          animation: slideUp 0.4s ease-out;
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

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          color: ${descriptionLength < 50 ? '#dc2626' : '#16a34a'};
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
        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Project Name
          </label>
          <input
            {...register('name')}
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
            {...register('description')}
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
              {...register('liveLink')}
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
              {...register('githubLink')}
              type="url"
              className="form-input"
              placeholder="https://github.com/username/your-repo"
            />
          </div>
          {errors.githubLink && (
            <p className="error-message">{errors.githubLink.message}</p>
          )}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={isLoading} className="btn btn-primary">
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
    </div>
  );
};

export default ProjectSubmissionForm; 