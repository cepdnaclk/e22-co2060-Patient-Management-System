import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext.jsx";
import {
  ArrowRight, ShieldCheck, Activity, Users, Pill,
  Calendar, FileText, CheckCircle, Star
} from "lucide-react";

/* ─── Data ──────────────────────────────────────────────────────── */
const features = [
  {
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    title: "Patient Records",
    desc: "Centralised, real-time health records with complete audit trails and instant retrieval.",
  },
  {
    icon: Calendar,
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-900/20",
    title: "Appointments",
    desc: "Intelligent scheduling with conflict detection, automated reminders, and calendar sync.",
  },
  {
    icon: Pill,
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    title: "Pharmacy",
    desc: "End-to-end prescription management, stock alerts, and dispensing workflow integration.",
  },
  {
    icon: FileText,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-900/20",
    title: "Lab Reports",
    desc: "Digital lab results linked directly to patient profiles with trend visualisation.",
  },
  {
    icon: ShieldCheck,
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-900/20",
    title: "Security & Compliance",
    desc: "Role-based access control, encryption at rest, and full audit logging.",
  },
  {
    icon: Activity,
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    title: "Analytics",
    desc: "Real-time dashboards with operational metrics, patient trends, and staff performance.",
  },
];

const testimonials = [
  {
    quote: "PatientMS transformed our clinic workflow. Appointment times dropped by 40% in the first month.",
    author: "Dr. Nimal Perera",
    role: "Chief Medical Officer",
    initials: "NP",
    color: "bg-blue-600",
  },
  {
    quote: "The pharmacy module alone saved us hours every day. Outstanding system.",
    author: "Priya Jayawardena",
    role: "Head Pharmacist",
    initials: "PJ",
    color: "bg-emerald-600",
  },
  {
    quote: "Finally, a system that our entire team — from admin to doctors — actually enjoys using.",
    author: "Kumari Silva",
    role: "Hospital Administrator",
    initials: "KS",
    color: "bg-violet-600",
  },
];

const stats = [
  { value: "10,000+", label: "Patients managed" },
  { value: "500+", label: "Clinicians onboard" },
  { value: "99.9%", label: "System uptime" },
  { value: "< 2s", label: "Average load time" },
];

/* ─── Component ─────────────────────────────────────────────────── */
const Home = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // Allow logged-in users to view the landing page without being forcefully redirected.
  // The NavbarLanding will display a 'Dashboard' link for them to return.

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Subtle dot/grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(to right, #64748b 1px, transparent 1px),
                              linear-gradient(to bottom, #64748b 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
        {/* Glow spot */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 dark:bg-blue-400/8 rounded-full blur-[120px]" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Healthcare Management Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.06] mb-6">
            The smarter way to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              manage patient care
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            From registration to reporting — everything your healthcare team needs
            in one secure, unified platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <NavLink
              to="/signup"
              className="group flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all active:scale-[0.97]"
            >
              Start for free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </NavLink>
            <NavLink
              to="/login"
              className="flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-600 shadow-sm transition-all active:scale-[0.97]"
            >
              Log in to portal
            </NavLink>
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-500 font-medium">
            {["No credit card required", "HIPAA compliant", "24/7 support"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* ── Hero mockup image ── */}
        <div className="relative max-w-5xl mx-auto mt-16 pb-8 px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900">
            {/* Browser chrome bar */}
            <div className="h-8 bg-slate-100 dark:bg-slate-800 flex items-center gap-1.5 px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            </div>
            <img
              src="/heroimg.jpg"
              alt="PatientMS Dashboard"
              className="w-full block object-cover object-top"
              style={{ transform: "none" }}
            />
          </div>
        </div>

      </section>
      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
              Everything your team needs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
              A complete, modular platform built for modern healthcare — from front desk to lab.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, color, bg, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 sm:p-16 relative overflow-hidden shadow-2xl shadow-blue-500/25">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative">
            <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">
              Ready to get started?
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-5 leading-tight">
              Join the healthcare teams
              <br />already using PatientMS
            </h2>
            <p className="text-blue-100 max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Set up your clinic in minutes. No complex installation, no IT team required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <NavLink
                to="/signup"
                className="group flex items-center gap-2 px-7 py-3.5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 shadow-lg transition-all active:scale-[0.97]"
              >
                Create free account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </NavLink>
              <NavLink
                to="/contact"
                className="px-7 py-3.5 text-sm font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all"
              >
                Contact sales
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-slate-900 dark:text-white text-sm">
              Patient<span className="text-blue-600">MS</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            © {new Date().getFullYear()} PatientMS. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-slate-500">
            <NavLink to="/about" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">About</NavLink>
            <NavLink to="/contact" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Contact</NavLink>
            <NavLink to="/faq" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">FAQ</NavLink>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
