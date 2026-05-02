import React from "react";
import { NavLink } from "react-router";
const Home = () => {
  return (
    <section className="flex flex-col items-center px-4">
      <h1 className="pt-16 sm:pt-20 text-center text-slate-800 text-3xl sm:text-4xl md:text-5xl/16 font-semibold max-w-3xl leading-tight tracking-tight bg-clip-text my-2.5">
        Patient{" "}
        <span className="bg-linear-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md cursor-pointer w-full sm:w-auto text-center"
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className="flex items-center justify-center gap-2 text-blue-600 border border-blue-600 hover:bg-blue-50/60 px-6 py-3 rounded-md active:scale-95 transition cursor-pointer w-full sm:w-auto"
        >
          Sign Up
        </NavLink>
      </div>

      <div className="relative mt-10 sm:mt-12 w-full max-w-5xl glass-card p-4 sm:p-6">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-full h-full bg-[#c6ddff] blur-[120px] opacity-80 z-0"></div>
        <img
          className="relative z-1 w-full rounded-2xl object-cover object-top"
          src="/heroimg.jpg"
          alt=""
        />
      </div>
    </section>
  );
};

export default Home;
