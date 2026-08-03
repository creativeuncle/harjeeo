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
  gray: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300",
};
