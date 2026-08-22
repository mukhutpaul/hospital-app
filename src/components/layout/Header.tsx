"use client";

import {
  Bell,
  Menu,
  Search,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  const userName = session?.user?.name || "Utilisateur";
  const userEmail = session?.user?.email || "";
  const userRole =
    (session?.user as { role?: string })?.role || "USER";

  // Première lettre du nom
  const initials = userName.trim().charAt(0).toUpperCase();

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="sticky top-0 z-40 h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-3 sm:px-4 md:px-6">

      {/* =====================================================
          GAUCHE
      ====================================================== */}
      <div className="flex items-center gap-2">

        {/* MENU MOBILE */}
        <button
          type="button"
          className="btn btn-ghost btn-square lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={22} />
        </button>

        {/* RECHERCHE DESKTOP */}
        <div className="hidden md:block">
          <label className="input input-bordered flex items-center gap-2 w-64 lg:w-80">
            <Search
              size={18}
              className="text-base-content/50"
            />

            <input
              type="search"
              placeholder="Rechercher..."
              className="grow"
            />
          </label>
        </div>

        {/* RECHERCHE MOBILE */}
        <button
          type="button"
          className="btn btn-ghost btn-square md:hidden"
          aria-label="Rechercher"
        >
          <Search size={20} />
        </button>
      </div>

      {/* =====================================================
          DROITE
      ====================================================== */}
      <div className="flex items-center gap-1 sm:gap-2">

        {/* NOTIFICATIONS */}
        <button
          type="button"
          className="btn btn-ghost btn-circle"
          aria-label="Notifications"
        >
          <div className="indicator">
            <span className="indicator-item badge badge-error badge-xs" />
            <Bell size={20} />
          </div>
        </button>

        {/* SEPARATEUR */}
        <div className="hidden sm:block divider divider-horizontal mx-0" />

        {/* =================================================
            UTILISATEUR
        ================================================== */}
        <div className="dropdown dropdown-end">

          {/* BOUTON UTILISATEUR */}
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost h-auto min-h-12 px-2 sm:px-3 gap-2"
          >

            {/* AVATAR */}
            <div className="avatar placeholder">
              <div
                className="
                  bg-primary
                  text-primary-content
                  rounded-full
                  w-9
                  h-9
                  flex
                  items-center
                  justify-center
                "
              >
                <span className="text-sm font-bold leading-none">
                  {initials}
                </span>
              </div>
            </div>

            {/* INFORMATIONS */}
            <div className="hidden sm:block text-left max-w-36">
              <p className="text-sm font-semibold truncate">
                {userName}
              </p>

              <p className="text-xs text-base-content/60 truncate">
                {userRole}
              </p>
            </div>
          </div>

          {/* =================================================
              MENU UTILISATEUR
          ================================================== */}
          <ul
            tabIndex={0}
            className="
              dropdown-content
              menu
              bg-base-100
              rounded-box
              shadow-xl
              border
              border-base-200
              w-64
              mt-3
              z-50
              p-2
            "
          >

            {/* HEADER UTILISATEUR */}
            <li className="menu-title px-3 py-2">
              <div className="flex items-center gap-3">

                {/* AVATAR */}
                <div className="avatar placeholder">
                  <div
                    className="
                      bg-primary
                      text-primary-content
                      rounded-full
                      w-10
                      h-10
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <span className="font-bold leading-none">
                      {initials}
                    </span>
                  </div>
                </div>

                {/* INFOS */}
                <div className="min-w-0">
                  <p className="font-semibold truncate">
                    {userName}
                  </p>

                  <p className="text-xs font-normal text-base-content/60 truncate">
                    {userEmail}
                  </p>
                </div>

              </div>
            </li>

            <div className="divider my-1" />

            {/* PROFIL */}
            <li>
              <a href="/profile">
                <User size={17} />
                Mon profil
              </a>
            </li>

            {/* PARAMÈTRES */}
            <li>
              <a href="/settings">
                <Settings size={17} />
                Paramètres
              </a>
            </li>

            <div className="divider my-1" />

            {/* DECONNEXION */}
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="text-error hover:bg-error/10"
              >
                <LogOut size={17} />
                Déconnexion
              </button>
            </li>

          </ul>
        </div>
      </div>
    </header>
  );
}