import React from 'react';
import { 
  BarChart3, 
  Calculator, 
  GitCompare, 
  FileText, 
  Zap, 
  DollarSign,
  ChevronLeft, 
  ChevronRight,
  Target,
  CreditCard,
  RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeSection: string;
  onReset: () => void;
  scrollToSection: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed, activeSection, onReset, scrollToSection }) => {
  const navItems = [
    { id: 'sec-01', label: 'Store Analysis', icon: Target },
    { id: 'sec-02', label: 'Core Metrics', icon: BarChart3 },
    { id: 'sec-03', label: 'AOV Components', icon: Calculator },
    { id: 'sec-04', label: 'Revenue & LTV', icon: DollarSign },
    { id: 'sec-05', label: 'Technical Stack', icon: GitCompare },
    { id: 'sec-08', label: 'Proposal Editor', icon: FileText },
  ];

  return (
    <aside className={cn(
      "h-screen bg-surface border-r border-border transition-all duration-300 z-50 flex flex-col shrink-0 sticky top-0",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Remove the backdrop since it's no longer an overlay */}
      <div className="p-3 flex items-center justify-between border-b border-border">
        {!collapsed && <span className="font-bold text-accent tracking-tighter text-lg uppercase">Zylobot AI</span>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-white/5 rounded-md text-accent/60 hover:text-accent transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "w-full flex items-center p-2.5 transition-colors group relative",
              collapsed && "justify-center",
              activeSection === item.id ? "text-accent" : "text-accent/40 hover:bg-white/5 hover:text-accent"
            )}
          >
            {activeSection === item.id && (
              <motion.div 
                layoutId="activeNav"
                className="absolute inset-y-0 right-0 w-1 bg-accent shadow-[0_0_8px_rgba(245,242,237,0.4)]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {activeSection === item.id && (
              <motion.div 
                layoutId="activeNavBg"
                className="absolute inset-0 bg-accent/10 z-[-1]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <item.icon size={18} className={cn("min-w-[18px]", !collapsed && "mr-2.5")} />
            {!collapsed && <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>}
            {collapsed && (
              <div className="fixed left-20 bg-accent text-bg px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button 
          onClick={onReset}
          className={cn(
            "w-full flex items-center justify-center p-2 rounded-lg bg-red/10 text-red hover:bg-red/20 transition-all text-[11px] font-bold gap-2",
            collapsed ? "px-0" : ""
          )}
        >
          <RefreshCcw size={14} />
          {!collapsed && <span>Reset Data</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
