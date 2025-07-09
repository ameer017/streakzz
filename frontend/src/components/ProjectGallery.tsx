import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Calendar,
  User,
  Search,
  X,
  ArrowLeft,
} from "lucide-react";
import { projectsAPI } from "../services/api";
import type { Project } from "../types";
import { useNavigate } from "react-router-dom";

const ProjectGallery: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>(
    []
  );
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, selectedTechnologies, sortBy]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsAPI.getAllProjects();
      setProjects(projectsData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.user?.name || project.author)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesTechnologies =
        selectedTechnologies.length === 0 ||
        selectedTechnologies.some((tech) =>
          project.technologies.includes(tech)
        );

      return matchesSearch && matchesTechnologies;
    });

    // Sort projects
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    setFilteredProjects(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTechnologies([]);
    setSortBy("date");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-lg">Loading projects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                <p className="text-lg font-semibold">Error loading projects</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-200 rounded-xl shadow hover:bg-gray-100 transition-colors text-black font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 text-black"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Project Gallery
          </h1>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Explore amazing projects built by our community. Click on any
            project to visit the live demo!
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 mb-8 max-w-xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search projects, descriptions, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
                />
              </div>
            </div>
            {/* Sort */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "name")}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/70 backdrop-blur-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
            {/* Clear Filters */}
            {searchTerm && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-black">
            Showing {filteredProjects.length} of {projects.length} projects
          </p>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30">
              <p className="text-xl text-black mb-2">No projects found</p>
              <p className="text-black">Try adjusting your search or filters</p>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                  {/* Project Header */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-black mb-2 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-black">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(project.submittedAt)}
                      </div>
                      {(project.author || project.user?.name) && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="text-black">
                            {project.user?.name || project.author}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-black mb-4 flex-1 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-100 text-black text-xs rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 text-black text-xs rounded-full">
                          +{project.technologies.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <a
                      href={project.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-black py-2 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Live Demo
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectGallery;
