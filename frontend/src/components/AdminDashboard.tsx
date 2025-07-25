import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Search, Mail, LogOut } from "lucide-react";
import { projectsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface Participant {
  id: string;
  name: string;
  email: string;
  projectCount: number;
  streakCount: number;
  hasReachedThirtyProjects: boolean;
  points: number;
  joinedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "projectCount" | "streakCount" | "joinedAt" | "points">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const participants = await projectsAPI.getParticipants();
      setParticipants(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedParticipants = participants
    .filter(
      (participant) =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "joinedAt") {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortOrder === "asc" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc"
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const handleSort = (field: "name" | "projectCount" | "streakCount" | "joinedAt" | "points") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 25) return "text-green-600 bg-green-100";
    if (streak >= 20) return "text-emerald-600 bg-emerald-100";
    if (streak >= 10) return "text-amber-600 bg-amber-100";
    if (streak >= 1) return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const getStreakLabel = (streak: number): string => {
    if (streak >= 25) return "Super Green";
    if (streak >= 20) return "Green";
    if (streak >= 10) return "Amber";
    if (streak >= 1) return "Red";
    return "None";
  };

  const stats = {
    totalParticipants: participants.length,
    activeUsers: participants.filter((p) => p.streakCount > 0).length,
    totalProjects: participants.reduce((sum, p) => sum + p.projectCount, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-md border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold ">Streakzz</h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <button
                onClick={logout}
                className="inline-flex items-center px-2 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

       
      </nav>

      <div className="flex-1 flex flex-col max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8 w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 flex-shrink-0"
        >
         

          <div className="flex items-center space-x-4">
            <div className="text-left sm:text-right">
              <div className="flex items-center">
                <p className="text-lg sm:text-3xl font-medium text-gray-900">
                  {user?.fullName}
                </p>
              </div>
              <p className="text-xs text-gray-500">{user?.email}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 flex-shrink-0"
        >
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Participants
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.totalParticipants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {stats.totalProjects}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border mb-4 sm:mb-6 flex-shrink-0"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Participants Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white shadow-sm rounded-lg border flex-1 flex flex-col min-h-0"
        >
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Participants
            </h2>
          </div>

          {/* Scrollable Table */}
          <div className="flex-1 overflow-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("name")}
                    >
                      Name{" "}
                      {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Email
                    </th>
                    <th
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("projectCount")}
                    >
                      Projects{" "}
                      {sortBy === "projectCount" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("streakCount")}
                    >
                      Streak{" "}
                      {sortBy === "streakCount" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                      onClick={() => handleSort("points")}
                    >
                      Points{" "}
                      {sortBy === "points" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedParticipants.map((participant, index) => (
                    <motion.tr
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-medium text-sm">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-2 sm:ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {participant.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center min-w-0">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 sm:mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate">
                            {participant.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {participant.projectCount}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span
                            className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStreakColor(
                              participant.streakCount
                            )}`}
                          >
                            <span className="hidden sm:inline">
                              {participant.streakCount} days (
                              {getStreakLabel(participant.streakCount)})
                            </span>
                            <span className="sm:hidden">
                              {participant.streakCount}d
                            </span>
                          </span>
                          {participant.hasReachedThirtyProjects && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              🏆 30 Projects
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium text-yellow-600">
                            ⭐ {participant.points}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
