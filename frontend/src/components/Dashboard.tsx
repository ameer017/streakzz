import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usersAPI } from '../services/api';
import type { UserProfile } from '../types';
import StreakGraph from './StreakGraph';
import ProjectSubmissionForm from './ProjectSubmissionForm';
import { LogOut, Plus, User } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const handleProjectSubmission = () => {
    setShowProjectForm(false);
    // Refresh profile data
    const fetchProfile = async () => {
      try {
        const profile = await usersAPI.getProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Total Projects</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {userProfile?.stats.totalProjects || 0}
              </p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">This Month</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
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
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900">Current Streak</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
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