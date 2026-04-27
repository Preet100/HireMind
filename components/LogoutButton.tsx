"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/actions/auth.action";

interface UserMenuProps {
  name: string;
  email?: string;
}

export default function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      {/* Avatar trigger */}
      <button
        id="user-menu-trigger"
        className="user-menu-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="nav-avatar">{initials}</div>
        <span className="nav-username max-sm:hidden">{name}</span>
        {/* Chevron */}
        <svg
          className={`user-menu-chevron ${open ? "rotated" : ""}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="user-menu-dropdown" role="menu">
          {/* User info header */}
          <div className="user-menu-header">
            <div className="user-menu-avatar-lg">{initials}</div>
            <div className="user-menu-info">
              <p className="user-menu-name">{name}</p>
              {email && <p className="user-menu-email">{email}</p>}
            </div>
          </div>

          <div className="user-menu-divider" />

          {/* Menu items */}
          <div className="user-menu-items">
            <button
              className="user-menu-item"
              role="menuitem"
              onClick={() => { setOpen(false); router.push("/profile"); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </button>

            <button
              className="user-menu-item"
              role="menuitem"
              onClick={() => { setOpen(false); router.push("/"); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Dashboard
            </button>

            <button
              className="user-menu-item"
              role="menuitem"
              onClick={() => { setOpen(false); router.push("/resume-interview"); }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Resume Interview
            </button>
          </div>

          <div className="user-menu-divider" />

          {/* Logout */}
          <div className="user-menu-items">
            <button
              id="logout-btn"
              className="user-menu-item user-menu-item-danger"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <span className="user-menu-spinner" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              )}
              {loggingOut ? "Signing out..." : "Log Out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
