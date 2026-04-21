import { type ComponentType } from 'react';

interface NavTabItem {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick?: () => void;
}

interface NavTabsProps {
  items: NavTabItem[];
}

export function NavTabs({ items }: NavTabsProps) {
  return (
    <div className="relative flex items-center gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={item.onClick}
            className={item.isActive ? 'nav-pill-active' : 'nav-pill'}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
