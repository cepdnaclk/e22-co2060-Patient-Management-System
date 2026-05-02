import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Updated to react-router-dom
import { useAuth } from "../features/auth/AuthContext.jsx"; // Adjust path if your Home.jsx is in a different folder

const Home = () => {
  // 1. Pull in the auth context and navigation hook
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // 2. Redirect logged-in users to their specific dashboards
  useEffect(() => {
    if (isLoggedIn && user?.role) {
      switch (user.role) {
        case "SUPER_ADMIN":
          navigate("/dashboard/super-admin");
          break;
        case "ADMIN":
          navigate("/dashboard/admin");
          break;
        case "DOCTOR":
          navigate("/dashboard/doctor");
          break;
        case "NURSE":
          navigate("/dashboard/nurse");
          break;
        case "PATIENT":
          navigate("/dashboard/patient");
          break;
        default:
          navigate("/"); // Fallback
      }
    }
  }, [isLoggedIn, user, navigate]);

  // 3. Prevent the page from flashing the "Login" buttons before redirecting
  if (isLoggedIn) return null;

  // 4. Standard public Home page for logged-out users
  return (
    <section className="flex flex-col items-center px-4">
      <h1 className="pt-16 sm:pt-20 text-center text-slate-800 text-3xl sm:text-4xl md:text-5xl/16 font-semibold max-w-3xl leading-tight bg-clip-text my-2.5">
        Patient{" "}
        <span className="bg-linear-to-r from-indigo-600 to-pink-400 bg-clip-text text-transparent">
          Management
        </span>{" "}
        System
      </h1>
      <p className="text-center text-sm sm:text-base text-gray-600 max-w-xl">
        From registration to reporting — everything healthcare teams need in one
        secure system.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-5 justify-center z-1 w-full sm:w-auto">
        <NavLink
          to="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md cursor-pointer w-full sm:w-auto text-center"
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className="flex items-center justify-center gap-2 text-indigo-600 border border-indigo-600 hover:bg-indigo-50/50 px-6 py-3 rounded-md active:scale-95 transition cursor-pointer w-full sm:w-auto"
        >
          Sign Up
        </NavLink>
      </div>

      <div className="relative mt-10 sm:mt-12 w-full max-w-4xl">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-full h-full bg-[#d7bef4] blur-[100px] opacity-70 z-0"></div>
        <img
          className="relative z-1 w-full object-cover object-top"
          src="/heroimg.jpg"
          alt=""
        />
      </div>
    </section>
  );
};

export default Home;
