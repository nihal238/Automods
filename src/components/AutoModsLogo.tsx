import { Link } from "react-router-dom";
import automodsLogo from "@/assets/automods-logo.png";

interface AutoModsLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

const sizeMap = {
  sm: "h-8",
  md: "h-10",
  lg: "h-14",
};

const AutoModsLogo = ({ className = "", size = "md", linkTo = "/" }: AutoModsLogoProps) => {
  const img = (
    <img
      src={automodsLogo}
      alt="AutoMods - Customize · Performance · Power"
      className={`${sizeMap[size]} w-auto object-contain ${className}`}
    />
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center group">
        {img}
      </Link>
    );
  }

  return img;
};

export default AutoModsLogo;
