import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Modal from "../components/message-modal"; // Adjust the import path as necessary

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/homepage");
    } else {
      router.push("/");
    }
  }, []);

  const toggleLoginForm = () => {
    setIsModalOpen((prevState) => !prevState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // only needed if backend sets cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data[0]?.access_token) {
          localStorage.setItem("token", data[0].access_token);
          setModalMessage("Login successful!");
          setShowModal(true);

          // Optional: redirect after short delay so user sees the message
          setTimeout(() => {
            router.push("/homepage");
          }, 1000);
        } else {
          setModalMessage("Error logging in.");
          setShowModal(true);
        }
      } else {
        setModalMessage(data.message || "Login failed.");
        setShowModal(true);
      }
    } catch (err) {
      console.error(err);
      setModalMessage("Login failed. Server error.");
      setShowModal(true);
    }
  };


  return (
    <>
      <Head>
        <title>WasteWatch Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>
      <main className="font-poppins min-h-screen flex items-center justify-center text-white bg-[url('/images/bg-image.png')] bg-[length:100%_100%] bg-no-repeat bg-center">
        <div className="text-center mt-16">
          <img
            id="logo"
            src="/images/WebLogo.png"
            alt="WasteWatch Logo"
            className={`mx-auto mb-12 ${isModalOpen ? "logo-shrink" : ""}`}
          />
          <button
            id="loginBtn"
            onClick={toggleLoginForm}
            className={`mt-16 px-16 py-2 border border-white rounded-full bg-transparent backdrop-blur-lg hover:bg-white hover:text-blue-900 transition duration-300 text-xl font-light ${
              isModalOpen ? "hidden" : ""
            }`}
          >
            Login
          </button>
        </div>

        <div
          id="loginForm"
          className={`fixed bg-opacity-50 flex items-center justify-center ${
            isModalOpen
              ? "block modal-enter modal-enter-active"
              : "hidden modal-exit"
          }`}
        >
          <div className="text-white p-8 rounded-lg shadow-lg w-96 relative bg-gradient-to-bl from-[rgba(146,240,255,0.2)] to-[rgba(2,36,50,0.2)] border border-[#ACDCFF] backdrop-blur-sm">
            <button
              onClick={toggleLoginForm}
              className="absolute top-2 right-4 text-white hover:text-gray-300 text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-[#E1E6E8]">
              Login
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <img
                  src="/icons/username.png"
                  alt="User Icon"
                  className="absolute left-4 top-7.5 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-white rounded-full text-[#E1E6E8] placeholder-[#E1E6E8] bg-transparent placeholder-opacity-75 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  required
                  placeholder="Username"
                />
              </div>

              <div className="mb-6 relative">
                <img
                  src="/icons/password.png"
                  alt="Lock Icon"
                  className="absolute left-4 top-7.5 transform -translate-y-1/2 w-5 h-5"
                />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-white rounded-full text-[#E1E6E8] placeholder-[#E1E6E8] bg-transparent placeholder-opacity-75 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]"
                  required
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                className="mt-10 w-full bg-[#FDFDFD] text-[#001623] py-2 rounded-full font-semibold hover:bg-gray-300 transform transition duration-150 active:scale-95"
              >
                Login
              </button>
            </form>
          </div>
        </div>
        {showModal && (
          <Modal
            message={modalMessage}
            onClose={() => setShowModal(false)}
          />
        )}

      </main>
    </>
  );
}
