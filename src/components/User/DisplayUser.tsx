// Display all user information by getting all user fields from D:\repos\asafarim-web-application\src\interfaces\IUser.ts

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserDetails } from '../../services/UserService';
import { IUser } from '../../interfaces/IUser';
import './DisplayUser.css';
import { ButtonComponent } from '@asafarim/shared';

interface DisplayUserProps {
    // Add props here if needed
}

const DisplayUser: React.FC<DisplayUserProps> = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true); // Force loading state on each fetch
        if (id) {
          // Fetch user by ID from URL parameter
          const data = await fetchUserDetails(id);
          setUserDetails(data);
        } else {
          // If no ID, show current user's profile
          setUserDetails(user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user details");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUser();
    }
  }, [id, isAuthenticated, user, authLoading, navigate]);

  // Get all fields programmatically from the user object
  const allUserFields = React.useMemo(() => {
    return userDetails ? Object.keys(userDetails) as (keyof typeof userDetails)[] : [];
  }, [userDetails]);

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

  if (authLoading || loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (!isAuthenticated || !userDetails) {
    return <div className="error-message">User not authenticated</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
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
                <td className="field-value">{formatFieldValue(userDetails?.[field])}</td>
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
            onClick={() => navigate(`/users/${userDetails?.id}/edit`)}
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