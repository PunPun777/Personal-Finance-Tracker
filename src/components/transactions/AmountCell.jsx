import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const AMOUNT_CONFIG = {
  income: {
    icon: ArrowUpRight,
    iconClass: "text-emerald-500",
    amountClass: "text-emerald-600 dark:text-emerald-400 font-medium",
  },
  expense: {
    icon: ArrowDownRight,
    iconClass: "text-rose-500",
    amountClass: "text-foreground font-medium",
  },
};

export function AmountCell({ type, amount }) {
  const config = AMOUNT_CONFIG[type] ?? AMOUNT_CONFIG.expense;
  const Icon = config.icon;
  return (
    <div className="flex items-center justify-end gap-1">
      <Icon className={`h-4 w-4 ${config.iconClass}`} />
      <span className={config.amountClass}>
        ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
