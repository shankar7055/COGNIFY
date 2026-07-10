import { Link } from "react-router-dom";

interface CognifyIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  variant?: "color" | "bw";
}

export const CognifyIcon = ({ size = 32, variant = "color", ...props }: CognifyIconProps) => {
  if (variant === "bw") {
    return (
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect width="52" height="52" rx="13" className="fill-black dark:fill-white transition-colors duration-200" />
        <line x1="14" y1="26" x2="22" y2="18" strokeWidth="3" strokeLinecap="round" className="stroke-white dark:stroke-black transition-colors duration-200" />
        <line x1="22" y1="18" x2="30" y2="34" strokeWidth="3" strokeLinecap="round" className="stroke-white dark:stroke-black transition-colors duration-200" />
        <line x1="30" y1="34" x2="38" y2="26" strokeWidth="3" strokeLinecap="round" className="stroke-white dark:stroke-black transition-colors duration-200" />
        <circle cx="14" cy="26" r="3" className="fill-white dark:fill-black transition-colors duration-200" />
        <circle cx="38" cy="26" r="3" className="fill-white dark:fill-black transition-colors duration-200" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect width="52" height="52" rx="13" fill="#e8712a"/>
      <line x1="14" y1="26" x2="22" y2="18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="22" y1="18" x2="30" y2="34" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="34" x2="38" y2="26" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="14" cy="26" r="3" fill="white"/>
      <circle cx="38" cy="26" r="3" fill="white"/>
    </svg>
  );
};

export const LogoSVG = (props: React.SVGProps<SVGSVGElement>) => {
  return <CognifyIcon size={24} variant="bw" {...props} />;
};

export const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-2">
      <LogoSVG />
      <span className="text-2xl font-medium">Cognify</span>
    </Link>
  );
};
