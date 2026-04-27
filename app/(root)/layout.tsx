import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import UserMenu from "@/components/LogoutButton";
import Footer from "@/components/Footer";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  const user = await getCurrentUser();

  return (
    <div className="root-layout flex flex-col min-h-screen">
      <nav className="app-nav">
        <Link href="/" className="nav-logo">
          <Image
            src="/logo.png"
            alt="HireMind AI Logo"
            width={38}
            height={38}
            style={{ width: 38, height: "auto", borderRadius: "8px" }}
          />
          <span className="nav-brand">HireMind AI</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Dashboard</Link>
          <Link href="/resume-interview" className="nav-link nav-link-accent">Resume Interview</Link>
        </div>

        {/* Clickable user avatar → dropdown with Logout */}
        <UserMenu name={user?.name ?? "User"} email={user?.email} />
      </nav>

      <main className="main-content flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
