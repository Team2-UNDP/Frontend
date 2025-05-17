/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import router from "next/router";

export default function UserModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeSection, setActiveSection] = useState<
    "info" | "add" | "edit" | "delete"
  >("info");
  const [userInfo, setUserInfo] = useState<any>(null); // Added userInfo state
  const [isFormValid, setIsFormValid] = useState<boolean>(false); // Added isFormValid state
  const formRef = useRef<HTMLFormElement | null>(null);
  const token = localStorage.getItem("token"); // Make sure token is stored under this key

  useEffect(() => {
    const validateForm = () => {
      if (!formRef.current) return;
  
      const formData = new FormData(formRef.current);
      const name = formData.get("name");
      const username = formData.get("username");
      const password = formData.get("password");
      const role = formData.get("role");
  
      const isAdd = activeSection === "add";
  
      // In "add" mode, password is required; in "edit" mode, it's optional
      const isPasswordValid = isAdd ? !!password : true;
  
      const isValid =
        !!name && !!username && isPasswordValid && !!role;
  
      setIsFormValid(isValid);
    };
  
    formRef.current = document.querySelector("form");
  
    if (formRef.current) {
      formRef.current.addEventListener("input", validateForm);
    }
  
    // Initial validation
    validateForm();
  
    return () => {
      if (formRef.current) {
        formRef.current.removeEventListener("input", validateForm);
      }
    };
  }, [activeSection, userInfo]);
  
  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      name: formData.get("name"),
      username: formData.get("username"),
      is_admin: formData.get("role") === "Admin",
      ...(activeSection === "edit"
        ? (formData.get("password") ? { password: formData.get("password") } : {})
        : { password: formData.get("password") }),
    };
    try {
      const url =
      activeSection === "add"
        ? "http://127.0.0.1:5000/user"
        : `http://127.0.0.1:5000/user/update`;

      const method = activeSection === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the bearer token
        },
        body: JSON.stringify(userData),
      });

      if (res.ok) {
      alert(activeSection === "add" ? "User added successfully!" : "User updated successfully!");
      onClose(); // Close the modal
      } else {
      const error = await res.json();
      alert(`Error: ${error.detail}`);
      }
    } catch (err) {
      console.error("Error processing user:", err);
      alert("Failed to process user. Please try again.");
    }
  };

  
  // Fetch user info from local storage when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const storedUserInfo = localStorage.getItem("user_info");
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
    }
  }, [isOpen]);

  if (!token) {
    alert("User not authenticated. Please log in.");
    router.push("/"); // Redirect to login page
    return;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-[700px] rounded-xl shadow-lg relative p-8 flex">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-gray-200 rounded-full transition duration-150 cursor-pointer"
        >
          <Image src="/icons/Close.png" alt="Close" width={12} height={12} />
        </button>

        {/* Sidebar */}
        <div className="w-1/3 pr-6 border-r-2 border-black">
          <h3 className="text-3xl font-bold text-black mb-4">Account</h3>
          <ul className="space-y-4 text-black">
            {["info", "add", "edit", "delete"].map((section) => {
              const labels: Record<string, string> = {
                info: "Information",
                add: "Add User",
                edit: "Edit User",
                delete: "Delete User",
              };
              const icons: Record<string, string> = {
                info: "/icons/Account.png",
                add: "/icons/AddAcc.png",
                edit: "/icons/EditAcc.png",
                delete: "/icons/Delete.png",
              };
              return (
                <li
                  key={section}
                  className={`flex items-center gap-2 cursor-pointer font-semibold ${
                    activeSection === section ? "text-[#065C7C]" : ""
                  }`}
                  onClick={() => setActiveSection(section as any)}
                >
                  <Image
                    src={icons[section]}
                    alt={section}
                    width={24}
                    height={24}
                  />
                  {labels[section]}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Content Sections */}
        <div className="w-2/3 pl-6 text-black">
          {activeSection === "info" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">User Information</h3>
                <p>
                <strong>Name:</strong> {userInfo?.name || "N/A"}
                </p>
                <p>
                <strong>Username:</strong> {userInfo?.username || "N/A"}
                </p>
                <p>
                <strong>Role:</strong> {userInfo?.is_admin ? "Admin" : "Staff"}
                </p>
                <p>
                <strong>Date Created:</strong> {userInfo?.date_created || "N/A"}
                </p>
            </div>
          )}

          {(activeSection === "add" || activeSection === "edit") && (
            <>
              <form className="space-y-6" onSubmit={handleAddUser}>
                <h3 className="text-xl font-bold">
                  {activeSection === "add" ? "Add Account" : "Edit Account"}
                </h3>
                <div className="flex items-start">
                  <label htmlFor="name" className="font-bold min-w-[60px] mt-1">
                    Name:
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    defaultValue={activeSection === "edit" ? userInfo?.name : ""}
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-start">
                  <label
                    htmlFor="User_id"
                    className="font-bold min-w-[90px] mt-1"
                  >
                    Username:
                  </label>
                  <input
                    id="User_id"
                    name="username"
                    type="text"
                    defaultValue={activeSection === "edit" ? userInfo?.username : ""}
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center">
                  <label htmlFor="status" className="font-bold min-w-[50px]">
                    Role:
                  </label>
                  <select
                    id="status"
                    name="role"
                    defaultValue={activeSection === "edit" ? (userInfo?.is_admin ? "Admin" : "Staff") : ""}
                    className="flex-1 border border-black rounded px-2 py-1"
                  >
                    <option>Admin</option>
                    <option>User</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                    <label htmlFor="location" className="font-bold min-w-[60px]">
                    Password:
                    </label>
                  <input
                    id="password"
                    name="password"
                    placeholder={activeSection === "edit" ? "Leave blank to keep current password" : ""}
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label htmlFor="feedback" className="font-bold min-w-[60px]">
                    Confirm Password:
                  </label>
                  <input
                    id="conf_password"
                    placeholder={activeSection === "edit" ? "Leave blank to keep current password" : ""}
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className={`bg-[#203F5A] text-white px-10 py-2 rounded-full shadow ${
                      !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!isFormValid}
                  >
                    {activeSection === "add" ? "Add User" : "Edit User"}
                  </button>
                </div>
              </form>
            </>
          )}

          {activeSection === "delete" && (
            <div>
              <h3 className="text-xl font-bold mb-4">Delete User</h3>
              <form className="space-y-4">
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="delete_user_id"
                    className="font-bold min-w-[60px]"
                  >
                    Enter Password:
                  </label>
                  <input
                    id="delete_user_id"
                    type="text"
                    className="flex-1 border border-black rounded px-2 py-1"
                  />
                </div>
                <div className="flex justify-center py-6">
                  <button
                    type="submit"
                    className="bg-[#203F5A] text-white px-10 py-2 rounded-full shadow"
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
