import React from "react";
import { NavLink } from "react-router";
const Home = () => {
  return (
    <section className="flex flex-col items-center">
      <h1 className="pt-20 text-center text-slate-800 text-4xl md:text-5xl/16 font-semibold max-w-3xl leading-tight bg-clip-text my-2.5 px-4">
        Patient{" "}
        <span className="bg-linear-to-r from-indigo-600 to-pink-400 bg-clip-text text-transparent">
          Management
        </span>{" "}
        System
      </h1>
      <p className="text-center text-base text-gray-600 max-w-md px-4">
        From registration to reporting — everything healthcare teams need in one
        secure system.
      </p>

      <div className="flex items-center gap-4 mt-5 justify-center z-1">
        <NavLink
          to="/login"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md cursor-pointer"
        >
          Login
        </NavLink>
        <NavLink
          to="/signup"
          className="flex items-center gap-2 text-indigo-600 border border-indigo-600 hover:bg-indigo-50/50 px-6 py-3 rounded-md active:scale-95 transition cursor-pointer"
        >
          Sign Up
        </NavLink>
      </div>

      <div className="relative mt-12 w-full max-w-4xl px-4">
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
