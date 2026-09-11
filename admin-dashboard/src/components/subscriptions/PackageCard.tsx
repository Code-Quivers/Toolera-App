'use client';

interface Feature {
  label: string;
  included: boolean;
}

interface PackageCardProps {
  name: string;
  badge: string;
  price: string;
  period: string;
  features: Feature[];
  highlighted?: boolean;
  icon: string;
}

export function PackageCard({
  name,
  badge,
  price,
  period,
  features,
  highlighted = false,
  icon,
}: PackageCardProps) {
  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case 'Popular':
        return 'bg-[#00855c] text-[#f5fff7]';
      default:
        return 'bg-[#e5eeff] text-[#006948]';
    }
  };

  return (
    <div
      className={`relative bg-white rounded-xl p-6 ${
        highlighted
          ? 'border border-[#0e9b6d] shadow-[0_4px_20px_rgba(0,0,0,0.05)] -translate-y-1'
          : 'border border-[#e2e8f0]'
      }`}
    >
      {/* Decorative circle */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-[#eff4ff] rounded-bl-full" />

      {/* Badge */}
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-[Inter] ${getBadgeStyles(badge)}`}
      >
        {badge === 'Popular' && (
          <span className="material-symbols-outlined text-sm">local_fire_department</span>
        )}
        {badge}
      </span>

      {/* Title */}
      <h3 className="mt-4 text-2xl font-semibold font-[Montserrat] text-[#1a1a2e]">
        {name}
      </h3>

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-[32px] font-bold font-[Montserrat] text-[#0e9b6d]">
          {price}
        </span>
        <span className="text-sm text-[#545f73] font-[Inter]">{period}</span>
      </div>

      {/* Features */}
      <ul className="mt-6 space-y-3">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-lg ${
                feature.included ? 'text-[#0e9b6d]' : 'text-[#6d7a72] opacity-50'
              }`}
            >
              {feature.included ? 'check_circle' : 'cancel'}
            </span>
            <span
              className={`text-base font-[Inter] ${
                feature.included
                  ? 'text-[#3d4a42]'
                  : 'text-[#94a3b8] line-through'
              }`}
            >
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      {/* Button */}
      <button className="mt-6 w-full py-2.5 rounded-lg border border-[#0e9b6d] text-[#0e9b6d] font-medium font-[Inter] hover:bg-[#eff4ff] transition-colors">
        Edit Package
      </button>
    </div>
  );
}
