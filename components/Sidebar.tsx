import React from 'react';
import { LayoutGrid, LogIn, ShieldAlert, Newspaper, LogOut, User, CreditCard, Sparkles, Gift, DollarSign, Trophy, Settings, ChevronRight } from 'lucide-react';
import { AppView, UserProfile } from '../types';
import Logo from './Logo';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  user: UserProfile | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setView, isOpen, toggleSidebar, 
  user, onLoginClick, onLogoutClick 
}) => {
  
  const NavGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="px-4 mb-2">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  const NavItem = ({ 
    item, 
    viewId, 
    isActive 
  }: { 
    item: { label: string, icon: any }, 
    viewId: AppView, 
    isActive: boolean 
  }) => (
    <button
      onClick={() => {
        setView(viewId);
        if (window.innerWidth < 1024) toggleSidebar();
      }}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
        isActive 
          ? 'bg-zinc-900 text-white shadow-inner shadow-black/50' 
          : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
      }`}
    >
      <div className="flex items-center gap-3 relative z-10">
        <item.icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
        <span className="font-medium text-sm">{item.label}</span>
      </div>
      
      {/* Active Indicator */}
      {isActive && (
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
        </div>
      )}
      
      {/* Hover Gradient */}
      {isActive && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />}
    </button>
  );

  // Sidebar container classes
  const sidebarClasses = `fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-zinc-800/50 transform transition-transform duration-300 ease-out lg:translate-x-0 ${
    isOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full'
  }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={toggleSidebar}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="h-16 flex items-center px-6 border-b border-zinc-800/50 bg-black/50 backdrop-blur-xl">
             <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setView(AppView.HOME)}>
               <div className="relative">
                 <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                 <Logo className="w-7 h-7 relative z-10" />
               </div>
               <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-purple-500">
                 VETORRE
               </span>
             </div>
          </div>

          {/* Navigation Scroll Area */}
          <nav className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            
            <NavGroup title="Discover">
              <NavItem item={{ label: 'Menu', icon: LayoutGrid }} viewId={AppView.HOME} isActive={currentView === AppView.HOME} />
              <NavItem item={{ label: 'Top Rated', icon: Trophy }} viewId={AppView.TOP_TOOLS} isActive={currentView === AppView.TOP_TOOLS} />
              <NavItem item={{ label: 'Free Tools', icon: Gift }} viewId={AppView.FREE_TOOLS} isActive={currentView === AppView.FREE_TOOLS} />
              <NavItem item={{ label: 'Paid Tools', icon: DollarSign }} viewId={AppView.PAID_TOOLS} isActive={currentView === AppView.PAID_TOOLS} />
            </NavGroup>

            <NavGroup title="Studio">
              <NavItem item={{ label: 'Latest News', icon: Newspaper }} viewId={AppView.LATEST_NEWS} isActive={currentView === AppView.LATEST_NEWS} />
              <NavItem item={{ label: 'Pricing & Plans', icon: CreditCard }} viewId={AppView.PRICING} isActive={currentView === AppView.PRICING} />
            </NavGroup>

            {user?.role === 'admin' && (
              <NavGroup title="System">
                <NavItem item={{ label: 'Admin Dashboard', icon: ShieldAlert }} viewId={AppView.ADMIN} isActive={currentView === AppView.ADMIN} />
              </NavGroup>
            )}
            
          </nav>

          {/* User Footer */}
          <div className="p-4 border-t border-zinc-800/50 bg-zinc-900/20">
             {user ? (
               <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 group">
                 <div className="flex items-center gap-3 mb-3">
                   <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/20">
                      <User className="w-4 h-4" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-medium text-white truncate">{user.email.split('@')[0]}</div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">{user.role} Account</div>
                   </div>
                 </div>
                 
                 <button 
                  onClick={onLogoutClick}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 py-2 rounded-lg transition-colors"
                 >
                   <LogOut className="w-3 h-3" /> Sign Out
                 </button>
               </div>
             ) : (
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-xl p-4 text-center">
                  <h4 className="text-white font-bold text-sm mb-1">Join VETORRE</h4>
                  <p className="text-zinc-500 text-xs mb-3">Save tools & generate content.</p>
                  <button 
                    onClick={onLoginClick}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black py-2.5 rounded-lg text-sm font-bold transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </button>
                </div>
             )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;