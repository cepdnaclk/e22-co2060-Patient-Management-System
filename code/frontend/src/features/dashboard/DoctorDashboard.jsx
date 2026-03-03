import { useState, useEffect } from "react";
import Dashboard from "./DoctorDashboardComponents/Dashboard";
import PaitentList from "./DoctorDashboardComponents/Paitent";
import Pharmacy from "./DoctorDashboardComponents/Pharmacy";
import ReportAndAnalytics from "./DoctorDashboardComponents/ReportAndAnlytics";
import Profile from "./DoctorDashboardComponents/Profile";
import Records from "./DoctorDashboardComponents/Records";
import LabReports from "./DoctorDashboardComponents/labreport";
import { useAuth } from "../auth/AuthContext";
import { doctorDashboardService } from "../../services/doctorDashboardService";

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [customMenus, setCustomMenus] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [stats, setStats] = useState({
    patients: 0,
    appointmentsToday: 0,
    criticalAlerts: 0,
    records: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const addMenu = (e) => {
    e.preventDefault();
    const label = newMenuLabel.trim();
    if (!label) return;
    setCustomMenus((c) => [...c, label]);
    setNewMenuLabel("");
    setIsModalOpen(false);
  };

  const [section, setSection] = useState("dashboard");

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      if (!user?.id) {
        setLoadingDashboard(false);
        setDashboardError("Unable to identify logged in doctor.");
        return;
      }

      setLoadingDashboard(true);
      setDashboardError("");

      try {
        const data = await doctorDashboardService.getDashboardData(user.id);
        if (!isMounted) return;

        setDoctor(data.doctor);
        setStats(data.stats);
        setAppointments(data.appointments);
      } catch (error) {
        if (!isMounted) return;

        setDashboardError(
          error.response?.data?.message ||
            "Failed to load doctor dashboard data.",
        );
      } finally {
        if (isMounted) {
          setLoadingDashboard(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const dropdownToggle = document.getElementById("dropdownToggle");
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (!dropdownToggle || !dropdownMenu) return;

    function toggleDropdown(event) {
      event.stopPropagation();
      dropdownMenu.classList.toggle("hidden");
      dropdownMenu.classList.toggle("block");
    }

    function hideDropdown() {
      dropdownMenu.classList.add("hidden");
      dropdownMenu.classList.remove("block");
    }

    dropdownToggle.addEventListener("click", toggleDropdown);

    dropdownMenu.querySelectorAll(".dropdown-item").forEach((li) => {
      li.addEventListener("click", hideDropdown);
    });

    function onDocClick(event) {
      if (
        !dropdownMenu.contains(event.target) &&
        event.target !== dropdownToggle
      ) {
        hideDropdown();
      }
    }
    document.addEventListener("click", onDocClick);

    return () => {
      dropdownToggle.removeEventListener("click", toggleDropdown);
      document.removeEventListener("click", onDocClick);
      dropdownMenu.querySelectorAll(".dropdown-item").forEach((li) => {
        li.removeEventListener("click", hideDropdown);
      });
      hideDropdown();
    };
  }, []);

  return (
    <div>
      <div className="relative bg-[#f7f6f9] h-full min-h-screen">
        <div className="flex items-start">
          <nav id="sidebar" className="lg:min-w-67.5 w-max max-lg:min-w-8">
            <div
              id="sidebar-collapse-menu"
              class="bg-white shadow-lg h-screen fixed top-0 left-0 overflow-auto z-99 lg:min-w-62.5 lg:w-max max-lg:w-0 max-lg:invisible transition-all duration-500"
            >
              <div class="py-6 px-6">
                <ul class="space-y-2">
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("dashboard");
                      }}
                      class="menu-item text-green-800 text-[15px] font-medium flex items-center cursor-pointer bg-[#F0F8FF] hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-4.5 h-[18px] mr-3"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M19.56 23.253H4.44a4.051 4.051 0 0 1-4.05-4.05v-9.115c0-1.317.648-2.56 1.728-3.315l7.56-5.292a4.062 4.062 0 0 1 4.644 0l7.56 5.292a4.056 4.056 0 0 1 1.728 3.315v9.115a4.051 4.051 0 0 1-4.05 4.05zM12 2.366a2.45 2.45 0 0 0-1.393.443l-7.56 5.292a2.433 2.433 0 0 0-1.037 1.987v9.115c0 1.34 1.09 2.43 2.43 2.43h15.12c1.34 0 2.43-1.09 2.43-2.43v-9.115c0-.788-.389-1.533-1.037-1.987l-7.56-5.292A2.438 2.438 0 0 0 12 2.377z"
                          data-original="#000000"
                        />
                        <path
                          d="M16.32 23.253H7.68a.816.816 0 0 1-.81-.81v-5.4c0-2.83 2.3-5.13 5.13-5.13s5.13 2.3 5.13 5.13v5.4c0 .443-.367.81-.81.81zm-7.83-1.62h7.02v-4.59c0-1.933-1.577-3.51-3.51-3.51s-3.51 1.577-3.51 3.51z"
                          data-original="#000000"
                        />
                      </svg>
                      <span>Dashboard</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("profile");
                      }}
                      class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-4.5 h-[18px] mr-3"
                        viewBox="0 0 60.123 60.123"
                      >
                        <path
                          d="M57.124 51.893H16.92a3 3 0 1 1 0-6h40.203a3 3 0 0 1 .001 6zm0-18.831H16.92a3 3 0 1 1 0-6h40.203a3 3 0 0 1 .001 6zm0-18.831H16.92a3 3 0 1 1 0-6h40.203a3 3 0 0 1 .001 6z"
                          data-original="#000000"
                        />
                        <circle
                          cx="4.029"
                          cy="11.463"
                          r="4.029"
                          data-original="#000000"
                        />
                        <circle
                          cx="4.029"
                          cy="30.062"
                          r="4.029"
                          data-original="#000000"
                        />
                        <circle
                          cx="4.029"
                          cy="48.661"
                          r="4.029"
                          data-original="#000000"
                        />
                      </svg>
                      <span>Profile</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("records");
                      }}
                      class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 682.667 682.667"
                      >
                        <defs>
                          <clipPath id="a" clipPathUnits="userSpaceOnUse">
                            <path d="M0 512h512V0H0Z" data-original="#000000" />
                          </clipPath>
                        </defs>
                        <g
                          fill="none"
                          stroke="#000"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-miterlimit="10"
                          stroke-width="30"
                          clip-path="url(#a)"
                          transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                        >
                          <path
                            d="M368 170.3V45c0-16.57-13.43-30-30-30H45c-16.57 0-30 13.43-30 30v422c0 16.571 13.43 30 30 30h293c16.57 0 30-13.429 30-30V261.26"
                            data-original="#000000"
                          />
                          <path
                            d="m287.253 180.508 159.099 159.099c5.858 5.858 15.355 5.858 21.213 0l25.042-25.041c5.858-5.859 5.858-15.356 0-21.214L332.508 135.253l-84.853-39.599ZM411.703 304.958l45.255-45.255M80 400h224M80 320h176M80 240h128"
                            data-original="#000000"
                          />
                        </g>
                      </svg>
                      <span>Records</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("labreports");
                      }}
                      class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 507.246 507.246"
                      >
                        <path
                          d="M457.262 89.821c-2.734-35.285-32.298-63.165-68.271-63.165H68.5c-37.771 0-68.5 30.729-68.5 68.5V412.09c0 37.771 30.729 68.5 68.5 68.5h370.247c37.771 0 68.5-30.729 68.5-68.5V155.757c-.001-31.354-21.184-57.836-49.985-65.936zM68.5 58.656h320.492c17.414 0 32.008 12.261 35.629 28.602H68.5c-13.411 0-25.924 3.889-36.5 10.577v-2.679c0-20.126 16.374-36.5 36.5-36.5zM438.746 448.59H68.5c-20.126 0-36.5-16.374-36.5-36.5V155.757c0-20.126 16.374-36.5 36.5-36.5h370.247c20.126 0 36.5 16.374 36.5 36.5v55.838H373.221c-40.43 0-73.322 32.893-73.322 73.323s32.893 73.323 73.322 73.323h102.025v53.849c0 20.126-16.374 36.5-36.5 36.5zm36.5-122.349H373.221c-22.785 0-41.322-18.537-41.322-41.323s18.537-41.323 41.322-41.323h102.025z"
                          data-original="#000000"
                        />
                        <circle
                          cx="379.16"
                          cy="286.132"
                          r="16.658"
                          data-original="#000000"
                        />
                      </svg>
                      <span>Lab Reports</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("patientList");
                      }}
                      class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 64 64"
                      >
                        <path
                          d="M16.4 29.594a2.08 2.08 0 0 1 2.08-2.08h31.2a2.08 2.08 0 1 1 0 4.16h-31.2a2.08 2.08 0 0 1-2.08-2.08zm0 12.48a2.08 2.08 0 0 1 2.08-2.08h12.48a2.08 2.08 0 1 1 0 4.16H18.48a2.08 2.08 0 0 1-2.08-2.08z"
                          data-original="#000000"
                        />
                        <path
                          fill-rule="evenodd"
                          d="M.8 18.154c0-8.041 6.519-14.56 14.56-14.56v-1.04a2.08 2.08 0 1 1 4.16 0v1.04h10.4v-1.04a2.08 2.08 0 1 1 4.16 0v1.04h10.4v-1.04a2.08 2.08 0 1 1 4.16 0v1.04c8.041 0 14.56 6.519 14.56 14.56v30.16c0 8.041-6.519 14.56-14.56 14.56H15.36C7.319 62.874.8 56.355.8 48.314zm33.28-10.4h10.4v1.04a2.08 2.08 0 1 0 4.16 0v-1.04c5.744 0 10.4 4.656 10.4 10.4v30.16c0 5.744-4.656 10.4-10.4 10.4H15.36c-5.744 0-10.4-4.656-10.4-10.4v-30.16c0-5.744 4.656-10.4 10.4-10.4v1.04a2.08 2.08 0 1 0 4.16 0v-1.04h10.4v1.04a2.08 2.08 0 1 0 4.16 0z"
                          clip-rule="evenodd"
                          data-original="#000000"
                        />
                      </svg>
                      <span>Patients</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("pharmacy");
                      }}
                      class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 214.27 214.27"
                      >
                        <path
                          d="M196.926 55.171c-.11-5.785-.215-11.25-.215-16.537a7.5 7.5 0 0 0-7.5-7.5c-32.075 0-56.496-9.218-76.852-29.01a7.498 7.498 0 0 0-10.457 0c-20.354 19.792-44.771 29.01-76.844 29.01a7.5 7.5 0 0 0-7.5 7.5c0 5.288-.104 10.755-.215 16.541-1.028 53.836-2.436 127.567 87.331 158.682a7.495 7.495 0 0 0 4.912 0c89.774-31.116 88.368-104.849 87.34-158.686zm-89.795 143.641c-76.987-27.967-75.823-89.232-74.79-143.351.062-3.248.122-6.396.164-9.482 30.04-1.268 54.062-10.371 74.626-28.285 20.566 17.914 44.592 27.018 74.634 28.285.042 3.085.102 6.231.164 9.477 1.032 54.121 2.195 115.388-74.798 143.356z"
                          data-original="#000000"
                        />
                        <path
                          d="m132.958 81.082-36.199 36.197-15.447-15.447a7.501 7.501 0 0 0-10.606 10.607l20.75 20.75a7.477 7.477 0 0 0 5.303 2.196 7.477 7.477 0 0 0 5.303-2.196l41.501-41.5a7.498 7.498 0 0 0 .001-10.606 7.5 7.5 0 0 0-10.606-.001z"
                          data-original="#000000"
                        />
                      </svg>
                      <span>Pharmacy</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        class="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 64 64"
                      >
                        <path
                          d="M61.4 29.9h-6.542a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2h33.978a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2Zm-15.687 7.287A5.187 5.187 0 1 1 50.9 32a5.187 5.187 0 0 1-5.187 5.187ZM2.6 13.1h5.691a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2H26.571a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2Zm14.837-7.287A5.187 5.187 0 0 1 22.613 11a5.187 5.187 0 0 1-10.364 0 5.187 5.187 0 0 1 5.187-5.187ZM61.4 50.9H35.895a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2h15.015a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2Zm-34.65 7.287A5.187 5.187 0 1 1 31.937 53a5.187 5.187 0 0 1-5.187 5.187Z"
                          data-name="Layer 47"
                          data-original="#000000"
                        />
                      </svg>
                      <span>Settings</span>
                    </a>
                  </li>
                  {/* <li>
                  <a href="javascript:void(0)"
                    class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#d9f3ea] rounded-md px-3 py-3 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-[18px] h-[18px] mr-3"
                      viewBox="0 0 64 64">
                      <path
                        d="M32.667 5.11A25.116 25.116 0 0 0 32 5.045V2.88a2.08 2.08 0 1 0-4.16 0v2.165C15.027 6.102 4.96 16.837 4.96 29.92v18.5L3.47 52.8h-.59a2.08 2.08 0 1 0 0 4.16h54.08a2.08 2.08 0 1 0 0-4.16h-.59l-1.49-4.38v-9.568a18.585 18.585 0 0 1-4.16 1.209v8.703a2.08 2.08 0 0 0 .11.67l1.145 3.366H7.865l1.144-3.366a2.08 2.08 0 0 0 .111-.67V29.92c0-11.488 9.312-20.8 20.8-20.8.142 0 .285.001.426.004a18.7 18.7 0 0 1 2.32-4.014zM23.68 61.12a2.08 2.08 0 0 1 2.08-2.08h8.32a2.08 2.08 0 1 1 0 4.16h-8.32a2.08 2.08 0 0 1-2.08-2.08z"
                        data-original="#000000" />
                      <g fill-rule="evenodd" clip-rule="evenodd">
                        <path
                          d="M46.56 12.909c-4.221 0-7.627 3.434-7.627 7.651s3.406 7.651 7.627 7.651c4.22 0 7.626-3.434 7.626-7.651s-3.406-7.651-7.626-7.651zm-3.467 7.651c0-1.936 1.56-3.491 3.467-3.491 1.906 0 3.466 1.555 3.466 3.491s-1.56 3.491-3.466 3.491c-1.906 0-3.467-1.555-3.467-3.491z"
                          data-original="#000000" />
                        <path
                          d="M44.342 2.88a2.08 2.08 0 0 0-2.005 1.526l-.75 2.711a14.256 14.256 0 0 0-4.138 2.402l-2.709-.703a2.08 2.08 0 0 0-2.325.978l-2.218 3.86a2.08 2.08 0 0 0 .316 2.49l1.964 2.01a14.478 14.478 0 0 0 0 4.813l-1.965 2.009a2.08 2.08 0 0 0-.315 2.49l2.218 3.86a2.08 2.08 0 0 0 2.325.978l2.709-.702a14.256 14.256 0 0 0 4.139 2.402l.749 2.71a2.08 2.08 0 0 0 2.005 1.526h4.436a2.08 2.08 0 0 0 2.005-1.526l.75-2.71a14.257 14.257 0 0 0 4.14-2.402l2.706.702a2.08 2.08 0 0 0 2.326-.978l2.218-3.86a2.08 2.08 0 0 0-.316-2.49l-1.964-2.01a14.477 14.477 0 0 0 0-4.813l1.965-2.009a2.08 2.08 0 0 0 .315-2.49l-2.219-3.86a2.08 2.08 0 0 0-2.324-.978l-2.709.702a14.256 14.256 0 0 0-4.138-2.402l-.749-2.71a2.08 2.08 0 0 0-2.007-1.526zm.956 6.421.626-2.261h1.271l.627 2.261a2.08 2.08 0 0 0 1.446 1.45 10.098 10.098 0 0 1 4.38 2.544 2.08 2.08 0 0 0 1.983.532l2.257-.585.644 1.12-1.64 1.678a2.08 2.08 0 0 0-.528 1.971c.208.812.32 1.666.32 2.549s-.112 1.737-.32 2.549a2.08 2.08 0 0 0 .527 1.97l1.641 1.68-.644 1.12-2.257-.586a2.08 2.08 0 0 0-1.982.532 10.096 10.096 0 0 1-4.38 2.544 2.08 2.08 0 0 0-1.447 1.45l-.628 2.261h-1.272l-.624-2.261a2.08 2.08 0 0 0-1.447-1.45 10.097 10.097 0 0 1-4.38-2.544 2.08 2.08 0 0 0-1.983-.532l-2.257.585-.645-1.12 1.642-1.678a2.08 2.08 0 0 0 .527-1.971c-.208-.812-.32-1.666-.32-2.549s.112-1.737.32-2.548a2.08 2.08 0 0 0-.527-1.972l-1.642-1.678.645-1.12 2.257.585a2.08 2.08 0 0 0 1.982-.532 10.097 10.097 0 0 1 4.38-2.544 2.08 2.08 0 0 0 1.447-1.45z"
                          data-original="#000000" />
                      </g>
                    </svg>
                    <span>Notification Settings</span>
                  </a>
                </li>
                <li>
                  <a href="javascript:void(0)"
                    class="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#d9f3ea] rounded-md px-3 py-3 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="w-[18px] h-[18px] mr-3"
                      viewBox="0 0 32 32">
                      <path fill-rule="evenodd"
                        d="M20.063 7.94a3.96 3.96 0 0 1-5.342 3.713l2.362 2.815a6.601 6.601 0 1 0-7.24-8.627l2.364 2.818a3.96 3.96 0 1 1 7.856-.718zm-7.885 9.415L3.718 7.35A1.32 1.32 0 1 1 5.73 5.645l20.055 23.712a1.32 1.32 0 1 1-2.015 1.705l-2.03-2.401a8.886 8.886 0 0 1-2.645.4H13.11a8.886 8.886 0 0 1-8.886-8.886c0-.518.272-.993.747-1.198 1.095-.47 3.427-1.27 7.208-1.622zm7.634 9.025c-.235.026-.474.04-.716.04H13.11a6.248 6.248 0 0 1-6.184-5.362c1.35-.454 3.751-1.047 7.37-1.2zm-.347-9.072 2.476 2.95a21.397 21.397 0 0 1 3.34.8 6.204 6.204 0 0 1-.78 2.25l1.77 2.111a8.845 8.845 0 0 0 1.712-5.244c0-.518-.272-.993-.747-1.198-1.149-.493-3.657-1.349-7.771-1.67z"
                        clip-rule="evenodd" data-original="#000000" />
                    </svg>
                    <span>Account Deactivation</span>
                  </a>
                </li>*/}
                  {/* render any custom menus created via the Add Menu button */}
                  {customMenus.length > 0 && (
                    <ul class="space-y-2 mt-4">
                      {customMenus.map((m, i) => (
                        <li key={i}>
                          <a
                            href="#"
                            className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                          >
                            <span>{m}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </ul>

                <div class="mt-8">
                  <div class="bg-[#00b074] p-4 rounded-md shadow-md max-w-49">
                    <p class="text-white text-sm leading-relaxed">
                      Organize your menus using the action button below!
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="py-2 px-4 bg-white hover:bg-gray-100 text-slate-800 text-sm border-0 outline-0 rounded-md cursor-pointer mt-4"
                    >
                      Add Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Modal for creating a new menu item */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black opacity-40"
                onClick={() => setIsModalOpen(false)}
              />
              <form
                onSubmit={addMenu}
                className="relative bg-white rounded p-6 w-full max-w-md z-10"
              >
                <h3 className="text-lg font-medium mb-3">Create Menu</h3>
                <input
                  value={newMenuLabel}
                  onChange={(e) => setNewMenuLabel(e.target.value)}
                  placeholder="Menu label"
                  className="w-full border p-2 rounded mb-3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 border rounded"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}

          <button
            id="toggle-sidebar"
            class="lg:hidden w-8 h-8 z-[100] fixed top-[36px] left-[10px] cursor-pointer bg-[#007bff] flex items-center justify-center rounded-full outline-0 transition-all duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#fff"
              class="w-3 h-3"
              viewBox="0 0 55.752 55.752"
            >
              <path
                d="M43.006 23.916a5.36 5.36 0 0 0-.912-.727L20.485 1.581a5.4 5.4 0 0 0-7.637 7.638l18.611 18.609-18.705 18.707a5.398 5.398 0 1 0 7.634 7.635l21.706-21.703a5.35 5.35 0 0 0 .912-.727 5.373 5.373 0 0 0 1.574-3.912 5.363 5.363 0 0 0-1.574-3.912z"
                data-original="#000000"
              />
            </svg>
          </button>

          <section class="main-content w-full px-8">
            <header class="z-50 bg-[#f7f6f9] sticky top-0 pt-8">
              <div class="flex flex-wrap items-center w-full relative tracking-wide">
                <div class="flex items-center gap-y-6 max-sm:flex-col z-50 w-full pb-2">
                  <div class="flex items-center gap-4 w-full px-6 bg-white shadow-sm min-h-[48px] sm:mr-20 rounded-md outline-0 border-0">
                    <input
                      type="text"
                      placeholder="Search something..."
                      class="w-full text-sm bg-transparent rounded-sm outline-0"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 192.904 192.904"
                      class="w-4 cursor-pointer fill-gray-400 ml-auto"
                    >
                      <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z"></path>
                    </svg>
                  </div>

                  <div class="flex items-center justify-end gap-6 ml-auto">
                    <div class="flex items-center space-x-6">
                      <div class="w-9 h-[38px] flex items-center justify-center rounded-xl relative bg-blue-200 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-[18px] h-[18px] fill-blue-600"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M17.933.899C16.973.82 15.78.82 14.258.82H9.742c-1.522 0-2.716 0-3.675.078-.977.08-1.784.245-2.514.618a6.382 6.382 0 0 0-2.79 2.79C.391 5.036.226 5.843.146 6.82c-.079.96-.079 2.154-.079 3.676v4.73a5.02 5.02 0 0 0 5.02 5.02h.667a.39.39 0 0 1 .363.535c-.763 1.905 1.432 3.627 3.101 2.435l2.899-2.07.055-.039a4.717 4.717 0 0 1 2.686-.861h.84c1.719 0 2.767 0 3.648-.258a6.382 6.382 0 0 0 4.329-4.329c.257-.881.257-1.929.257-3.648v-1.515c0-1.522 0-2.717-.077-3.676-.081-.976-.246-1.783-.618-2.514a6.382 6.382 0 0 0-2.79-2.79C19.717 1.145 18.91.98 17.933.9zM4.309 3c.456-.233 1.02-.37 1.893-.44.884-.073 2.01-.074 3.578-.074h4.44c1.568 0 2.694 0 3.578.073.873.071 1.437.209 1.894.44a4.717 4.717 0 0 1 2.062 2.063c.233.456.37 1.02.44 1.894.072.883.073 2.009.073 3.577v1.315c0 1.933-.008 2.721-.19 3.343a4.717 4.717 0 0 1-3.2 3.199c-.621.182-1.41.19-3.343.19h-.687a6.382 6.382 0 0 0-3.635 1.166l-2.96 2.115c-.318.226-.734-.1-.589-.462a2.055 2.055 0 0 0-1.909-2.818h-.667a3.354 3.354 0 0 1-3.355-3.354v-4.695c0-1.568 0-2.694.074-3.577.07-.874.208-1.438.44-1.894A4.717 4.717 0 0 1 4.31 3z"
                            clip-rule="evenodd"
                            data-original="#000000"
                          />
                          <path
                            d="M8.67 10.533a1.11 1.11 0 1 1-2.22 0 1.11 1.11 0 0 1 2.22 0zm4.44 0a1.11 1.11 0 1 1-2.22 0 1.11 1.11 0 0 1 2.22 0zm4.44 0a1.11 1.11 0 1 1-2.22 0 1.11 1.11 0 0 1 2.22 0z"
                            data-original="#000000"
                          />
                        </svg>
                        <span class="absolute w-5 h-5 flex items-center justify-center -right-2.5 -top-2.5 text-[10px] rounded-full bg-blue-600 text-white">
                          4
                        </span>
                      </div>

                      <div class="w-9 h-[38px] flex items-center justify-center rounded-xl relative bg-red-200 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-[18px] h-[18px] fill-red-600"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M13.12 24h-2.24a1.498 1.498 0 0 1-1.486-1.32l-.239-1.876a9.45 9.45 0 0 1-1.374-.569l-1.494 1.161a1.492 1.492 0 0 1-1.985-.126l-1.575-1.575a1.488 1.488 0 0 1-.122-1.979l1.161-1.495a9.232 9.232 0 0 1-.569-1.374l-1.88-.239A1.501 1.501 0 0 1 0 13.12v-2.24c0-.757.567-1.396 1.32-1.486l1.876-.239a9.45 9.45 0 0 1 .569-1.374l-1.16-1.494a1.49 1.49 0 0 1 .127-1.986l1.575-1.575a1.489 1.489 0 0 1 1.979-.122L7.78 3.766a9.416 9.416 0 0 1 1.375-.569l.239-1.88C9.484.567 10.123 0 10.88 0h2.24c.757 0 1.396.567 1.486 1.32l.239 1.876c.478.155.938.346 1.375.569l1.494-1.161a1.49 1.49 0 0 1 1.985.127l1.575 1.575c.537.521.591 1.374.122 1.979L20.235 7.78c.224.437.415.897.569 1.374l1.88.239A1.5 1.5 0 0 1 24 10.88v2.24c0 .757-.567 1.396-1.32 1.486l-1.876.239a9.45 9.45 0 0 1-.569 1.374l1.161 1.494a1.49 1.49 0 0 1-.127 1.985l-1.575 1.575a1.487 1.487 0 0 1-1.979.122l-1.495-1.161a9.232 9.232 0 0 1-1.374.569l-.239 1.88A1.5 1.5 0 0 1 13.12 24zm-5.39-4.86c.083 0 .168.021.244.063a8.393 8.393 0 0 0 1.774.736.5.5 0 0 1 .358.417l.28 2.2c.03.251.247.444.494.444h2.24a.504.504 0 0 0 .493-.439l.281-2.204a.5.5 0 0 1 .358-.417 8.393 8.393 0 0 0 1.774-.736.499.499 0 0 1 .55.042l1.75 1.36a.492.492 0 0 0 .655-.034l1.585-1.585a.495.495 0 0 0 .039-.66l-1.36-1.75a.5.5 0 0 1-.042-.55 8.393 8.393 0 0 0 .736-1.774.5.5 0 0 1 .417-.358l2.2-.28A.507.507 0 0 0 23 13.12v-2.24a.504.504 0 0 0-.439-.493l-2.204-.281a.5.5 0 0 1-.417-.358 8.393 8.393 0 0 0-.736-1.774.497.497 0 0 1 .042-.55l1.36-1.75a.49.49 0 0 0-.033-.654l-1.585-1.585a.492.492 0 0 0-.66-.039l-1.75 1.36a.5.5 0 0 1-.551.042 8.359 8.359 0 0 0-1.774-.736.5.5 0 0 1-.358-.417l-.28-2.2A.507.507 0 0 0 13.12 1h-2.24a.504.504 0 0 0-.493.439l-.281 2.204a.502.502 0 0 1-.358.418 8.356 8.356 0 0 0-1.774.735.5.5 0 0 1-.551-.041l-1.75-1.36a.49.49 0 0 0-.654.033L3.434 5.014a.495.495 0 0 0-.039.66l1.36 1.75a.5.5 0 0 1 .042.55 8.341 8.341 0 0 0-.736 1.774.5.5 0 0 1-.417.358l-2.2.28A.505.505 0 0 0 1 10.88v2.24c0 .247.193.464.439.493l2.204.281a.5.5 0 0 1 .417.358c.18.626.428 1.223.736 1.774a.497.497 0 0 1-.042.55l-1.36 1.75a.49.49 0 0 0 .033.654l1.585 1.585a.494.494 0 0 0 .66.039l1.75-1.36a.515.515 0 0 1 .308-.104z"
                            data-original="#000000"
                          />
                          <path
                            d="M12 17c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-9c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z"
                            data-original="#000000"
                          />
                        </svg>
                        <span class="absolute w-5 h-5 flex items-center justify-center -right-2.5 -top-2.5 text-[10px] rounded-full bg-[#ff5b5b] text-white">
                          3
                        </span>
                      </div>
                    </div>

                    <div class="relative w-max mx-auto">
                      {/* <button type="button" id="dropdownToggle"
                            class="w-12 h-12 flex items-center justify-center rounded-full text-white border-none outline-none bg-blue-600 hover:bg-blue-700">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-[18px] h-[18px] fill-blue-600"
                              viewBox="0 0 371.263 371.263"
                            >
                              <path
                                d="M305.402 234.794v-70.54c0-52.396-33.533-98.085-79.702-115.151.539-2.695.838-5.449.838-8.204C226.539 18.324 208.215 0 185.64 0s-40.899 18.324-40.899 40.899c0 2.695.299 5.389.778 7.964-15.868 5.629-30.539 14.551-43.054 26.647-23.593 22.755-36.587 53.354-36.587 86.169v73.115c0 2.575-2.096 4.731-4.731 4.731-22.096 0-40.959 16.647-42.995 37.845-1.138 11.797 2.755 23.533 10.719 32.276 7.904 8.683 19.222 13.713 31.018 13.713h72.217c2.994 26.887 25.869 47.905 53.534 47.905s50.54-21.018 53.534-47.905h72.217c11.797 0 23.114-5.03 31.018-13.713 7.904-8.743 11.797-20.479 10.719-32.276-2.036-21.198-20.958-37.845-42.995-37.845a4.704 4.704 0 0 1-4.731-4.731zM185.64 23.952c9.341 0 16.946 7.605 16.946 16.946 0 .778-.12 1.497-.24 2.275-4.072-.599-8.204-1.018-12.336-1.138-7.126-.24-14.132.24-21.078 1.198-.12-.778-.24-1.497-.24-2.275.002-9.401 7.607-17.006 16.948-17.006zm0 323.358c-14.431 0-26.527-10.3-29.342-23.952h58.683c-2.813 13.653-14.909 23.952-29.341 23.952zm143.655-67.665c.479 5.15-1.138 10.12-4.551 13.892-3.533 3.773-8.204 5.868-13.353 5.868H59.89c-5.15 0-9.82-2.096-13.294-5.868-3.473-3.772-5.09-8.743-4.611-13.892.838-9.042 9.282-16.168 19.162-16.168 15.809 0 28.683-12.874 28.683-28.683v-73.115c0-26.228 10.419-50.719 29.282-68.923 18.024-17.425 41.498-26.887 66.528-26.887 1.198 0 2.335 0 3.533.06 50.839 1.796 92.277 45.929 92.277 98.325v70.54c0 15.809 12.874 28.683 28.683 28.683 9.88 0 18.264 7.126 19.162 16.168z"
                                data-original="#000000"
                              />
                            </svg>
                          </button> */}

                      <button
                        type="button"
                        id="dropdownToggle"
                        class="w-9 h-[38px] flex items-center justify-center rounded-xl relative bg-blue-200 cursor-pointer"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-[18px] h-[18px] fill-blue-600"
                          viewBox="0 0 371.263 371.263"
                        >
                          <path
                            d="M305.402 234.794v-70.54c0-52.396-33.533-98.085-79.702-115.151.539-2.695.838-5.449.838-8.204C226.539 18.324 208.215 0 185.64 0s-40.899 18.324-40.899 40.899c0 2.695.299 5.389.778 7.964-15.868 5.629-30.539 14.551-43.054 26.647-23.593 22.755-36.587 53.354-36.587 86.169v73.115c0 2.575-2.096 4.731-4.731 4.731-22.096 0-40.959 16.647-42.995 37.845-1.138 11.797 2.755 23.533 10.719 32.276 7.904 8.683 19.222 13.713 31.018 13.713h72.217c2.994 26.887 25.869 47.905 53.534 47.905s50.54-21.018 53.534-47.905h72.217c11.797 0 23.114-5.03 31.018-13.713 7.904-8.743 11.797-20.479 10.719-32.276-2.036-21.198-20.958-37.845-42.995-37.845a4.704 4.704 0 0 1-4.731-4.731zM185.64 23.952c9.341 0 16.946 7.605 16.946 16.946 0 .778-.12 1.497-.24 2.275-4.072-.599-8.204-1.018-12.336-1.138-7.126-.24-14.132.24-21.078 1.198-.12-.778-.24-1.497-.24-2.275.002-9.401 7.607-17.006 16.948-17.006zm0 323.358c-14.431 0-26.527-10.3-29.342-23.952h58.683c-2.813 13.653-14.909 23.952-29.341 23.952zm143.655-67.665c.479 5.15-1.138 10.12-4.551 13.892-3.533 3.773-8.204 5.868-13.353 5.868H59.89c-5.15 0-9.82-2.096-13.294-5.868-3.473-3.772-5.09-8.743-4.611-13.892.838-9.042 9.282-16.168 19.162-16.168 15.809 0 28.683-12.874 28.683-28.683v-73.115c0-26.228 10.419-50.719 29.282-68.923 18.024-17.425 41.498-26.887 66.528-26.887 1.198 0 2.335 0 3.533.06 50.839 1.796 92.277 45.929 92.277 98.325v70.54c0 15.809 12.874 28.683 28.683 28.683 9.88 0 18.264 7.126 19.162 16.168z"
                            data-original="#000000"
                          />
                        </svg>
                        <span class="absolute w-5 h-5 flex items-center justify-center -right-2.5 -top-2.5 text-[10px] rounded-full bg-blue-600 text-white">
                          21
                        </span>
                      </button>

                      <div
                        id="dropdownMenu"
                        class="absolute block right-0 shadow-lg bg-white py-4 z-[1000] min-w-full rounded-lg w-[410px] max-h-[500px] overflow-auto mt-2"
                      >
                        <div class="flex items-center justify-between px-4 mb-4">
                          <p class="text-xs text-blue-600 font-medium cursor-pointer">
                            Clear all
                          </p>
                          <p class="text-xs text-blue-600 font-medium cursor-pointer">
                            Mark as read
                          </p>
                        </div>

                        <ul class="divide-y divide-gray-300">
                          <li class="dropdown-item p-4 flex items-center hover:bg-gray-50 cursor-pointer">
                            <img
                              src="https://readymadeui.com/profile_2.webp"
                              class="w-12 h-12 rounded-full shrink-0"
                            />

                            <div class="ml-6">
                              <h3 class="text-sm text-slate-900 font-medium">
                                Your have a new message from Yin
                              </h3>
                              <p class="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                                Hello there, check this new items in from the
                                your may interested from the motion school.
                              </p>
                              <p class="text-xs text-blue-600 font-medium leading-3 mt-2">
                                10 minutes ago
                              </p>
                            </div>
                          </li>

                          <li class="dropdown-item p-4 flex items-center hover:bg-gray-50 cursor-pointer">
                            <img
                              src="https://readymadeui.com/team-2.webp"
                              class="w-12 h-12 rounded-full shrink-0"
                            />

                            <div class="ml-6">
                              <h3 class="text-sm text-slate-900 font-medium">
                                Your have a new message from Haper
                              </h3>
                              <p class="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                                Hello there, check this new items in from the
                                your may interested from the motion school.
                              </p>
                              <p class="text-xs text-blue-600 font-medium leading-3 mt-2">
                                2 hours ago
                              </p>
                            </div>
                          </li>

                          <li class="dropdown-item p-4 flex items-center hover:bg-gray-50 cursor-pointer">
                            <img
                              src="https://readymadeui.com/team-3.webp"
                              class="w-12 h-12 rounded-full shrink-0"
                            />

                            <div class="ml-6">
                              <h3 class="text-sm text-slate-900 font-medium">
                                Your have a new message from San
                              </h3>
                              <p class="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                                Hello there, check this new items in from the
                                your may interested from the motion school.
                              </p>
                              <p class="text-xs text-blue-600 font-medium leading-3 mt-2">
                                1 day ago
                              </p>
                            </div>
                          </li>

                          <li class="dropdown-item p-4 flex items-center hover:bg-gray-50 cursor-pointer">
                            <img
                              src="https://readymadeui.com/team-4.webp"
                              class="w-12 h-12 rounded-full shrink-0"
                            />

                            <div class="ml-6">
                              <h3 class="text-sm text-slate-900 font-medium">
                                Your have a new message from Seeba
                              </h3>
                              <p class="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">
                                Hello there, check this new items in from the
                                your may interested from the motion school.
                              </p>
                              <p class="text-xs text-blue-600 font-medium leading-3 mt-2">
                                30 minutes ago
                              </p>
                            </div>
                          </li>
                        </ul>
                        <p class="text-xs px-4 mt-6 mb-4 inline-block text-blue-600 font-medium cursor-pointer">
                          View all Notifications
                        </p>
                      </div>
                    </div>

                    <div class="w-1 h-10 border-l border-gray-400"></div>
                    <div class="dropdown-menu relative flex shrink-0 group">
                      <div class="flex items-center gap-4">
                        <p class="text-slate-500 text-sm">
                          Hi, {doctor?.firstName || user?.firstName || "Doctor"}
                        </p>
                        <img
                          src="https://readymadeui.com/team-1.webp"
                          alt="profile-pic"
                          class="w-[38px] h-[38px] rounded-full border-2 border-gray-300 cursor-pointer"
                        />
                      </div>

                      <div class="dropdown-content hidden group-hover:block shadow-md p-2 bg-white rounded-md absolute top-[38px] right-0 w-56">
                        <div class="w-full space-y-2">
                          <a
                            href="javascript:void(0)"
                            class="text-[15px] text-slate-800 font-medium cursor-pointer flex items-center p-2 rounded-md hover:bg-[#d9f3ea] dropdown-item transition duration-300 ease-in-out"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-[18px] h-[18px] mr-3 fill-current"
                              viewBox="0 0 512 512"
                            >
                              <path
                                d="M437.02 74.98C388.668 26.63 324.379 0 256 0S123.332 26.629 74.98 74.98C26.63 123.332 0 187.621 0 256s26.629 132.668 74.98 181.02C123.332 485.37 187.621 512 256 512s132.668-26.629 181.02-74.98C485.37 388.668 512 324.379 512 256s-26.629-132.668-74.98-181.02zM111.105 429.297c8.454-72.735 70.989-128.89 144.895-128.89 38.96 0 75.598 15.179 103.156 42.734 23.281 23.285 37.965 53.687 41.742 86.152C361.641 462.172 311.094 482 256 482s-105.637-19.824-144.895-52.703zM256 269.507c-42.871 0-77.754-34.882-77.754-77.753C178.246 148.879 213.13 114 256 114s77.754 34.879 77.754 77.754c0 42.871-34.883 77.754-77.754 77.754zm170.719 134.427a175.9 175.9 0 0 0-46.352-82.004c-18.437-18.438-40.25-32.27-64.039-40.938 28.598-19.394 47.426-52.16 47.426-89.238C363.754 132.34 315.414 84 256 84s-107.754 48.34-107.754 107.754c0 37.098 18.844 69.875 47.465 89.266-21.887 7.976-42.14 20.308-59.566 36.542-25.235 23.5-42.758 53.465-50.883 86.348C50.852 364.242 30 312.512 30 256 30 131.383 131.383 30 256 30s226 101.383 226 226c0 56.523-20.86 108.266-55.281 147.934zm0 0"
                                data-original="#000000"
                              ></path>
                            </svg>
                            Account
                          </a>
                          <hr class="my-2 -mx-2 border-gray-200" />

                          <a
                            href="javascript:void(0)"
                            class="text-[15px] text-slate-800 font-medium cursor-pointer flex items-center p-2 rounded-md hover:bg-[#d9f3ea] dropdown-item transition duration-300 ease-in-out"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="currentColor"
                              class="w-[18px] h-[18px] mr-3 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M19.56 23.253H4.44a4.051 4.051 0 0 1-4.05-4.05v-9.115c0-1.317.648-2.56 1.728-3.315l7.56-5.292a4.062 4.062 0 0 1 4.644 0l7.56 5.292a4.056 4.056 0 0 1 1.728 3.315v9.115a4.051 4.051 0 0 1-4.05 4.05zM12 2.366a2.45 2.45 0 0 0-1.393.443l-7.56 5.292a2.433 2.433 0 0 0-1.037 1.987v9.115c0 1.34 1.09 2.43 2.43 2.43h15.12c1.34 0 2.43-1.09 2.43-2.43v-9.115c0-.788-.389-1.533-1.037-1.987l-7.56-5.292A2.438 2.438 0 0 0 12 2.377z"
                                data-original="#000000"
                              ></path>
                              <path
                                d="M16.32 23.253H7.68a.816.816 0 0 1-.81-.81v-5.4c0-2.83 2.3-5.13 5.13-5.13s5.13 2.3 5.13 5.13v5.4c0 .443-.367.81-.81.81zm-7.83-1.62h7.02v-4.59c0-1.933-1.577-3.51-3.51-3.51s-3.51 1.577-3.51 3.51z"
                                data-original="#000000"
                              ></path>
                            </svg>
                            Dashboard
                          </a>
                          <a
                            href="javascript:void(0)"
                            class="text-[15px] text-slate-800 font-medium cursor-pointer flex items-center p-2 rounded-md hover:bg-[#d9f3ea] dropdown-item transition duration-300 ease-in-out"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-[18px] h-[18px] mr-3 fill-current"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M18 2c2.206 0 4 1.794 4 4v12c0 2.206-1.794 4-4 4H6c-2.206 0-4-1.794-4-4V6c0-2.206 1.794-4 4-4zm0-2H6a6 6 0 0 0-6 6v12a6 6 0 0 0 6 6h12a6 6 0 0 0 6-6V6a6 6 0 0 0-6-6z"
                                data-original="#000000"
                              />
                              <path
                                d="M12 18a1 1 0 0 1-1-1V7a1 1 0 0 1 2 0v10a1 1 0 0 1-1 1z"
                                data-original="#000000"
                              />
                              <path
                                d="M6 12a1 1 0 0 1 1-1h10a1 1 0 0 1 0 2H7a1 1 0 0 1-1-1z"
                                data-original="#000000"
                              />
                            </svg>
                            Posts
                          </a>
                          <a
                            href="javascript:void(0)"
                            class="text-[15px] text-slate-800 font-medium cursor-pointer flex items-center p-2 rounded-md hover:bg-[#d9f3ea] dropdown-item transition duration-300 ease-in-out"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-[18px] h-[18px] mr-3 fill-current"
                              viewBox="0 0 510 510"
                            >
                              <g fill-opacity=".9">
                                <path
                                  d="M255 0C114.75 0 0 114.75 0 255s114.75 255 255 255 255-114.75 255-255S395.25 0 255 0zm0 459c-112.2 0-204-91.8-204-204S142.8 51 255 51s204 91.8 204 204-91.8 204-204 204z"
                                  data-original="#000000"
                                />
                                <path
                                  d="M267.75 127.5H229.5v153l132.6 81.6 20.4-33.15-114.75-68.85z"
                                  data-original="#000000"
                                />
                              </g>
                            </svg>
                            Schedules
                          </a>
                          <a
                            href="javascript:void(0)"
                            class="text-[15px] text-slate-800 font-medium cursor-pointer flex items-center p-2 rounded-md hover:bg-[#d9f3ea] dropdown-item transition duration-300 ease-in-out"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              class="w-4.5 h-4.5 mr-3 fill-current"
                              viewBox="0 0 6 6"
                            >
                              <path
                                d="M3.172.53a.265.266 0 0 0-.262.268v2.127a.265.266 0 0 0 .53 0V.798A.265.266 0 0 0 3.172.53zm1.544.532a.265.266 0 0 0-.026 0 .265.266 0 0 0-.147.47c.459.391.749.973.749 1.626 0 1.18-.944 2.131-2.116 2.131A2.12 2.12 0 0 1 1.06 3.16c0-.65.286-1.228.74-1.62a.265.266 0 1 0-.344-.404A2.667 2.667 0 0 0 .53 3.158a2.66 2.66 0 0 0 2.647 2.663 2.657 2.657 0 0 0 2.645-2.663c0-.812-.363-1.542-.936-2.03a.265.266 0 0 0-.17-.066z"
                                data-original="#000000"
                              />
                            </svg>
                            Logout
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>
            {section === "dashboard" && (
              <Dashboard
                stats={stats}
                appointments={appointments}
                loading={loadingDashboard}
                error={dashboardError}
              />
            )}
            {(section === "patients" || section === "patientList") && (
              <PaitentList />
            )}
            {section === "pharmacy" && <Pharmacy />}
            {section === "reportsandanalytics" && <ReportAndAnalytics />}
            {section === "profile" && (
              <Profile
                doctor={doctor}
                loading={loadingDashboard}
                error={dashboardError}
              />
            )}
            {section === "records" && <Records />}
            {section === "labreports" && <LabReports />}
          </section>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
