"use client";

import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AutoRefreshProvider } from "@/context/AutoRefreshContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import "./globals.css";

function AppLayout({ children }) {
  const pathname = usePathname();

  // ❌ Hide Navbar & Sidebar for Login + Forgot Password pages
  const isAuthPage = pathname === "/" || pathname === "/forgotpassword";

  const { theme } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 Detect Mobile Screen
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <body>

      {/* 🌟 GLOBAL TOAST IN THE ABSOLUTE CENTER OF WEBSITE */}
      <Toaster
        position="top-center"
        containerStyle={{
          top: "35%",                  // vertical center
          left: "50%",                 // horizontal center
          transform: "translate(-50%, -50%)",
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: theme === "dark" ? "#111" : "#fff",
            color: theme === "dark" ? "#fff" : "#000",
            borderRadius: "12px",
            padding: "12px 18px",
            border: theme === "dark" ? "1px solid #222" : "1px solid #ddd",
            fontSize: "15px",
            boxShadow:
              theme === "dark"
                ? "0 4px 12px rgba(255,255,255,0.08)"
                : "0 4px 12px rgba(0,0,0,0.12)",
          },
        }}
      />

      {/* 🌙 Navbar hidden on login/forgotpassword */}
      {!isAuthPage && !isLoading && isAuthenticated && (
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      )}

      {/* 📌 Sidebar */}
      {!isAuthPage && !isLoading && isAuthenticated && (
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isMobile={isMobile}
        />
      )}

      {/* MAIN CONTENT */}
      <main
        className={`transition-all duration-300 min-h-screen 
                    ${isAuthPage ? "" : "mt-16"}
                    ${!isAuthPage && sidebarOpen && !isMobile ? "ml-64" : "ml-0"}
                `}
      >
        <div
          className={`${isAuthPage ? "" : "p-6"}
                        ${!isMobile ? "max-w-7xl mx-auto w-full" : "w-full"}
                    `}
        >
          {children}
        </div>
      </main>
    </body>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ThemeProvider>
        <AutoRefreshProvider>
          <AuthProvider>
            <AppLayout>{children}</AppLayout>
          </AuthProvider>
        </AutoRefreshProvider>
      </ThemeProvider>
    </html>
  );
}
