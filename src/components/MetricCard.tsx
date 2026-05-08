import React from 'react';
import { cn } from '../lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'green' | 'amber' | 'red' | 'gold' | 'default';
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  icon: Icon, 
  subValue, 
  trend,
  color = 'default',
  loading
}) => {
  const colorMap = {
    green: 'text-green',
    amber: 'text-amber',
    red: 'text-red',
    gold: 'text-gold',
    default: 'text-accent'
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-lg p-3 sm:p-5 group hover:bg-white/[0.08] transition-all hover:border-white/10">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider sm:tracking-widest text-accent/40">{label}</span>
        {Icon && <Icon size={14} className="text-accent/20 group-hover:text-accent/40 transition-colors" />}
      </div>
      
      <div className="flex flex-col">
        {loading ? (
          <div className="h-8 w-24 bg-white/5 animate-pulse rounded" />
        ) : (
          <span className={cn(
            "text-xl sm:text-2xl font-bold tracking-tight break-words line-clamp-2 leading-tight", 
            colorMap[color]
          )}>
            {value}
          </span>
        )}
        {subValue && (
          <span className="text-[10px] font-medium text-accent/40 mt-1 uppercase tracking-tight">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
