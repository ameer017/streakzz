import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI, projectsAPI } from "../services/api";
import type { UserProfile, Project } from "../types";
import StreakGraph from "./StreakGraph";
import ProjectSubmissionForm from "./ProjectSubmissionForm";
import MotivationalQuote from "./MotivationalQuote";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  LogOut,
  Plus,
  User,
  BarChart3,
  Table,
  ExternalLink,
  Github,
  UserX,
} from "lucide-react";

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"dashboard" | "projects">(
    "dashboard"
  );
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [streakData, setStreakData] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await usersAPI.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchStreakData = async () => {
      try {
        const streak = await projectsAPI.getMyStreak();
        setStreakData(streak);
      } catch (error) {
        console.error("Error fetching streak data:", error);
      }
    };

    fetchProfile();
    fetchStreakData();
  }, []);

  const fetchUserProjects = async () => {
    if (userProjects.length > 0) return; // Only fetch if not already loaded
    setProjectsLoading(true);
    try {
      const projects = await projectsAPI.getMyProjects();
      setUserProjects(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleViewModeChange = (mode: "dashboard" | "projects") => {
    setViewMode(mode);
    if (mode === "projects") {
      fetchUserProjects();
    }
  };

  const handleProjectSubmission = () => {
    setShowProjectForm(false);
    // Refresh profile data and projects
    const refreshData = async () => {
      try {
        const profile = await usersAPI.getProfile();
        setUserProfile(profile);
        // Refresh streak data
        const streak = await projectsAPI.getMyStreak();
        setStreakData(streak);
        // Refresh projects if they were loaded
        if (userProjects.length > 0) {
          const projects = await projectsAPI.getMyProjects();
          setUserProjects(projects);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      }
    };
    refreshData();
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_URL}/api/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success("Account deleted successfully");
        logout();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete account");
      }
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (mobileMenuOpen) return;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold ">Streakzz</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* View Toggle Buttons */}
          <div className="mb-6">
            {/* Navigation buttons - responsive layout */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
              {/* Primary navigation */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleViewModeChange("dashboard")}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium border shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    viewMode === "dashboard"
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleViewModeChange("projects")}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium border shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    viewMode === "projects"
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Projects
                </button>
              </div>
            </div>

            {/* Action buttons - always wrap on small screens */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  setShowProjectForm(true);
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Project
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                <UserX className="h-4 w-4 mr-2" />
                Delete Account
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>

          {viewMode === "dashboard" ? (
            <div className="space-y-6">
              {/* Motivational Quote */}
              <MotivationalQuote />

              {/* Profile Header */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full p-3">
                    <User className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {userProfile?.user.fullName}
                    </h2>
                    <p className="text-gray-600">{userProfile?.user.email}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-500">
                        {userProfile?.stats.totalProjects} projects submitted
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Streak Graph */}
              {userProfile && (
                <StreakGraph streakData={userProfile.stats.streakData} />
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    Total Projects
                  </h3>
                  <p className="text-3xl font-bold text-primary-600 mt-2">
                    {userProfile?.stats.totalProjects || 0}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    This Month
                  </h3>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {/* Calculate current month submissions */}
                    {userProfile
                      ? Object.entries(userProfile.stats.streakData)
                          .filter(([date]) => {
                            const d = new Date(date);
                            const now = new Date();
                            return (
                              d.getMonth() === now.getMonth() &&
                              d.getFullYear() === now.getFullYear()
                            );
                          })
                          .reduce((sum, [, count]) => sum + count, 0)
                      : 0}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    Current Streak
                  </h3>
                  <p className="text-3xl font-bold text-orange-600 mt-2">
                    {streakData?.currentStreak || 0}
                  </p>
                  {streakData?.longestStreak && streakData.longestStreak > streakData.currentStreak && (
                    <p className="text-xs text-gray-500 mt-1">
                      Longest: {streakData.longestStreak} days
                    </p>
                  )}
                </div>
                <div className="bg-white shadow rounded-lg p-6 text-center">
                  <h3 className="text-sm font-medium text-gray-900">
                    Longest Streak
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 mt-2">
                    {streakData?.longestStreak || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">days</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Projects List View */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        My Projects
                      </h2>
                      <p className="text-sm text-gray-500">
                        {userProjects.length} project
                        {userProjects.length !== 1 ? "s" : ""} submitted
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {projectsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                      <p className="ml-3 text-gray-600">Loading projects...</p>
                    </div>
                  ) : userProjects.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                        <Table className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No projects yet
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Submit your first project to get started!
                      </p>
                      <button
                        onClick={() => setShowProjectForm(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Project
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-300">
                      {userProjects.map((project, index) => (
                        <motion.div
                          key={project.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200 border-l-4 border-l-transparent hover:border-l-primary-500"
                        >
                          {/* Mobile and Desktop Layout */}
                          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                            {/* Project Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start sm:items-center">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-primary-600 rounded-full"></div>
                                  </div>
                                </div>
                                <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                                    {project.name}
                                  </h3>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {project.description.length > 100
                                      ? `${project.description.substring(
                                          0,
                                          100
                                        )}...`
                                      : project.description}
                                  </p>
                                  {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {project.technologies.slice(0, 3).map((tech) => (
                                        <span
                                          key={tech}
                                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                          {tech}
                                        </span>
                                      ))}
                                      {project.technologies.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                          +{project.technologies.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-400 mt-2">
                                    Submitted on{" "}
                                    {new Date(
                                      project.submittedAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:ml-6">
                              <a
                                href={project.liveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                title="View Live Site"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                <span className="sm:hidden">Live</span>
                                <span className="hidden sm:inline">Live Demo</span>
                              </a>
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                                title="View GitHub Repository"
                              >
                                <Github className="h-4 w-4 mr-2" />
                                <span className="sm:hidden">Code</span>
                                <span className="hidden sm:inline">Source Code</span>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? All your data,
              including projects and streak information, will be permanently
              removed.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Project Submission Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <ProjectSubmissionForm
              onSuccess={handleProjectSubmission}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
