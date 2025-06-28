import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Trophy,
  Target,
  Sparkles,
  Star,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.6 },
  };

  const updatedDate = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-4">
              <div className="inline-flex items-center bg-gray-100 border border-gray-200 rounded-full px-6 py-3 mb-6">
                <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-gray-700 font-medium">
                  Join 500+ developers building daily habits
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                Build Consistent
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Project Habits
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Join developers worldwide in building a daily project submission
                habit. Track your progress, maintain streaks, and grow your
                skills one project at a time.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                to="/register"
                className="no-underline bg-blue group px-6 py-2 rounded-2xl font-bold text-lg hover:shadow-md hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                Start Your Streak
              </Link>
              <Link
                to="/login"
                className="no-underline bg-green group px-6 py-2 rounded-2xl font-bold text-lg hover:shadow-md hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 flex items-center"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="relative z-10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Developers are building amazing things, one day at a time
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div
              variants={scaleIn}
              className="bg-white border border-gray-200 rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 cursor bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600 font-medium">Active Developers</p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-white border border-gray-200 rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 cursor bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600 font-medium">Projects Submitted</p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              className="bg-white border border-gray-200 rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 cursor bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">30</h3>
              <p className="text-gray-600 font-medium">Days Max Streak</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gray-50 border border-gray-200 rounded-3xl p-12"
          >
            <div className="flex justify-center mb-6">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to Start Your Coding Streak?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of developers building consistent coding habits and
              advancing their careers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {updatedDate} Streakzz.
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-gray-500 text-sm">Made with Love</span>
              <span className="text-gray-500 text-sm">by developers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
