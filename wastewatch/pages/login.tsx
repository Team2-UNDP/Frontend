import Head from "next/head";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/js/loginpage.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = (document.getElementById("username") as HTMLInputElement)
      ?.value;
    const password = (document.getElementById("password") as HTMLInputElement)
      ?.value;

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);

        alert("Login successful!");
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed. Server error.");
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
            className="mx-auto mb-12"
          />
          <button
            id="loginBtn"
            onClick={() => window.toggleLoginForm()}
            className="mt-16 px-16 py-2 border border-white rounded-full bg-transparent backdrop-blur-lg hover:bg-white hover:text-blue-900 transition duration-300 text-xl font-light"
          >
            Login
          </button>
        </div>

        <div
          id="loginForm"
          className="fixed bg-opacity-50 flex items-center justify-center hidden"
        >
          <div className="text-white p-8 rounded-lg shadow-lg w-96 relative bg-gradient-to-bl from-[rgba(146,240,255,0.2)] to-[rgba(2,36,50,0.2)] border border-[#ACDCFF] backdrop-blur-sm">
            <button
              onClick={() => window.toggleLoginForm()}
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
      </main>
    </>
  );
}

declare global {
  interface Window {
    toggleLoginForm: () => void;
  }
}
