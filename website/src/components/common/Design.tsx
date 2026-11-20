import { createContext, useContext, useId } from "react";
import type {
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import assets from "../../design/assets.json";
import dimensions from "../../design/asset-dimensions.json";
import { Card } from "./Card";
import { Input } from "./Input";

export type DesignScreen = keyof typeof assets;
const DesignContext = createContext<DesignScreen>("dashboard");
export function DesignProvider({
  screen,
  children,
}: {
  screen: DesignScreen;
  children: ReactNode;
}) {
  return (
    <DesignContext.Provider value={screen}>{children}</DesignContext.Provider>
  );
}
export function DesignIcon({
  name,
  screen,
  className = "",
}: {
  name: string;
  screen?: DesignScreen;
  className?: string;
}) {
  const current = useContext(DesignContext);
  const path = (assets[screen || current] as Record<string, string>)[name];
  if (!path) return null;
  const size = (
    dimensions as Record<string, { width: string; height: string }>
  )[path];
  return (
    <span aria-hidden="true" className={`design-icon ${className}`}>
      <img
        src={path}
        alt=""
        width={Number(size?.width) || undefined}
        height={Number(size?.height) || undefined}
      />
    </span>
  );
}
export function Avatar({ name, size = 38 }: { name: string; size?: number }) {
  return (
    <span
      className="bz-avatar"
      style={{ width: size, height: size, fontSize: size / 3 }}
    >
      {name
        .split(/\s+/)
        .slice(0, 2)
        .map((s) => s[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}
export function Status({
  children,
  tone = "neutral",
  screen,
}: {
  children: ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "red";
  screen?: DesignScreen;
}) {
  const current = useContext(DesignContext);
  const source = screen || current;
  const variants: Partial<
    Record<DesignScreen, Partial<Record<typeof tone, string>>>
  > = {
    dashboard: {
      amber: "imgStatusIndicator",
      green: "imgStatusIndicator1",
      neutral: "imgStatusIndicator2",
    },
    desktopDashboard: {
      green: "imgStatusIndicator",
      neutral: "imgStatusIndicator1",
      amber: "imgStatusIndicator2",
    },
    products: { neutral: "imgStatusIndicator", green: "imgStatusIndicator1" },
    productDetail: { green: "imgStatusIndicator" },
    register: { blue: "imgStatusIndicator" },
    business: { blue: "imgStatusIndicator" },
    invoices: { amber: "imgStatusIndicator", green: "imgStatusIndicator1" },
  };
  const icon = variants[source]?.[tone];
  return (
    <span className={`bz-status ${tone}`}>
      {icon ? <DesignIcon screen={source} name={icon} /> : <i />}
      {children}
    </span>
  );
}
export function Notice({
  children,
  success = false,
  icon = "imgInfo",
}: {
  children: ReactNode;
  success?: boolean;
  icon?: string;
}) {
  return (
    <div className={`bz-notice ${success ? "success" : ""}`}>
      <DesignIcon name={icon} />
      <p>{children}</p>
    </div>
  );
}
export function SectionHeading({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {action &&
        (onAction ? (
          <button type="button" className="text-link" onClick={onAction}>
            {action}
          </button>
        ) : (
          <span className="text-link">{action}</span>
        ))}
    </div>
  );
}
export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className="bz-field">
      <label htmlFor={id}>{label}</label>
      <div className="select-wrapper">
        <select id={id} {...props}>
          {children}
        </select>
        <DesignIcon name="imgChevronDown" />
      </div>
    </div>
  );
}
export function Textarea({
  label,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  const id = useId();
  return (
    <div className="bz-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} {...props} />
    </div>
  );
}
export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <Input
      aria-label={placeholder}
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      leftIcon={<DesignIcon name="imgSearch" />}
      className="bz-search"
    />
  );
}
export function Tabs({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="bz-tabs" role="tablist" aria-label="Filter">
      {options.map((option) => (
        <button
          type="button"
          role="tab"
          aria-selected={value === option}
          className={value === option ? "active" : ""}
          key={option}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
export function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const current = useContext(DesignContext);
  return (
    <Card className="toggle-card">
      <div>
        <h3>{label}</h3>
        {hint && <p className="hint">{hint}</p>}
      </div>
      <button
        type="button"
        className={`bz-switch ${checked ? "on" : ""}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        {checked && "imgSwitch" in assets[current] ? (
          <DesignIcon name="imgSwitch" />
        ) : (
          <span />
        )}
      </button>
    </Card>
  );
}
export function ErrorMessage({ children }: { children: ReactNode }) {
  return children ? (
    <p className="bz-error" role="alert">
      {children}
    </p>
  ) : null;
}
export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <Card className="empty-state">
      <h2>{title}</h2>
      <p className="muted">{children}</p>
    </Card>
  );
}
