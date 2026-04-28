import { useState, useEffect } from "react";
// import AddDoctor from "./AdminDashboardComponents/AddDoctor";
import AddNurse from "./AdminDashboardComponents/AddUser";
import Stats from "./AdminDashboardComponents/Stats";           
import Dashboard from "./AdminDashboardComponents/Dashboard";  
import UsersList from "./AdminDashboardComponents/UsersList";

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMenuLabel, setNewMenuLabel] = useState("");
  const [customMenus, setCustomMenus] = useState([]);

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
      <div className="relative bg-[#f7f6f9] h-full min-h-screen">
        <div className="flex items-start">
          <nav id="sidebar" className="lg:min-w-67.5 w-max max-lg:min-w-8">
            <div
              id="sidebar-collapse-menu"
              className="bg-white shadow-lg h-screen fixed top-0 left-0 overflow-auto z-99 lg:min-w-62.5 lg:w-max max-lg:w-0 max-lg:invisible transition-all duration-500"
            >
              <div className="py-6 px-6">
                <ul className="space-y-2">
                  <li>
                    <a
                      href="javascript:void(0)"
                      onClick={(e) => {
                        e.preventDefault();
                        setSection("dashboard");
                      }}
                      className="menu-item text-green-800 text-[15px] font-medium flex items-center cursor-pointer bg-[#F0F8FF] hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
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
                      className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
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
                        setSection("addNurse");
                      }}
                      className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
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
                        setSection("users");
                      }}
                      className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
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
                        setSection("stats");
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
                              setSection(`custom_${i}`);
                            }}
                            className="menu-item text-slate-800 text-[15px] font-medium flex items-center cursor-pointer hover:bg-[#F0F8FF] rounded-md px-3 py-3 transition-all duration-300"
                          >
                            <span>{m}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </ul>

                <div className="mt-8">
                  <div className="bg-[#00b074] p-4 rounded-md shadow-md max-w-49">
                    <p className="text-white text-sm leading-relaxed">
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
            id="toggle-sidebar"
            className="lg:hidden w-8 h-8 z-[100] fixed top-[36px] left-[10px] cursor-pointer bg-[#007bff] flex items-center justify-center rounded-full outline-0 transition-all duration-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="#fff"
              className="w-3 h-3"
              viewBox="0 0 55.752 55.752"
            >
              <path d="M43.006 23.916a5.36 5.36 0 0 0-.912-.727L20.485 1.581a5.4 5.4 0 0 0-7.637 7.638l18.611 18.609-18.705 18.707a5.398 5.398 0 1 0 7.634 7.635l21.706-21.703a5.35 5.35 0 0 0 .912-.727 5.373 5.373 0 0 0 1.574-3.912 5.363 5.363 0 0 0-1.574-3.912z" />
            </svg>
          </button>

          <section className="main-content w-full px-8">
            <header className="z-50 bg-[#f7f6f9] sticky top-0 pt-8">
              <div className="flex flex-wrap items-center w-full relative tracking-wide">
                <div className="flex items-center gap-y-6 max-sm:flex-col z-50 w-full pb-2">
                  <div className="flex items-center gap-4 w-full px-6 bg-white shadow-sm min-h-[48px] sm:mr-20 rounded-md outline-0 border-0">
                    <input
                      type="text"
                      placeholder="Search something..."
                      className="w-full text-sm bg-transparent rounded-sm outline-0"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 192.904 192.904"
                      className="w-4 cursor-pointer fill-gray-400 ml-auto"
                    >
                      <path d="m190.707 180.101-47.078-47.077c11.702-14.072 18.752-32.142 18.752-51.831C162.381 36.423 125.959 0 81.191 0 36.422 0 0 36.423 0 81.193c0 44.767 36.422 81.187 81.191 81.187 19.688 0 37.759-7.049 51.831-18.751l47.079 47.078a7.474 7.474 0 0 0 5.303 2.197 7.498 7.498 0 0 0 5.303-12.803zM15 81.193C15 44.694 44.693 15 81.191 15c36.497 0 66.189 29.694 66.189 66.193 0 36.496-29.692 66.187-66.189 66.187C44.693 147.38 15 117.689 15 81.193z" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-end gap-6 ml-auto">
                    <div className="flex items-center space-x-6">
                      {/* Notification icons + profile dropdown*/}
                      {/* You can copy-paste the exact block from DoctorDashboard header here */}
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* Conditional rendering */}
            {section === "dashboard" && <Dashboard />}
            {/* {section === "addDoctor" && <AddDoctor />}  */}
            {section === "addNurse" && <AddNurse />}
            {section === "stats" && <Stats />}  
            {section === "users" && <UsersList />}
         

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