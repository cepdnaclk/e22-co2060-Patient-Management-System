import { useState, useEffect } from "react";
import Dashboard from "./DoctorDashboardComponents/Dashboard";
import Pharmacy from "./DoctorDashboardComponents/Pharmacy";
import ReportAndAnalytics from "./DoctorDashboardComponents/ReportAndAnlytics";
import Profile from "./DoctorDashboardComponents/Profile";
import Records from "./DoctorDashboardComponents/Records";
import LabReports from "./DoctorDashboardComponents/Labreport";
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
                      <span>Patient</span>
                    </a>
                  </li>
                  {/* <li>
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
                  </li> */}
                  
                  {/* <li>
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
                  </li> */}
                  {/* <li>
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
                  </li> */}
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
            
            {section === "dashboard" && (
              <Dashboard
                stats={stats}
                appointments={appointments}
                loading={loadingDashboard}
                error={dashboardError}
              />
            )}
            
            {/* {section === "pharmacy" && <Pharmacy />} */}
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
