// Display all user information by getting all user fields from D:\repos\asafarim-web-application\src\interfaces\IUser.ts

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './DisplayUser.css';
import ButtonComponent from '../Button/ButtonComponent';
import { useNavigate } from 'react-router-dom';

interface DisplayUserProps {
    // Add props here if needed
}

const DisplayUser: React.FC<DisplayUserProps> = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Get all fields programmatically from the user object
  // This will include all fields that exist in the user data
  const allUserFields = React.useMemo(() => {
    return user ? Object.keys(user) as (keyof typeof user)[] : [];
  }, [user]);

  // Function to format field names for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  // Function to format field values
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'string' && (value.includes('T') || value.includes('Z'))) {
      // Try to format as date if it looks like an ISO date string
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
      } catch (e) {
        // If parsing fails, return as string
      }
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="error-message">User not authenticated</div>;
  }

  return (
    <div className="user-display">
      <h2 className="user-display__title">User Information</h2>
      
      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {allUserFields.map((field) => (
              <tr key={field}>
                <td className="field-name">{formatFieldName(field)}</td>
                <td className="field-value">{formatFieldValue(user?.[field])}</td>
              </tr>
            ))}
          </tbody>
        </table>
       
      </div> 
      <div className="user-table-footer">
        <ButtonComponent
            label="Back"
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            icon="↩️"
            iconPosition="right"
            size="sm"
          />
          <ButtonComponent
            label="Edit Profile"
            onClick={() => navigate(`/users/${user.id}/edit`)}
            variant="primary"
            icon="✏️"
            iconPosition="right"
            size="sm"
          />
        </div>        
    </div>
  );
};

export default DisplayUser;