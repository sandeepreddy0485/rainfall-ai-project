import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, ExternalLink, CloudRain, Globe, BarChart, MapPin, SunMoon } from 'lucide-react';

const About = () => {
  const technologies = [
    {
      category: 'Frontend',
      items: [
        { name: 'React', icon: '⚛️', description: 'Responsive UI with React' },
        { name: 'Tailwind CSS', icon: '🎨', description: 'Utility-first styling' },
        { name: 'Framer Motion', icon: '✨', description: 'Smooth UI animations' },
      ],
    },
    {
      category: 'Backend & ML',
      items: [
        { name: 'FastAPI', icon: '⚡', description: 'Lightweight API server' },
        { name: 'TensorFlow/Keras', icon: '🤖', description: 'LSTM model for rainfall forecasting' },
        { name: 'Pandas', icon: '📊', description: 'Data processing' },
      ],
    },
    {
      category: 'Data & APIs',
      items: [
        { name: 'Open-Meteo', icon: '🌍', description: 'Global weather & historical data' },
        { name: 'Model Registry', icon: '💾', description: 'Saved model + scaler artifacts' },
      ],
    },
  ];

  const team = [
    {
      name: 'AI Development Team',
      role: 'Full Stack Development',
      description: 'Building next-generation weather prediction systems',
    },
  ];

  const features = [
    {
      icon: <CloudRain className="w-6 h-6 text-blue-500" />, 
      title: 'Accurate 7-Day Rainfall',
      description: 'LSTM-powered forecasts trained on historical data',
    },
    {
      icon: <BarChart className="w-6 h-6 text-emerald-500" />,
      title: 'Historical Analysis',
      description: 'Explore trends with interactive charts and exports',
    },
    {
      icon: <MapPin className="w-6 h-6 text-pink-500" />,
      title: 'Location-aware Data',
      description: 'Search any coordinates worldwide for local forecasts',
    },
    {
      icon: <Globe className="w-6 h-6 text-cyan-500" />,
      title: 'Global Coverage',
      description: 'Open-Meteo powered forecasts for global locations',
    },
    {
      icon: <SunMoon className="w-6 h-6 text-yellow-500" />,
      title: 'Dark Mode & Accessibility',
      description: 'Comfortable UI with high-contrast themes',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      className="space-y-10"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Hero */}
      <motion.section variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 p-8 text-white shadow-xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">RainCast — AI Rainfall Forecasts</h1>
            <p className="mt-3 text-lg text-blue-100 max-w-2xl">Production-ready LSTM forecasts for the next 7 days, interactive visualizations, and drought monitoring — all in one modern dashboard.</p>
            <div className="mt-6 flex gap-3">
              <a href="/ai-predictions" className="px-4 py-2 bg-white text-blue-700 rounded-lg font-semibold shadow hover:opacity-95">Try AI Predictions</a>
              <a href="/dashboard" className="px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10">Open Dashboard</a>
            </div>
          </div>
          <div className="w-full md:w-96 bg-white/10 p-4 rounded-lg">
            <div className="text-sm text-white/90">Current model</div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">LSTM Rainfall Model</div>
                <div className="text-xs text-white/80 mt-1">Sequence: 14d → Forecast: 7d • Saved model</div>
              </div>
              <CloudRain className="w-10 h-10 text-white/90" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section variants={containerVariants} className="max-w-7xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-3">
        {features.map((f, i) => (
          <motion.div key={i} variants={itemVariants} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{f.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* Technologies */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center">
          Technologies & Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {technologies.map((tech, idx) => (
            <motion.div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 text-center">
                {tech.category}
              </h3>
              <div className="space-y-3">
                {tech.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="text-center">
                    <p className="text-3xl mb-1">{item.icon}</p>
                    <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Features */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Title Evaluation Endpoint',
              description: 'Scores and analyzes paper titles for clarity, keywords, and structure',
            },
            {
              title: 'Real-Time Weather Data',
              description: 'Powered by Open-Meteo API with hourly and daily forecasts for any location globally',
            },
            {
              title: 'Drought Index Monitoring',
              description: 'Live drought assessment with regional analysis and water conservation recommendations',
            },
            {
              title: 'Interactive Visualizations',
              description: 'Charts, maps, and gauges for easy understanding of weather patterns',
            },
            {
              title: 'Dark Mode Support',
              description: 'Beautiful dark theme compatible with modern devices and improved accessibility',
            },
            {
              title: 'Mobile Responsive Design',
              description: 'Works seamlessly on desktop, tablet, and mobile devices',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-lg p-6"
              whileHover={{ scale: 1.02 }}
            >
              <p className="font-semibold text-slate-900 dark:text-white mb-2">{feature.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Team */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center">
          About the Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {team.map((member, idx) => (
            <motion.div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-5xl mb-4">👨‍💻</div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">{member.role}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{member.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Data Sources */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Data Sources</h2>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300">
          <li>
            <strong>Open-Meteo API:</strong> Global weather forecast and archive data (
            <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              open-meteo.com <ExternalLink className="w-4 h-4" />
            </a>
            )
          </li>
          <li>
            <strong>Training Data:</strong> 180 days of historical weather observations for model training
          </li>
          <li>
            <strong>Prediction Engine:</strong> Statistical time‑series pattern analysis model
          </li>
        </ul>
      </motion.div>

      {/* Contact & Links */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
          Get In Touch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <Github className="w-5 h-5" />
            <span className="font-medium text-slate-900 dark:text-white">GitHub</span>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
            <span className="font-medium text-blue-900 dark:text-blue-300">LinkedIn</span>
          </a>
          <a
            href="mailto:contact@raincast.ai"
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium text-purple-900 dark:text-purple-300">Email</span>
          </a>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={itemVariants}
        className="text-center text-slate-600 dark:text-slate-400 text-sm pt-8 border-t border-slate-200 dark:border-slate-700"
      >
        <p>© 2026 RainCast. All rights reserved.</p>
        <p>Empowering better decisions through AI-driven weather intelligence.</p>
      </motion.div>
    </motion.div>
  );
};
export default About;