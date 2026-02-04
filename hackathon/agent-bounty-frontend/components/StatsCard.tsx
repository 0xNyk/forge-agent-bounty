import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl font-bold text-white">
            {value}
          </p>
          <p className="text-sm text-gray-400">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}