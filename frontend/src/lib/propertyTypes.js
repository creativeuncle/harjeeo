import {
  TextIcon,
  InputNumericIcon,
  ArrowDown01Icon,
  CheckListIcon,
  Loading03Icon,
  Calendar03Icon,
  UserIcon,
  CheckmarkSquare02Icon,
  Link04Icon,
  Mail01Icon,
  CallIcon,
  Clock01Icon,
  UserCircleIcon,
} from "hugeicons-react";

export const PROPERTY_TYPE_META = {
  text: { label: "Text", icon: TextIcon },
  number: { label: "Number", icon: InputNumericIcon },
  select: { label: "Select", icon: ArrowDown01Icon },
  multiSelect: { label: "Multi-select", icon: CheckListIcon },
  status: { label: "Status", icon: Loading03Icon },
  date: { label: "Date", icon: Calendar03Icon },
  person: { label: "Person", icon: UserIcon },
  checkbox: { label: "Checkbox", icon: CheckmarkSquare02Icon },
  url: { label: "URL", icon: Link04Icon },
  email: { label: "Email", icon: Mail01Icon },
  phone: { label: "Phone", icon: CallIcon },
  createdTime: { label: "Created time", icon: Clock01Icon },
  createdBy: { label: "Created by", icon: UserCircleIcon },
};

export const ADDABLE_PROPERTY_TYPES = Object.keys(PROPERTY_TYPE_META);

const OPTION_COLORS = [
  "gray",
  "orange",
  "amber",
  "emerald",
  "blue",
  "violet",
  "pink",
];

export function nextOptionColor(existingOptions = []) {
  return OPTION_COLORS[existingOptions.length % OPTION_COLORS.length];
}

export const OPTION_COLOR_CLASSES = {
  gray: "bg-gray-200 text-gray-900 dark:bg-gray-500/20 dark:text-gray-300",
  orange: "bg-orange-200 text-orange-900 dark:bg-orange-500/20 dark:text-orange-300",
  amber: "bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300",
  emerald: "bg-emerald-200 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300",
  blue: "bg-blue-200 text-blue-900 dark:bg-blue-500/20 dark:text-blue-300",
  violet: "bg-violet-200 text-violet-900 dark:bg-violet-500/20 dark:text-violet-300",
  pink: "bg-pink-200 text-pink-900 dark:bg-pink-500/20 dark:text-pink-300",
};

// Same colors, but background only appears on hover (used for closed/trigger
// pills so the value doesn't sit in a permanent colored box).
export const OPTION_TRIGGER_COLOR_CLASSES = {
  gray: "bg-gray-200/0 group-hover:bg-gray-200 text-gray-900 dark:bg-gray-500/0 dark:group-hover:bg-gray-500/20 dark:text-gray-300",
  orange: "bg-orange-200/0 group-hover:bg-orange-200 text-orange-900 dark:bg-orange-500/0 dark:group-hover:bg-orange-500/20 dark:text-orange-300",
  amber: "bg-amber-200/0 group-hover:bg-amber-200 text-amber-900 dark:bg-amber-500/0 dark:group-hover:bg-amber-500/20 dark:text-amber-300",
  emerald: "bg-emerald-200/0 group-hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-500/0 dark:group-hover:bg-emerald-500/20 dark:text-emerald-300",
  blue: "bg-blue-200/0 group-hover:bg-blue-200 text-blue-900 dark:bg-blue-500/0 dark:group-hover:bg-blue-500/20 dark:text-blue-300",
  violet: "bg-violet-200/0 group-hover:bg-violet-200 text-violet-900 dark:bg-violet-500/0 dark:group-hover:bg-violet-500/20 dark:text-violet-300",
  pink: "bg-pink-200/0 group-hover:bg-pink-200 text-pink-900 dark:bg-pink-500/0 dark:group-hover:bg-pink-500/20 dark:text-pink-300",
};

export const OPTION_DOT_CLASSES = {
  gray: "bg-gray-400",
  orange: "bg-orange-400",
  amber: "bg-amber-400",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  violet: "bg-violet-500",
  pink: "bg-pink-500",
};
