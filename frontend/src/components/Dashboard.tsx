import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI, projectsAPI } from '../services/api';
import type { UserProfile, Project } from '../types';
import StreakGraph from './StreakGraph';
import ProjectSubmissionForm from './ProjectSubmissionForm';
import { LogOut, Plus, User, BarChart3, Table, ExternalLink, Github } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'dashboard' | 'projects'>('dashboard');
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await usersAPI.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchUserProjects = async () => {
    if (userProjects.length > 0) return; // Only fetch if not already loaded
    setProjectsLoading(true);
    try {
      const projects = await projectsAPI.getMyProjects();
      setUserProjects(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  };

  const handleViewModeChange = (mode: 'dashboard' | 'projects') => {
    setViewMode(mode);
    if (mode === 'projects') {
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
        // Refresh projects if they were loaded
        if (userProjects.length > 0) {
          const projects = await projectsAPI.getMyProjects();
          setUserProjects(projects);
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    };
    refreshData();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Streakzz</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.fullName}</span>
              <button
                onClick={() => setShowProjectForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Submit Project
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* View Toggle Buttons */}
          <div className="mb-6 flex justify-center space-x-3">
            <button
              onClick={() => handleViewModeChange('dashboard')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium border shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                viewMode === 'dashboard'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => handleViewModeChange('projects')}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium border shadow-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                viewMode === 'projects'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Table className="h-4 w-4 mr-2" />
              Projects
            </button>
          </div>

          {viewMode === 'dashboard' ? (
            <>
              {/* Profile Header */}
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center">
                  <div className="bg-primary-100 rounded-full p-3">
                    <User className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-gray-900">{userProfile?.user.fullName}</h2>
                    <p className="text-gray-600">{userProfile?.user.email}</p>
                    <p className="text-sm text-gray-500">
                      {userProfile?.stats.totalProjects} projects submitted
                    </p>
                  </div>
                </div>
              </div>

              {/* Streak Graph */}
              {userProfile && (
                <StreakGraph streakData={userProfile.stats.streakData} />
              )}

              {/* Stats Cards */}
              <div className="mt-6 flex space-x-4">
                <div className="bg-white shadow rounded-lg p-4 flex-1 text-center">
                  <h3 className="text-sm font-medium text-gray-900">Total Projects</h3>
                  <p className="text-2xl font-bold text-primary-600 mt-1">
                    {userProfile?.stats.totalProjects || 0}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 flex-1 text-center">
                  <h3 className="text-sm font-medium text-gray-900">This Month</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {/* Calculate current month submissions */}
                    {userProfile ? Object.entries(userProfile.stats.streakData)
                      .filter(([date]) => {
                        const d = new Date(date);
                        const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                      })
                      .reduce((sum, [, count]) => sum + count, 0) : 0}
                  </p>
                </div>
                <div className="bg-white shadow rounded-lg p-4 flex-1 text-center">
                  <h3 className="text-sm font-medium text-gray-900">Current Streak</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">
                    {/* Calculate current streak */}
                    {userProfile ? (() => {
                      const today = new Date();
                      let streak = 0;
                      for (let i = 0; i < 365; i++) {
                        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                        const dateKey = date.toISOString().split('T')[0];
                        if (userProfile.stats.streakData[dateKey] > 0) {
                          streak++;
                        } else {
                          break;
                        }
                      }
                      return streak;
                    })() : 0}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Projects List View */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                    <p className="text-sm text-gray-500">{userProjects.length} project{userProjects.length !== 1 ? 's' : ''} submitted</p>
                  </div>
                </div>
                
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                    <p className="ml-3 text-gray-600">Loading projects...</p>
                  </div>
                ) : userProjects.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="bg-gray-100 rounded-full p-3 w-16 h-16 mx-auto mb-4">
                      <Table className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-4">Submit your first project to get started!</p>
                    <button
                      onClick={() => setShowProjectForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Submit Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userProjects.map((project, index) => (
                      <div
                        key={project.id}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                  <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                                </div>
                              </div>
                              <div className="ml-4 flex-1 min-w-0">
                                <h3 className="text-lg font-medium text-gray-900 truncate">
                                  {project.name}
                                </h3>
                                <p className="text-sm text-gray-500 truncate">
                                  {project.description.length > 80 
                                    ? `${project.description.substring(0, 80)}...` 
                                    : project.description
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 ml-6">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(project.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(project.submittedAt).toLocaleDateString('en-US', { weekday: 'short' })}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href={project.liveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 transition-colors"
                                title="View Live Site"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Live
                              </a>
                              <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
                                title="View GitHub Repository"
                              >
                                <Github className="h-3 w-3 mr-1" />
                                Code
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

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