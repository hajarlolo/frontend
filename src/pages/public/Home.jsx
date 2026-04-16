import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiUserPlus,
  FiSearch,
  FiMessageSquare,
  FiCheckCircle,
  FiStar,
  FiAward,
  FiBriefcase,
  FiZap,
} from 'react-icons/fi';

import ThemeToggle from '../../components/ui/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaff] dark:bg-slate-950 font-sans selection:bg-brandMagenta/20 selection:text-brandMagenta overflow-x-hidden transition-colors duration-500">

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-premium group-hover:rotate-12 transition-transform duration-500">
                <FiZap className="text-white w-6 h-6" />
              </div>
              <Link to="/" className="text-xl font-black italic tracking-tighter text-brand-violet dark:text-white transition-colors">
                TALENT<span className="text-brand-magenta dark:text-brandMagenta underline decoration-brand-magenta/30 underline-offset-4">LINK</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-10">
              <nav className="flex gap-8">
                {['Features', 'Students', 'Companies', 'Testimonials'].map((item) => (
                  <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-brandViolet dark:hover:text-white transition-colors">
                    {item}
                  </a>
                ))}
              </nav>
              <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link to="/login" className="text-sm font-bold text-brandViolet dark:text-white hover:opacity-80 transition-opacity px-4 py-2">
                  Login
                </Link>
                <Link to="/register-type" className="relative group px-6 py-2.5 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-brand-gradient group-hover:scale-105 transition-transform duration-300"></div>
                  <span className="relative text-sm font-bold text-white">Get Started</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50 dark:bg-brandNavy transition-colors duration-500">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-brandViolet/10 dark:bg-brandViolet/30 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-brandMagenta/10 dark:bg-brandMagenta/30 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brandViolet/5 dark:bg-white/5 backdrop-blur-md border border-brandViolet/10 dark:border-white/10 shadow-sm dark:shadow-inner-light">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandMagenta opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brandMagenta"></span>
                </span>
                <span className="text-[10px] font-black text-brandNavy/60 dark:text-white/80 uppercase tracking-[0.2em]">Empowering the next generation</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-brandNavy dark:text-white leading-[1.1] tracking-tight transition-colors">
                Where Ambition <br />
                <span className="text-transparent bg-clip-text bg-brand-gradient">
                  Meets Opportunity
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl font-medium leading-relaxed transition-colors">
                The premier ecosystem bridging world-class student talent with visionary companies. Internships, freelance, and careers redefined.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 items-center justify-center lg:justify-start pt-4">
                <Link to="/register-type" className="group relative px-10 py-5 rounded-2xl bg-brandViolet text-white dark:bg-white dark:text-brandNavy font-black text-lg shadow-2xl shadow-brandViolet/20 dark:shadow-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-brand-gradient dark:bg-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <span className="relative flex items-center gap-2">
                    Get Started Now <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>

              </div>

              <div className="flex items-center gap-6 pt-8 justify-center lg:justify-start">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i + 10}`} className="w-12 h-12 rounded-full border-4 border-slate-50 dark:border-brandNavy object-cover shadow-xl" alt="user" />
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex gap-1 text-yellow-500 dark:text-yellow-400">
                    {[...Array(5)].map((_, i) => <FiStar key={i} className="fill-current w-4 h-4" />)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mt-1">Trusted by 10,000+ students</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block animate-float">
              <div className="absolute -inset-4 bg-brand-gradient rounded-[40px] opacity-20 blur-2xl rotate-3"></div>
              <div className="relative p-4 border border-slate-200 dark:border-white/10 overflow-hidden rounded-[32px] shadow-2xl bg-white dark:bg-white/5 backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="TalentLink Dashboard"
                  className="rounded-[24px] shadow-sm w-full h-[600px] object-cover"
                />
                {/* Floating Badges */}
                <div className="absolute top-12 -left-10 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl animate-float border border-slate-100 dark:border-slate-800" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                      <FiCheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Application</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">Offer Accepted!</p>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-12 -right-10 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl animate-float border border-slate-100 dark:border-slate-800" style={{ animationDelay: '3s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brandViolet/10 dark:bg-brandViolet/30 rounded-full flex items-center justify-center text-brandViolet dark:text-brandViolet">
                      <FiBriefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">Match Score</p>
                      <p className="text-sm font-black text-slate-800 dark:text-white">98% Match AI</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl p-8 md:p-12 border border-slate-100 dark:border-slate-800 grid grid-cols-2 lg:grid-cols-4 gap-8 transition-colors duration-500">
          {[
            { label: "Active Users", val: "10k+", suffix: "Students" },
            { label: "Partner Companies", val: "500+", suffix: "Global Brands" },
            { label: "Matches Made", val: "2.5k+", suffix: "Last Month" },
            { label: "Average Salary", val: "$45k", suffix: "Post-Grad" },
          ].map((stat, idx) => (
            <div key={idx} className="text-center group cursor-pointer">
              <p className="text-4xl md:text-5xl font-black text-brandNavy dark:text-white group-hover:text-brandViolet dark:group-hover:text-brandViolet transition-colors duration-300">{stat.val}</p>
              <div className="mt-2 text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</div>
              <div className="text-[10px] text-brandMagenta dark:text-brandMagenta font-bold uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{stat.suffix}</div>
            </div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brandViolet/5 dark:bg-brandViolet/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-brandViolet/10 dark:bg-brandViolet/20 text-brandViolet dark:text-brandViolet text-xs font-black uppercase tracking-widest">
              The Process
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-brandNavy dark:text-white mb-6 tracking-tight transition-colors">The Path to Success</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium transition-colors">Streamlined, intelligent, and designed to minimize friction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: <FiUserPlus />,
                title: "Build Identity",
                desc: "Go beyond the CV. Showcase your projects, skills, and personality with a dynamic professional profile.",
                color: "brandViolet"
              },
              {
                icon: <FiSearch />,
                title: "Smart Discovery",
                desc: "Our AI engine analyzes your profile to suggest opportunities that align with your true potential.",
                color: "brandMagenta"
              },
              {
                icon: <FiMessageSquare />,
                title: "Direct Access",
                desc: "Break the barrier. Direct messaging and one-click applications to get you in front of hiring managers.",
                color: "blue-500"
              }
            ].map((step, idx) => (
              <div key={idx} className="relative group p-12 rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-brandViolet/20 dark:hover:border-brandViolet/30 shadow-sm dark:shadow-inner-light hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full bg-${step.color}`}></div>
                <div className={`w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-${step.color} group-hover:text-white transition-all duration-500 text-${step.color}`}>
                  {React.cloneElement(step.icon, { className: "w-10 h-10" })}
                </div>
                <h3 className="text-2xl font-black text-brandNavy dark:text-white mb-5 transition-colors">{idx + 1}. {step.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium transition-colors">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOR STUDENTS (Modern Split) --- */}
      <section id="students" className="py-32 bg-brandNavy relative overflow-hidden">
        <div className="absolute middle-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-brandViolet/30 rounded-[60px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative rounded-[48px] overflow-hidden border border-white/10 p-2 bg-white/5 backdrop-blur-sm shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1523240715630-9917c1ad97cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="Student success"
                  className="rounded-[40px] w-full h-[640px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <FiAward className="text-brandMagenta w-8 h-8" />
                    <div>
                      <p className="text-white font-black text-lg">Top 10% Talent Badge</p>
                      <p className="text-white/60 text-sm">Recognized for excellence in React & UI Design</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
                  Accelerate Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandViolet via-brandMagenta to-white">Professional Journey</span>
                </h2>
                <p className="text-xl text-slate-400 font-medium">
                  No more "entry-level" paradox. Get the experience you need by working on real projects for real companies.
                </p>
              </div>

              <div className="grid gap-8">
                {[
                  { title: "Exclusive Talent Pool", desc: "Gain access to roles not listed on public job boards." },
                  { title: "Automated CV Enhancement", desc: "Our tool helps you highlight what recruiters actually care about." },
                  { title: "Network Building", desc: "Connect with mentors and industry leaders in your field." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-brandMagenta/50 transition-colors">
                      <FiCheckCircle className="w-7 h-7 text-brandMagenta" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white mb-2">{item.title}</h4>
                      <p className="text-slate-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/register" className="inline-flex items-center gap-2 text-brandMagenta font-black text-lg group">
                  Start Your Profile <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOR COMPANIES --- */}
      <section id="companies" className="py-32 bg-white dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-24">
            <div className="w-full lg:w-1/2 relative group">
              <div className="absolute -inset-4 bg-brandMagenta/10 dark:bg-brandMagenta/20 rounded-[60px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative rounded-[48px] overflow-hidden border border-slate-100 dark:border-slate-800 p-2 shadow-2xl bg-white dark:bg-slate-900 transition-colors duration-500">
                <img
                  src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                  alt="Company Collaboration"
                  className="rounded-[40px] w-full h-[640px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="w-full lg:w-1/2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-black text-brandNavy dark:text-white leading-tight transition-colors">
                  Hire the <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandMagenta to-brandViolet">Innovators of Tomorrow</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-colors">
                  Access a verified pipeline of ambitious talent ready to make an immediate impact on your organization's growth.
                </p>
              </div>

              <div className="grid gap-8">
                {[
                  { title: "Frictionless Onboarding", desc: "Post an offer in 60 seconds. Our AI handles the first layer of screening." },
                  { title: "Verified Skillsets", desc: "Every student profile is verified with project links and university credentials." },
                  { title: "Scalable Recruitment", desc: "Manage 1 or 100 applications with our intuitive dashboard tools." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-14 h-14 bg-brandMagenta/5 dark:bg-brandMagenta/10 rounded-2xl flex items-center justify-center border border-brandMagenta/10 dark:border-brandMagenta/20 group-hover:bg-brandMagenta/10 dark:group-hover:bg-brandMagenta/20 transition-colors">
                      <FiCheckCircle className="w-7 h-7 text-brandMagenta" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-brandNavy dark:text-white mb-2 transition-colors">{item.title}</h4>
                      <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <Link to="/register-type" className="inline-flex items-center gap-2 text-brandViolet dark:text-brandViolet font-black text-lg group">
                  Build Your Talent Pipeline <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS (Carousel Feel) --- */}
      <section id="testimonials" className="py-32 bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-brandNavy dark:text-white mb-6 tracking-tight transition-colors">Success Stories</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium transition-colors">Real outcomes from real people in our community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                text: "The direct access to recruiters at top tech firms was something I couldn't find anywhere else. I landed my first DevOps role within a month.",
                name: "Alex Rivera",
                role: "Software Engineering Student",
                img: "https://i.pravatar.cc/150?img=11"
              },
              {
                text: "We needed fresh perspectives for our creative agency. TalentLink provided us with incredibly talented design students who hit the ground running.",
                name: "Jordan Smith",
                role: "Creative Director, Arise Digital",
                img: "https://i.pravatar.cc/150?img=33"
              },
              {
                text: "The AI recommendations were spot on. It matched me with a freelance project that perfectly utilized my niche skills in data science.",
                name: "Elena Petrova",
                role: "Data Science Student",
                img: "https://i.pravatar.cc/150?img=44"
              }
            ].map((review, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-950 rounded-[40px] p-12 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-inner-light hover:shadow-xl dark:hover:shadow-brandViolet/10 transition-all duration-300 relative group">
                <div className="text-brandMagenta mb-8 opacity-20">
                  <svg width="45" height="36" viewBox="0 0 45 36" fill="currentColor">
                    <path d="M13.4375 0C6.01406 0 0 6.01406 0 13.4375V36H18V13.5H9.0625C9.0625 11.0812 11.0188 9 13.4375 9V0ZM40.4375 0C33.0141 0 27 6.01406 27 13.4375V36H45V13.5H36.0625C36.0625 11.0812 38.0188 9 40.4375 9V0Z" />
                  </svg>
                </div>
                <p className="text-xl text-slate-700 dark:text-slate-300 font-bold italic mb-10 leading-relaxed relative z-10 transition-colors">"{review.text}"</p>
                <div className="flex items-center gap-5 mt-auto">
                  <img src={review.img} className="w-16 h-16 rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" alt={review.name} />
                  <div>
                    <h4 className="font-black text-brandNavy dark:text-white text-lg transition-colors">{review.name}</h4>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FINAL CTA (Ultra Dynamic) --- */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-5xl md:text-8xl font-black text-white mb-10 leading-none tracking-tighter">
            Your Future <br /> Starts <span className="text-brandNavy">Today.</span>
          </h2>
          <p className="text-2xl text-white/80 font-medium mb-16 max-w-2xl mx-auto">
            Don't wait for opportunity. Create it on TalentLink.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/register-type" className="px-12 py-6 bg-white text-brandNavy text-xl font-black rounded-3xl hover:scale-105 transition-all duration-300 shadow-2xl">
              Create Free Account
            </Link>

          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-20 opacity-10">
          <FiZap className="w-96 h-96 text-white rotate-12" />
        </div>
      </section>

      {/* --- FOOTER (Dark & Structured) --- */}
      <footer className="bg-brandNavy text-slate-400 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-4 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center">
                  <FiZap className="text-white w-6 h-6" />
                </div>
                <span className="text-3xl font-black text-white tracking-tight">TalentLink</span>
              </div>
              <p className="text-lg font-medium leading-relaxed max-w-sm">
                The modern standard for student career development and enterprise talent acquisition.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brandMagenta/20 hover:border-brandMagenta/50 transition-all cursor-pointer">
                    <div className="w-5 h-5 bg-white/40 rounded-full"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-black text-lg uppercase tracking-widest">Platform</h4>
              <ul className="space-y-4 font-bold">
                <li><a href="#" className="hover:text-white transition-colors">For Students</a></li>
                <li><a href="#" className="hover:text-white transition-colors">For Companies</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Matcher</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>

            <div className="md:col-span-2 space-y-6">
              <h4 className="text-white font-black text-lg uppercase tracking-widest">Company</h4>
              <ul className="space-y-4 font-bold">
                <li><a href="#" className="hover:text-white transition-colors">Our Vision</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press Kit</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 space-y-8">
              <h4 className="text-white font-black text-lg uppercase tracking-widest">Stay Connected</h4>
              <p className="font-medium">Get the latest career opportunities delivered to your inbox.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email address" className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 w-full focus:outline-none focus:border-brandMagenta/50 transition-colors" />
                <button className="bg-brand-gradient p-4 rounded-2xl text-white font-black hover:scale-105 transition-transform">
                  <FiArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="font-bold">&copy; {new Date().getFullYear()} TalentLink Global. All rights reserved.</p>
            <div className="flex gap-10 font-bold text-sm">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
              <a href="#" className="hover:text-white">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}