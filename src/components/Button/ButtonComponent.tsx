import React from "react";
import "./ButtonComponent.css";

// Define the props for the ButtonComponent
interface ButtonComponentProps {
  children?: React.ReactNode;
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "outline" | "ghost";
  outline?: "primary" | "secondary" | "success" | "danger" | "warning" | "info";
  ghost?: "primary";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right" | "only";
  block?: boolean;
  style?: React.CSSProperties;
  className?: string;
  type?: "button" | "submit" | "reset";
    [key: string]: any; // Allow additional props
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  label,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  outline,
  ghost,
  size = "md",
  icon,
  iconPosition = "left",
  block = false,
  style = {},
  className = "",
  type = "button",
  ...rest
}) => {
  // Build the button classes dynamically
  const buttonClasses = [
    "button-component", // Base button class
    
    // Size class
    `button-component-${size}`,
    
    // Variant classes
    outline ? `button-component-outline-${outline}` : 
    ghost ? `button-component-ghost-${ghost}` : 
    `button-component-${variant}`,
       
    // Block class
    block ? "button-component-block" : "",
    
    // Loading class
    loading ? "button-component-loading" : "",
    
    // Custom className
    className
  ].filter(Boolean).join(" ");

  // Content to display
  const content = children || label;

  return (
    <button 
      className={buttonClasses} 
      onClick={onClick} 
      disabled={disabled || loading} 
      style={style}
      type={type}
      {...rest}
    >
      {icon && iconPosition === "left"  && (
        <span >{icon}</span>
      )}
      
      {iconPosition === "only" ? (
        <span >{icon}</span>
      ) : (
        <span >{content}</span>
      )}
      
      {icon && iconPosition === "right" && (
        <span >{icon}</span>
      )}
    </button>
  );
};

export default ButtonComponent;
