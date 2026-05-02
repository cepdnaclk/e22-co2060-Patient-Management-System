import { useState, useEffect } from "react";

// import AddDoctor from "./AdminDAshboardComponents/AddDoctor";
import AddNurse from "./AdminDAshboardComponents/AddUser";
import Stats from "./AdminDAshboardComponents/Stats";
import Dashboard from "./AdminDAshboardComponents/Dashboard";
import UsersList from "./AdminDAshboardComponents/UsersList";
import PatientsManager from "./AdminDAshboardComponents/PatientsManager";
import AllTables from "./AdminDAshboardComponents/AllTables";

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [customMenus, setCustomMenus] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const addMenu = (e) => {
    e.preventDefault();
    const label = newMenuLabel.trim();
    if (!label) return;
    setCustomMenus((c) => [...c, label]);
    setNewMenuLabel("");
    setIsModalOpen(false);
  };

  const [section, setSection] = useState("dashboard");
  const handleSectionChange = (nextSection) => {
    setSection(nextSection);
    setIsSidebarOpen(false);
  };

  const getMenuItemClass = (active) =>
    `menu-item flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-white/90 text-slate-900 shadow-sm border border-white/70"
        : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
    }`;

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
      if (!dropdownMenu.contains(event.target) && event.target !== dropdownToggle) {
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
      <div className="relative bg-transparent h-full min-h-screen">
        <div className="flex items-start">
          {isSidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            />
          )}
         <nav
  className={`fixed inset-y-4 left-4 z-40 w-[85%] max-w-xs bg-white/75 backdrop-blur border border-white/60 shadow-2xl rounded-3xl overflow-y-auto transition-transform duration-300 pt-12 lg:translate-x-0 lg:w-64 lg:max-w-none h-[calc(100vh-2rem)] ${
    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
  }`}
>
            <div className="py-6 px-6">
              <div className="flex items-center justify-between pb-4 lg:hidden">
                <span className="text-sm font-semibold text-slate-800">Admin Menu</span>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="rounded-full border border-gray-200 p-2 text-slate-600"
                  aria-label="Close sidebar"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange("dashboard");
                      }}
                      className={getMenuItemClass(section === "dashboard")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-4.5 h-[18px] mr-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19.56 23.253H4.44a4.051 4.051 0 0 1-4.05-4.05v-9.115c0-1.317.648-2.56 1.728-3.315l7.56-5.292a4.062 4.062 0 0 1 4.644 0l7.56 5.292a4.056 4.056 0 0 1 1.728 3.315v9.115a4.051 4.051 0 0 1-4.05 4.05zM12 2.366a2.45 2.45 0 0 0-1.393.443l-7.56 5.292a2.433 2.433 0 0 0-1.037 1.987v9.115c0 1.34 1.09 2.43 2.43 2.43h15.12c1.34 0 2.43-1.09 2.43-2.43v-9.115c0-.788-.389-1.533-1.037-1.987l-7.56-5.292A2.438 2.438 0 0 0 12 2.377z" />
                        <path d="M16.32 23.253H7.68a.816.816 0 0 1-.81-.81v-5.4c0-2.83 2.3-5.13 5.13-5.13s5.13 2.3 5.13 5.13v5.4c0 .443-.367.81-.81.81zm-7.83-1.62h7.02v-4.59c0-1.933-1.577-3.51-3.51-3.51s-3.51 1.577-3.51 3.51z" />
                      </svg>
                      <span>Dashboard</span>
                    </a>
                  </li>

                  {/* <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("addDoctor");
                      }}
                      className={getMenuItemClass(section === "addNurse")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-4.5 h-[18px] mr-3"
                        viewBox="0 0 60.123 60.123"
                      >
                        <path d="M57.124 51.893H16.92a3 3 0 1 1 0-6h40.203a3 3 0 0 1 .001 6zm0-18.831H16.92a3 3 0 1 1 0-6h40.203a3 3 0 0 1 .001 6zm0-18.831H16.92a3 3 0 1 1 0-6h40.203a3 3 0 0 1 .001 6z" />
                        <circle cx="4.029" cy="11.463" r="4.029" />
                        <circle cx="4.029" cy="30.062" r="4.029" />
                        <circle cx="4.029" cy="48.661" r="4.029" />
                      </svg>
                      <span>Add Doctor</span>
                    </a>
                  </li> */}

                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange("addNurse");
                      }}
                      className={getMenuItemClass(section === "users")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 682.667 682.667"
                      >
                        <defs>
                          <clipPath id="a" clipPathUnits="userSpaceOnUse">
                            <path d="M0 512h512V0H0Z" />
                          </clipPath>
                        </defs>
                        <g
                          fill="none"
                          stroke="#000"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeMiterlimit="10"
                          strokeWidth="30"
                          clipPath="url(#a)"
                          transform="matrix(1.33333 0 0 -1.33333 0 682.667)"
                        >
                          <path d="M368 170.3V45c0-16.57-13.43-30-30-30H45c-16.57 0-30 13.43-30 30v422c0 16.571 13.43 30 30 30h293c16.57 0 30-13.429 30-30V261.26" />
                          <path d="m287.253 180.508 159.099 159.099c5.858 5.858 15.355 5.858 21.213 0l25.042-25.041c5.858-5.859 5.858-15.356 0-21.214L332.508 135.253l-84.853-39.599ZM411.703 304.958l45.255-45.255M80 400h224M80 320h176M80 240h128" />
                        </g>
                      </svg>
                      <span>Add User</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange("users");
                      }}
                      className={getMenuItemClass(section === "patients")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                      </svg>
                      <span>User List</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange("patients");
                      }}
                      className={getMenuItemClass(section === "allTables")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                      <span>Patients</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange("allTables");
                      }}
                      className={getMenuItemClass(section === "stats")}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 24 24"
                      >
                        <path d="M4 5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5zm0 10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4zm10-10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V5zm0 10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4z" />
                      </svg>
                      <span>All Tables</span>
                    </a>
                  </li>

                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSectionChange("stats");
                      }}
                      className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 64 64"
                      >
                        <path d="M16.4 29.594a2.08 2.08 0 0 1 2.08-2.08h31.2a2.08 2.08 0 1 1 0 4.16h-31.2a2.08 2.08 0 0 1-2.08-2.08zm0 12.48a2.08 2.08 0 0 1 2.08-2.08h12.48a2.08 2.08 0 1 1 0 4.16H18.48a2.08 2.08 0 0 1-2.08-2.08z" />
                      </svg>
                      <span>Stats</span>
                    </a>
                  </li>

                  {/* <li>
                    <a
                      href="javascript:void(0)"
                      className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 507.246 507.246"
                      >
                        <path d="M457.262 89.821c-2.734-35.285-32.298-63.165-68.271-63.165H68.5c-37.771 0-68.5 30.729-68.5 68.5V412.09c0 37.771 30.729 68.5 68.5 68.5h370.247c37.771 0 68.5-30.729 68.5-68.5V155.757c-.001-31.354-21.184-57.836-49.985-65.936z" />
                        <circle cx="379.16" cy="286.132" r="16.658" />
                      </svg>
                      <span>Reports</span>
                    </a>
                  </li> */}

                  {/* <li>
                    <a
                      href="javascript:void(0)"
                      className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        className="w-[18px] h-[18px] mr-3"
                        viewBox="0 0 64 64"
                      >
                        <path d="M61.4 29.9h-6.542a9.377 9.377 0 0 0-18.28 0H2.6a2.1 2.1 0 0 0 0 4.2h33.978a9.377 9.377 0 0 0 18.28 0H61.4a2.1 2.1 0 0 0 0-4.2Z" />
                      </svg>
                      <span>Settings</span>
                    </a>
                  </li> */}

                  {customMenus.length > 0 && (
                    <ul className="space-y-2 mt-4">
                      {customMenus.map((m, i) => (
                        <li key={i}>
                          <a
                            href="javascript:void(0)"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSectionChange(`custom_${i}`);
                            }}
                            className={getMenuItemClass(section === `custom_${i}`)}
                          >
                            <span>{m}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </ul>

               
              </div>
          </nav>

          {/* Modal */}
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
            type="button"
            aria-label="Open sidebar"
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden w-9 h-9 z-[100] fixed top-[20px] left-[12px] cursor-pointer bg-white/90 border border-white/70 text-blue-600 shadow-lg flex items-center justify-center rounded-full outline-0 transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              className="w-3 h-3"
              viewBox="0 0 55.752 55.752"
            >
              <path d="M43.006 23.916a5.36 5.36 0 0 0-.912-.727L20.485 1.581a5.4 5.4 0 0 0-7.637 7.638l18.611 18.609-18.705 18.707a5.398 5.398 0 1 0 7.634 7.635l21.706-21.703a5.35 5.35 0 0 0 .912-.727 5.373 5.373 0 0 0 1.574-3.912 5.363 5.363 0 0 0-1.574-3.912z" />
            </svg>
          </button>

          <section className="main-content w-full px-4 sm:px-6 lg:px-8 lg:pl-[19rem]">
            

            {/* Conditional rendering */}
            {section === "dashboard" && <Dashboard />}
            {/* {section === "addDoctor" && <AddDoctor />}  */}
            {section === "addNurse" && <AddNurse />}
            {section === "stats" && <Stats />}  
            {section === "users" && <UsersList />}
            {section === "patients" && <PatientsManager />}
            {section === "allTables" && <AllTables />}
         

            {/* Custom menu sections */}
            {customMenus.map((menu, index) => (
              section === `custom_${index}` && (
                <div key={index}>
                  <h2 className="text-2xl font-bold mb-6">{menu}</h2>
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    Content for custom menu: {menu} (to be implemented)
                  </div>
                </div>
              )
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;