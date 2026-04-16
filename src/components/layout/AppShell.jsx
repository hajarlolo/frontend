import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Sidebar from "./Sidebar";
import { FaUserCircle, FaBell, FaSignOutAlt, FaEnvelopeOpen, FaBriefcase, FaGraduationCap, FaUserTie } from "react-icons/fa";
import { useAuth } from "../../hooks";
import ThemeToggle from "../ui/ThemeToggle";
import { logout } from "../../services/endpoints";
import { queryClient } from "../../lib/queryClient";
import { ChatBot } from "..";

export default function AppShell({ title, subtitle, actions, children, showSidebar = true }) {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      navigate("/login", { replace: true });
    },
    onError: () => {
      clearAuth();
      navigate("/login", { replace: true });
    },
  });

  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const { data: notificationData } = useQuery({
    queryKey: ["unread-notifications-count"],
    queryFn: () => import("../../services/endpoints").then(m => m.fetchUnreadNotificationsCount()),
    refetchInterval: 10000, 
    enabled: !!user,
  });

  const { data: notifications, refetch: refetchAll } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => import("../../services/endpoints").then(m => m.fetchNotifications()),
    enabled: !!user && (showNotifications || (notificationData?.unreadCount || 0) > 0),
  });

  useEffect(() => {
    if ((notificationData?.unreadCount || 0) > 0) {
      refetchAll();
    }
  }, [notificationData?.unreadCount, refetchAll]);

  const markReadMutation = useMutation({
    mutationFn: (id) => import("../../services/endpoints").then(m => m.markNotificationAsRead(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
      refetchAll();
    },
  });

  const getNotifIcon = (type) => {
    switch(type) {
      case 'offre_emploi': return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FaBriefcase size={12} /></div>;
      case 'offre_stage': return <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><FaGraduationCap size={12} /></div>;
      case 'mission': return <div className="p-2 bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brandViolet rounded-lg"><FaUserTie size={12} /></div>;
      default: return <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg"><FaBell size={12} /></div>;
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notificationData?.unreadCount || 0;

  return (
    <div className="min-h-screen bg-brand-mist/30 dark:bg-slate-950 transition-colors duration-300">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-black italic tracking-tighter text-brand-violet dark:text-white transition-colors">
              TALENT<span className="text-brand-magenta dark:text-brandMagenta underline decoration-brand-magenta/30 underline-offset-4">LINK</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle />

            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative rounded-full p-2 transition-colors flex items-center justify-center ${showNotifications ? 'bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brandViolet' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
              >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-2xl ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-[100] animate-in fade-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 tracking-tight">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && <span className="text-[10px] bg-brand-magenta/10 dark:bg-brand-magenta/20 text-brand-magenta dark:text-brandMagenta px-2 py-0.5 rounded-full font-bold">{unreadCount} non lues</span>}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
                    {!notifications || notifications.length === 0 ? (
                      <div className="py-12 text-center">
                        <FaEnvelopeOpen className="mx-auto text-slate-200 dark:text-slate-700 text-3xl mb-3" />
                        <p className="text-xs font-bold text-slate-400">Aucune notification</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                           key={notif.id_notification}
                           onClick={() => !notif.read && markReadMutation.mutate(notif.id_notification)}
                           className={`flex items-start gap-4 p-4 rounded-2xl transition cursor-pointer mb-1 ${notif.read ? 'bg-white dark:bg-slate-900 opacity-60' : 'bg-brand-violet/5 dark:bg-brand-violet/10 active:bg-brand-violet/10 dark:active:bg-brand-violet/20 hover:bg-white dark:hover:bg-slate-800 border border-brand-violet/10 dark:border-brand-violet/20 shadow-sm'}`}
                        >
                          <div className="mt-1 shadow-sm">
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">{notif.contenu}</p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 block font-medium uppercase tracking-tight">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {!notif.read && (
                            <div className="mt-2 h-2 w-2 rounded-full bg-brand-violet ring-4 ring-brand-violet/10 animate-pulse" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link 
              to={user?.role === "admin" ? "/admin/profile" : (user?.role === "company" ? "/company/profile" : "/student/profile")} 
              className="group flex items-center gap-3 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-1.5 pr-4 transition-all hover:border-brand-violet/30 hover:bg-white dark:hover:bg-slate-700"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brandViolet transition-transform group-hover:scale-110">
                <FaUserCircle className="text-xl" />
              </div>
              <span className="hidden text-sm font-semibold text-slate-700 dark:text-slate-200 sm:block">Mon Profil</span>
            </Link>

            <button 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 disabled:opacity-50"
            >
              <FaSignOutAlt className={logoutMutation.isPending ? "animate-pulse" : ""} />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="mx-auto w-full max-w-[1400px] gap-8 p-4 py-8 sm:px-6 lg:flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white transition-colors">{title}</h1>
              {subtitle ? <p className="mt-1 text-base text-slate-500 dark:text-slate-400 transition-colors">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
          </div>
          {children}
        </main>
      </div>
      {user?.role === "student" && <ChatBot />}
    </div>
  );
}
