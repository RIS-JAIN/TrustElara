/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  FolderHeart, Layers, UserCheck, ShieldAlert, ClipboardList, MapPin, 
  Users, ShoppingBag, Landmark, Briefcase, HeartHandshake, Star, Wallet, LogOut
} from "lucide-react";

export type AdminTab =
  | "category"
  | "services"
  | "admin-roles"
  | "service-management"
  | "service-allocation"
  | "registered-users"
  | "orders"
  | "collected-cash"
  | "providers"
  | "practitioners"
  | "manage-reviews"
  | "manage-earnings";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  adminName: string;
  onLogout: () => void;
}

export function AdminSidebar({ activeTab, onSelectTab, adminName, onLogout }: AdminSidebarProps) {
  
  // Exact requested order
  const MENU_ITEMS = [
    { id: "category", label: "Category", icon: FolderHeart },
    { id: "services", label: "Services", icon: Layers },
    { id: "admin-roles", label: "Admin Roles", icon: ShieldAlert },
    { id: "service-management", label: "Service Management", icon: ClipboardList },
    { id: "service-allocation", label: "Service Allocation", icon: MapPin },
    { id: "registered-users", label: "Registered Users", icon: Users },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "collected-cash", label: "Collected Cash", icon: Landmark },
    { id: "providers", label: "Providers", icon: Briefcase },
    { id: "practitioners", label: "Practitioners", icon: HeartHandshake },
    { id: "manage-reviews", label: "Manage Reviews", icon: Star },
    { id: "manage-earnings", label: "Manage Earnings", icon: Wallet }
  ] as const;

  return (
    <aside id="admin-fixed-sidebar" className="w-64 bg-[#1E2D20] text-[#F9F6F0] flex flex-col shrink-0 h-screen sticky top-0 border-r border-[#131F16] font-sans">
      
      {/* Sidebar Logo - "FD" Wordmark */}
      <div className="p-6 border-b border-white/5 flex items-center space-x-3 bg-[#17241A]">
        <div className="w-9 h-9 rounded-lg bg-[#D46A43] flex items-center justify-center font-bold text-lg text-white shadow-md">
          FD
        </div>
        <div>
          <h1 className="font-display font-black text-lg tracking-wider leading-none">FD ADMIN</h1>
          <span className="text-[9px] uppercase tracking-widest text-[#D46A43] font-bold">Elara Systems</span>
        </div>
      </div>

      {/* Admin Personnel Card */}
      <div className="p-4 mx-4 my-3 bg-white/5 rounded-xl border border-white/5 text-xs flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-green-800 text-[#FAF7F2] flex items-center justify-center font-bold">
          {adminName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-[#FAF7F2] truncate max-w-[120px]">{adminName}</p>
          <span className="text-[9px] text-[#D46A43] font-bold uppercase">System Operator</span>
        </div>
      </div>

      {/* Navigation list in exact sequence */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-thin scrollbar-thumb-white/10">
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const IconComp = item.icon;
          return (
            <button
              key={item.id}
              id={`admin-menu-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                isActive 
                  ? "bg-[#D46A43] text-white shadow font-bold" 
                  : "text-[#FAF7F2]/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <IconComp className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-[#D46A43]"}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Log Out action */}
      <div className="p-4 border-t border-white/5 bg-[#17241A] flex flex-col space-y-2">
        <div className="flex items-center justify-between text-[10px] text-white/50 px-1">
          <span>Version 1.0.4</span>
          <span className="flex items-center text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-ping"></span>
            Online
          </span>
        </div>
        
        <button
          id="admin-logout-btn"
          onClick={onLogout}
          className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg text-[11px] font-bold transition-all border border-red-900/30 flex items-center justify-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </button>
      </div>

    </aside>
  );
}
