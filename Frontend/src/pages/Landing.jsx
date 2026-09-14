import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";
import LoginModal from "../components/LoginModel";
import logo from "../assets/FullLogo.jpg"
import api from "../services/api";

/*
==================================================
 LANDING PAGE
==================================================
 - Stitch design preserved
 - Login opens as modal
 - Register uses React Router
 - Smooth section navigation
 - Landing statistics prepared for Django API
 - No random/fake real-time values
*/

// --------------------------------------------------
// Temporary values until Django stats API is ready
// --------------------------------------------------
const DEFAULT_STATS = {
  accuracy: "—",
  factors: "—",
  students: "—",
  interventionRate: "—",
  totalStudents: "—",
  avgPerformance: "—",
  attendanceRate: "—",
  onTrackRate: "—",
};


// --------------------------------------------------
// Feature cards
// --------------------------------------------------
const FEATURES = [
  {
    icon: "query_stats",
    color: "primary",
    title: "Student Performance Prediction",
    description:
      "Predict future academic performance using machine learning. Early warnings detect potential drop-offs before midterm examinations.",
  },
  {
    icon: "analytics",
    color: "secondary",
    title: "Academic Analytics",
    description:
      "Analyze marks, attendance, assignments, exams, and study hours with granular diagnostic breakdowns.",
  },
  {
    icon: "timeline",
    color: "tertiary",
    title: "Performance Tracking",
    description:
      "Track student performance over time with growth metrics, benchmarks, and trajectory modeling.",
  },
  {
    icon: "bar_chart",
    color: "primary",
    title: "Visual Analytics",
    description:
      "Interactive charts and visual reports designed for quick and intuitive interpretation.",
  },
  {
    icon: "assignment_ind",
    color: "secondary",
    title: "Teacher Dashboard",
    description:
      "Help teachers monitor classes and identify students who need targeted intervention.",
  },
  {
    icon: "account_balance",
    color: "tertiary",
    title: "Principal Dashboard",
    description:
      "Provide high-level institutional oversight across grades, departments, and performance indicators.",
  },
];


// --------------------------------------------------
// Workflow steps
// --------------------------------------------------
const WORKFLOW = [
  {
    number: "01",
    icon: "upload_file",
    color: "primary",
    title: "Enter Student Data",
    description:
      "Import attendance, test results, assignments, and academic data through the platform.",
  },
  {
    number: "02",
    icon: "tune",
    color: "secondary",
    title: "Analyze Data",
    description:
      "The system cleans, processes, and analyzes academic features.",
  },
  {
    number: "03",
    icon: "psychology",
    color: "primary",
    title: "AI Predicts Performance",
    description:
      "Machine learning models predict future performance and identify risk patterns.",
  },
  {
    number: "04",
    icon: "how_to_reg",
    color: "tertiary",
    title: "Take Better Decisions",
    description:
      "Use predictive insights to provide targeted academic support.",
  },
];


// --------------------------------------------------
// Role cards
// --------------------------------------------------
const ROLES = [
  {
    icon: "school",
    color: "primary",
    label: "Learner View",
    title: "Student",
    description:
      "Direct access to individual growth diagnostics and predictive milestones.",
    features: [
      "View personal profile and milestones",
      "Track ongoing academic performance",
      "View predicted exam outcomes",
      "Analyze performance history",
      "Download term progress reports",
    ],
  },
  {
    icon: "co_present",
    color: "secondary",
    label: "Classroom View",
    title: "Teacher",
    featured: true,
    description:
      "Real-time classroom monitoring and active early-intervention workflows.",
    features: [
      "Manage classrooms and student cohorts",
      "Enter marks and attendance",
      "Run AI predictions",
      "Monitor cohort performance",
      "Access subject-level analytics",
    ],
  },
  {
    icon: "corporate_fare",
    color: "tertiary",
    label: "Executive View",
    title: "Principal",
    description:
      "Macro-level institutional governance, staff coordination, and analytics.",
    features: [
      "Monitor campus academic metrics",
      "Evaluate grade-level analytics",
      "Analyze attendance patterns",
      "Compare prediction validity",
      "Generate institutional reports",
    ],
  },
];


// --------------------------------------------------
// Reusable icon
// --------------------------------------------------
function Icon({ children, className = "" }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>
      {children}
    </span>
  );
}


// --------------------------------------------------
// Landing component
// --------------------------------------------------
export default function Landing() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [statsLoading, setStatsLoading] = useState(true);


  // ------------------------------------------------
  // Load landing statistics
  // ------------------------------------------------
  useEffect(() => {
    let active = true;

    /*
      Backend endpoint will be:

      GET /api/public/stats/

      Example response:

      {
        "accuracy": "94.8%",
        "factors": "35+",
        "students": "120,000+",
        "interventionRate": "42%",
        "totalStudents": "1480",
        "avgPerformance": "84.6%",
        "attendanceRate": "95.2%",
        "onTrackRate": "91.8%"
      }

      We will connect this properly after the backend
      statistics API is created.
    */

    const loadStats = async () => {
      try {
        const response = await api.get("public/stats/");
        if (active) setStats(response.data);
      } catch (error) {
        console.error("Failed to load landing statistics:", error);
      } finally {
        if (active) setStatsLoading(false);
      }
    };

    loadStats();

    return () => {
      active = false;
    };
  }, []);


  // ------------------------------------------------
  // Scroll reveal animation
  // ------------------------------------------------
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);


  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">

      {/* ==================================================
          LOGIN MODAL
      ================================================== */}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}


      {/* ==================================================
          HEADER
      ================================================== */}
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop flex items-center justify-between">

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-space-sm bg-transparent border-0 p-0 cursor-pointer"
          >
            <div className="logo-placeholder logo-mark">
              <Icon className="text-primary text-[25px]">
                <img src={logo} alt="" />
              </Icon>
            </div>

            <span className="brand-name">
              Student Performance AI
            </span>
          </button>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-space-xl">
            <a href="#home" className="nav-link active">
              Home
            </a>

            <a href="#features" className="nav-link">
              Features
            </a>

            <a href="#how-it-works" className="nav-link">
              How It Works
            </a>

            <a href="#about" className="nav-link">
              About
            </a>
          </nav>


          {/* Header actions */}
          <div className="flex items-center gap-space-sm no-underline">

            <button
              type="button"
              className="login-button font-label-md text-label-md"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="inline-flex items-center justify-center px-space-lg py-space-xs rounded-2 btn-primary bg-primary-container text-white font-label-md text-label-md shadow-md border-0 cursor-pointer"
            >
              Get Started
            </button>

            <div className="hidden sm:flex w-8 h-8 rounded-full bg-primary items-center justify-center">
              <Icon className="text-on-primary text-[18px]">
                person
              </Icon>
            </div>

          </div>
        </div>
      </header>


      {/* ==================================================
          MAIN
      ================================================== */}
      <main className="w-full flex-1">


        {/* ==================================================
            HERO
        ================================================== */}
        <section
          id="home"
          className="relative overflow-hidden bg-background py-10 md:py-12 reveal"
        >
          <div className="hero-glow" />

          <div className="relative max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">

              {/* Hero text */}
              <div className="lg:col-span-6 flex flex-col items-start gap-space-md">

                <div className="inline-flex items-center gap-space-xs px-space-sm py-space-2xs rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm shadow-sm">
                  <Icon className="text-secondary text-[16px]">
                    auto_awesome
                  </Icon>

                  <span>
                    Next-Gen Educational Intelligence • Powered by Predictive AI
                  </span>
                </div>


                <h1 className="headline-text font-display-lg text-display-lg tracking-tight leading-none">
                  Predict. Understand.
                  <br className="hidden sm:inline" />

                  <span>
                    Improve Student Performance.
                  </span>
                </h1>


                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                  An AI-powered platform that analyzes academic performance,
                  attendance, study habits, and assessment data to predict
                  student outcomes and help educators make better decisions.
                </p>


                <div className="flex flex-wrap items-center gap-space-sm pt-space-xs no-underline">

                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-2 btn-primary bg-primary-container text-white font-label-md shadow-md border-0 cursor-pointer fw-bold"
                  >
                    <span>Get Started</span>
                    <Icon className="text-[18px]">
                      arrow_forward
                    </Icon>
                  </button>


                  <a
                    href="#how-it-works"
                    className="see-how-it-work"
                  >
                    <Icon className="text-primary text-[18px]">
                      play_circle
                    </Icon>

                    <span>See How It Works</span>
                  </a>

                </div>


                {/* Dynamic trust metrics */}
                <div className="flex flex-wrap items-center gap-space-xs text-on-surface-variant font-label-md">
                  <span className="text-primary font-semibold">
                    ⚡ Data-driven academic intelligence
                  </span>

                  <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />

                  <span>
                    {statsLoading ? "Loading statistics..." : "Live platform statistics"}
                  </span>
                </div>

              </div>


              {/* Hero dashboard preview */}
              <div className="lg:col-span-6 w-full">
                <div className="relative bg-surface-container-lowest p-space-lg rounded-xl shadow-xl">

                  <div className="flex items-center justify-between gap-space-sm pb-space-md">

                    <div className="flex flex-col">
                      <span className="font-label-sm text-outline uppercase tracking-wider">
                        Student Academic Forecast
                      </span>

                      <span className="font-title-md text-on-surface font-bold">
                        Performance Overview
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-tertiary/10 text-tertiary font-label-sm font-semibold">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      AI Analysis
                    </div>

                  </div>


                  <div className="grid grid-cols-2 gap-space-md p-space-md bg-surface-container-low rounded-lg mb-space-md">

                    <div>
                      <span className="font-label-sm text-on-surface-variant">
                        Prediction Accuracy
                      </span>

                      <div className="font-metric-val text-on-surface mt-space-2xs">
                        {stats.accuracy}
                      </div>

                      <div className="text-tertiary font-label-sm mt-space-2xs">
                        Machine Learning
                      </div>
                    </div>


                    <div className="border-l border-surface-container pl-space-md">
                      <span className="font-label-sm text-on-surface-variant">
                        Academic Factors
                      </span>

                      <div className="font-metric-val text-secondary mt-space-2xs">
                        {stats.factors}
                      </div>

                      <div className="text-secondary font-label-sm mt-space-2xs">
                        Multi-factor analysis
                      </div>
                    </div>

                  </div>


                  <div className="grid grid-cols-3 gap-space-xs text-center">

                    <div className="bg-surface-container-low p-space-xs rounded-lg">
                      <div className="font-label-sm text-on-surface-variant">
                        Students
                      </div>

                      <div className="font-title-md text-on-surface font-semibold">
                        {stats.students}
                      </div>
                    </div>


                    <div className="bg-surface-container-low p-space-xs rounded-lg">
                      <div className="font-label-sm text-on-surface-variant">
                        Attendance
                      </div>

                      <div className="font-title-md text-on-surface font-semibold">
                        {stats.attendanceRate}
                      </div>
                    </div>


                    <div className="bg-surface-container-low p-space-xs rounded-lg">
                      <div className="font-label-sm text-on-surface-variant">
                        On Track
                      </div>

                      <div className="font-title-md text-on-surface font-semibold">
                        {stats.onTrackRate}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>


        {/* ==================================================
            PLATFORM STATISTICS
        ================================================== */}
        <section className="w-full bg-surface-container-low py-10 md:py-12 reveal">

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">

              {[
                {
                  icon: "model_training",
                  label: "Ensemble AI",
                  value: stats.accuracy,
                  title: "AI Powered Predictions",
                  description: "Model performance based on trained prediction models.",
                  color: "primary",
                },
                {
                  icon: "hub",
                  label: "Holistic",
                  value: stats.factors,
                  title: "Academic Factors",
                  description: "Marks, attendance, study habits, and assessment data.",
                  color: "secondary",
                },
                {
                  icon: "monitoring",
                  label: "Active Cohort",
                  value: stats.students,
                  title: "Students Tracked",
                  description: "Current students available in the platform.",
                  color: "tertiary",
                },
                {
                  icon: "crisis_alert",
                  label: "Impact",
                  value: stats.interventionRate,
                  title: "Early Intervention Rate",
                  description: "Students identified for additional academic support.",
                  color: "primary",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-space-lg bg-surface-container-lowest card rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-space-md">
                    <span className={`icon-box ${item.color}`}>
                      <Icon>{item.icon}</Icon>
                    </span>

                    <span className={`metric-label ${item.color}`}>
                      {item.label}
                    </span>
                  </div>

                  <div className="font-metric-val text-on-surface">
                    {item.value}
                  </div>

                  <div className="font-title-md text-on-surface font-semibold mt-space-2xs">
                    {item.title}
                  </div>

                  <p className="font-body-sm text-on-surface-variant mt-space-xs">
                    {item.description}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </section>


        {/* ==================================================
            FEATURES
        ================================================== */}
        <section
          id="features"
          className="w-full bg-background py-10 md:py-12 reveal"
        >

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="section-heading">
              <span className="section-label">
                Comprehensive Intelligence Platform
              </span>

              <h2>
                Everything You Need to Understand Student Performance
              </h2>

              <p>
                Purpose-built ML pipelines designed for educators,
                administrators, and learners.
              </p>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">

              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="p-space-lg bg-surface-container-lowest card rounded-xl shadow-sm"
                >
                  <div className={`feature-icon ${feature.color}`}>
                    <Icon>{feature.icon}</Icon>
                  </div>

                  <h3 className="font-headline-sm text-on-surface">
                    {feature.title}
                  </h3>

                  <p className="font-body-md text-on-surface-variant mt-space-xs">
                    {feature.description}
                  </p>
                </div>
              ))}

            </div>

          </div>
        </section>


        {/* ==================================================
            HOW IT WORKS
        ================================================== */}
        <section
          id="how-it-works"
          className="w-full bg-surface-container-low py-10 md:py-12 reveal"
        >

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="section-heading">
              <span className="section-label">
                Simple &amp; Seamless Workflow
              </span>

              <h2>
                From Raw Academic Data to Actionable Insights
              </h2>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">

              {WORKFLOW.map((step) => (
                <div
                  key={step.number}
                  className="bg-surface-container-lowest p-space-lg card rounded-xl shadow-sm"
                >

                  <div className="flex items-center justify-between mb-space-md">

                    <span className={`step-number ${step.color}`}>
                      {step.number}
                    </span>

                    <div className={`step-icon ${step.color}`}>
                      <Icon>{step.icon}</Icon>
                    </div>

                  </div>

                  <h4 className="font-headline-sm text-on-surface">
                    {step.title}
                  </h4>

                  <p className="font-body-sm text-on-surface-variant mt-space-xs">
                    {step.description}
                  </p>

                </div>
              ))}

            </div>

          </div>
        </section>


        {/* ==================================================
            MACHINE LEARNING
        ================================================== */}
        <section className="w-full bg-inverse-surface text-inverse-on-surface py-10 md:py-12 reveal">

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="max-w-3xl mb-space-xl">

              <span className="inline-flex items-center gap-space-2xs px-space-xs py-space-2xs rounded-full bg-secondary text-on-secondary font-label-sm">
                <Icon className="text-[14px]">bolt</Icon>
                Algorithmic Precision
              </span>

              <h2 className="font-headline-lg text-inverse-on-surface mt-space-sm">
                Powered by Machine Learning
              </h2>

              <p className="font-body-md text-outline-variant mt-space-xs">
                The system can use Linear Regression, Decision Tree,
                and Random Forest models to analyze academic performance
                and generate predictions.
              </p>

            </div>


            <div className="model-table-wrapper">

              <table className="w-full text-left">

                <thead>
                  <tr>
                    <th>MODEL</th>
                    <th>PURPOSE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>
                    <td>Linear Regression</td>
                    <td>Baseline prediction</td>
                    <td>Available</td>
                  </tr>

                  <tr>
                    <td>Decision Tree</td>
                    <td>Non-linear analysis</td>
                    <td>Available</td>
                  </tr>

                  <tr className="model-highlight">
                    <td>Random Forest</td>
                    <td>Ensemble prediction</td>
                    <td>Production Model</td>
                  </tr>

                </tbody>

              </table>

            </div>

          </div>
        </section>


        {/* ==================================================
            ROLES
        ================================================== */}
        <section className="w-full bg-background py-10 md:py-12 reveal">

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="section-heading">

              <span className="section-label">
                Tailored Experience
              </span>

              <h2>
                Built for Every Role in Education
              </h2>

              <p>
                Permission-controlled views designed for each stakeholder.
              </p>

            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">

              {ROLES.map((role) => (
                <div
                  key={role.title}
                  className={`p-space-xl bg-surface-container-lowest card rounded-xl shadow-sm ${
                    role.featured ? "card-featured" : ""
                  }`}
                >

                  {role.featured && (
                    <div className="popular-badge">
                      Most Popular
                    </div>
                  )}

                  <div className="flex justify-between items-center mb-space-md">

                    <div className={`feature-icon ${role.color}`}>
                      <Icon>{role.icon}</Icon>
                    </div>

                    <span className={`role-label ${role.color}`}>
                      {role.label}
                    </span>

                  </div>

                  <h3 className="font-headline-sm text-on-surface">
                    {role.title}
                  </h3>

                  <p className="font-body-sm text-on-surface-variant mt-space-2xs mb-space-md">
                    {role.description}
                  </p>

                  <ul className="role-list">

                    {role.features.map((feature) => (
                      <li key={feature}>
                        <Icon className={`text-${role.color} text-[18px]`}>
                          check_circle
                        </Icon>

                        <span>{feature}</span>
                      </li>
                    ))}

                  </ul>

                </div>
              ))}

            </div>

          </div>
        </section>


        {/* ==================================================
            ANALYTICS PREVIEW
        ================================================== */}
        <section className="w-full bg-surface-container-low py-10 md:py-12 reveal">

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="section-heading">

              <span className="section-label">
                Live Interface
              </span>

              <h2>
                An Enterprise-Grade Analytics Workspace
              </h2>

              <p>
                Real-time cohort views, performance analytics,
                and predictive insights inside one workspace.
              </p>

            </div>


            <div className="bg-surface-container-lowest rounded-xl shadow-xl p-space-md md:p-space-xl">

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">

                {[
                  ["Total Students", stats.totalStudents],
                  ["Average Performance", stats.avgPerformance],
                  ["Attendance Rate", stats.attendanceRate],
                  ["Predicted On-Track Rate", stats.onTrackRate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="p-space-md bg-surface-container-low rounded-lg"
                  >
                    <div className="font-label-sm text-on-surface-variant">
                      {label}
                    </div>

                    <div className="font-metric-val text-on-surface mt-space-xs">
                      {value}
                    </div>
                  </div>
                ))}

              </div>


              <div className="analytics-placeholder mt-space-lg">
                <Icon className="text-primary text-[42px]">
                  analytics
                </Icon>

                <h3 className="font-headline-sm text-on-surface mt-space-sm">
                  Performance Analytics
                </h3>

                <p className="font-body-sm text-on-surface-variant mt-space-xs">
                  This section will display real student analytics
                  after the backend and ML APIs are connected.
                </p>
              </div>

            </div>

          </div>
        </section>


        {/* ==================================================
            CTA
        ================================================== */}
        <section className="w-full bg-background py-10 md:py-12 reveal">

          <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop">

            <div className="cta-section">

              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-space-md">
                <Icon className="text-[32px]">
                  auto_graph
                </Icon>
              </div>

              <h2 className="font-headline-lg text-on-surface max-w-3xl">
                Make Better Decisions with Student Performance Data
              </h2>

              <p className="font-body-lg text-on-surface-variant max-w-2xl mt-space-sm">
                Use AI-powered predictions and analytics to understand
                student performance and improve academic outcomes.
              </p>


              <div className="flex flex-wrap items-center justify-center gap-space-sm mt-space-lg">

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="inline-flex items-center gap-space-xs px-space-xl py-space-sm rounded-2 btn-primary bg-primary-container text-white font-label-md shadow-md border-0 cursor-pointer fw-bold"
                >
                  Get Started Now
                  <Icon className="text-[18px]">
                    arrow_forward
                  </Icon>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("how-it-works")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center px-space-xl py-space-sm rounded-2 btn-secondary bg-surface-container-lowest text-on-surface font-label-md shadow-sm border-0 cursor-pointer fw-bold"
                >
                  See How It Works
                </button>

              </div>

            </div>

          </div>
        </section>

      </main>


{/* ==================================================
          FOOTER
      ================================================== */}
      <footer
        id="about"
        className="w-full bg-surface-container-lowest shadow-[0_-1px_8px_rgba(0,0,0,0.02)]"
      >
        <a href="#home" className="footer-brand-gradient font-title-md font-semibold">
          Student Performance AI
        </a>
        <div className="max-w-container-max mx-auto px-gutter-mobile md:px-gutter-desktop py-space-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl pb-space-xl">


            <div className="md:col-span-2">

              <p className="font-body-sm text-on-surface-variant max-w-sm mt-5">
                Empowering educators and academic institutions with
                intelligent predictive analytics and clear student
                performance insights.
              </p>

              {/* Social links */}
              {/* Social Links */}
              <div className="footer-social-links">
                
                {/* GitHub */}
                <a
                  href="https://github.com/Patil-shivam007"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon github-icon"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.11.79-.25.79-.56v-2.18
                      c-3.22.7-3.9-1.37-3.9-1.37-.53-1.35-1.29-1.71-1.29-1.71
                      -1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2
                      1.04 1.78 2.72 1.27 3.38.97.1-.75.41-1.27.74-1.56
                      -2.57-.29-5.27-1.29-5.27-5.74 0-1.27.45-2.31 1.2-3.13
                      -.12-.3-.52-1.49.11-3.1 0 0 .98-.31 3.2 1.19a11.1
                      11.1 0 0 1 5.82 0c2.22-1.5 3.2-1.19 3.2-1.19
                      .63 1.61.23 2.8.11 3.1.75.82 1.2 1.86 1.2 3.13
                      0 4.46-2.71 5.44-5.29 5.73.42.36.79 1.08.79 2.18v3.22
                      c0 .31.21.68.8.56A11.5 11.5 0 0 0 12 .5Z"
                    />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon linkedin-icon"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5.2 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM3.4
                      9h3.6v11.5H3.4V9Zm5.7 0h3.45v1.57h.05c.48-.9 1.64-1.85
                      3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.32h-3.6v-5.6
                      c0-1.34-.03-3.06-1.98-3.06-1.98 0-2.28 1.46-2.28
                      2.96v5.7H9.1V9Z"
                    />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon instagram-icon"
                  aria-label="Instagram"
                  title="Instagram"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="17.4" cy="6.7" r="1.1" />
                  </svg>
                </a>

                {/* Email */}
                <a
                  href="mailto:your-email@gmail.com"
                  className="social-icon email-icon"
                  aria-label="Email"
                  title="Email"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="m4.5 7 7.5 6 7.5-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>

              </div>

            </div>


            <div>
              <h4 className="footer-heading">
                Platform
              </h4>

              <ul className="footer-links">
                <li><a href="#features">Predictions</a></li>
                <li><a href="#features">Analytics</a></li>
                <li><a href="#features">Dashboards</a></li>
                <li><a href="#how-it-works">How It Works</a></li>
              </ul>
            </div>


            <div>
              <h4 className="footer-heading">
                Company
              </h4>

              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#about">Privacy</a></li>
                <li><a href="#about">Terms</a></li>
                <li><a href="#about">AI Ethics</a></li>
              </ul>
            </div>

          </div>
            <div className="creator-section">
              <div className="creator-header">
                <span className="creator-label">CRAFTED WITH</span>
                <span className="creator-dot"></span>
                <span className="creator-label">BY</span>
              </div>

              <div className="creator-card">
                <div className="creator-icon">
                  <Icon className="creator-code-icon">code</Icon>
                </div>

                <div className="creator-content">
                  <span className="creator-caption">Designed & Developed by</span>

                  <div className="creator-names">
                    <span className="creator-name-gradient">Shivam Patil</span>
                    <span className="creator-amp">&</span>
                    <span className="creator-name-gradient creator-name-gradient-alt">
                      Raman Patil
                    </span>
                  </div>
                </div>
              </div>
            </div>
          <div className="footer-bottom">
            <p>
              © 2026 Student Performance AI. All rights reserved.
            </p>

            <span>
              Built with Django • React • Machine Learning
            </span>
          </div>
        </div>
      </footer>
  </div>
  );
}