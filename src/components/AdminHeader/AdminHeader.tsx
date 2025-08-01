import React from "react";
import "./AdminHeader.css";

interface AdminHeaderProps {
  title: string;
  subtitle?: string; // Optional subtitle for additional context
  icon?: React.ReactNode; // Optional icon for the header
  totalCount?: number;
  itemName?: string; // e.g., "Tech Stacks", "Users", "Repositories"
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  actions?: React.ReactNode; // Optional action buttons or elements
}

const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  icon = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.33,7 14.35,8.12 14.35,9.5C14.35,10.88 13.33,12 12,12C10.67,12 9.65,10.88 9.65,9.5C9.65,8.12 10.67,7 12,7M18,14.25C18,16.18 15.58,17.75 12,17.75C8.42,17.75 6,16.18 6,14.25V13.5C6,13.5 8.21,14.75 12,14.75C15.79,14.75 18,13.5 18,13.5V14.25Z" />
    </svg>
  ),
  totalCount,
  itemName,
  currentPage = 1,
  totalPages = 1,
  showPagination = false,
  actions,
}) => {
  return (
    <div className="admin-header">
      <div className="admin-header-main">
        <div className="admin-header-title">
          <h1>
            {title} {icon}
          </h1>
          {subtitle && <h2 className="admin-header-subtitle">{subtitle}</h2>}
        </div>        
        {actions && <div className="admin-header-actions">{actions}</div>}
      </div>

      {(totalCount || (totalPages > 1)) && <div className="admin-stats">
        {totalCount !== undefined && (
          <span>
            Total {itemName}: {totalCount}
          </span>
        )}
        {showPagination && totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>}
    </div>
  );
};

export default AdminHeader;
