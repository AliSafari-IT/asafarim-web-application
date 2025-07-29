// Given User edit form component
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, User } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import DDItems from "../DDItems";
import "./EditUser.css";
import ButtonComponent from "../Button/ButtonComponent";

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  const [userDetails, setUserDetails] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Role options for dropdown
  const roleItems = [
    { value: 'User', label: 'User' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Moderator', label: 'Moderator' },
    { value: 'Guest', label: 'Guest' }
  ];

  // Get all editable fields from User interface (excluding email and system fields)
  const editableFields = React.useMemo((): (keyof User)[] => {
    const baseFields: (keyof User)[] = [
      'username',
      'firstName', 
      'lastName',
      'avatar',
      'bio',
      'website',
      'location',
      'isActive'
    ];
    
    // Only admins can edit role field
    if (user?.role === 'Admin') {
      baseFields.push('role');
    }
    
    return baseFields;
  }, [user?.role]);

  // Fields that should not be editable (system managed)
  const readOnlyFields = React.useMemo((): (keyof User)[] => {
    const baseReadOnlyFields: (keyof User)[] = [
      'id', 
      'email', 
      'isEmailVerified', 
      'emailVerifiedAt', 
      'lastLoginAt', 
      'createdAt', 
      'updatedAt'
    ];
    
    // If user is not admin, add role to read-only fields
    if (user?.role !== 'Admin') {
      baseReadOnlyFields.push('role');
    }
    
    return baseReadOnlyFields;
  }, [user?.role]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    // For demo purposes, use current user data
    // In real app, you'd fetch user by id from API
    if (user) {
      setUserDetails(user);
      setLoading(false);
    }
  }, [id, isAuthenticated, navigate, user]);

  // Function to format field names for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };

  // Function to determine input type based on field name and value
  const getInputType = (fieldName: keyof User, value: any): string => {
    if (fieldName === 'email') return 'email';
    if (fieldName === 'website') return 'url';
    if (fieldName === 'avatar') return 'url';
    if (typeof value === 'boolean') return 'checkbox';
    // More specific date field detection
    if (fieldName.toLowerCase().includes('date') || fieldName.toLowerCase().endsWith('at')) return 'datetime-local';
    return 'text';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    // Handle different input types
    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      processedValue = value ? Number(value) : '';
    }

    setUserDetails(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;

    try {
      // Here you would call your API to update the user
      // await updateUser(id!, userDetails);
      
      addNotification({
        type: "success",
        message: "User updated successfully",
        duration: 5000
      });
      
      console.log('Updated user data:', userDetails);
      // navigate(`/users/${id}`);
    } catch (err) {
      addNotification({ 
        type: "error", 
        message: "Failed to update user",
        duration: 5000
      });
    }
  };

  // Add this helper function at the top of your component
  const getUserFieldValue = (user: Partial<User>, fieldName: string): string => {
    const value = user[fieldName as keyof User];
    return value ? String(value) : 'Not set';
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-user-container">
      <form className="edit-user-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Edit User</h2>
        
        {/* Read-only fields section */}
        <div className="readonly-section">
          <h3>System Information (Read-only)</h3>
          <div className="readonly-fields">
            {readOnlyFields.map((fieldName) => (
              <div key={fieldName} className="readonly-field">
                <label className="readonly-label">
                  {formatFieldName(fieldName)}:
                </label>
                <span className="readonly-value">
                  {getUserFieldValue(userDetails, fieldName)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Editable fields section */}
        <div className="editable-section">
          <div className="section-header">
            <h3>Editable Information</h3>
            <p className="section-description">Update your profile information below</p>
          </div>
          
          <div className="form-grid">
            {/* Basic Information Group */}
            <div className="field-group">
              <h4 className="group-title">Basic Information</h4>
              <div className="group-fields">
                {editableFields
                  .filter(field => ['username', 'firstName', 'lastName'].includes(field))
                  .map((fieldName) => {
                    const value = userDetails[fieldName];
                    const inputType = getInputType(fieldName, value);
                    
                    return (
                      <div key={fieldName} className="form-field">
                        <label className="field-label">
                          <span className="label-text">{formatFieldName(fieldName)}</span>
                          <input
                            type={inputType}
                            name={fieldName}
                            value={String(value || '')}
                            onChange={handleInputChange}
                            className="field-input"
                            placeholder={`Enter ${formatFieldName(fieldName).toLowerCase()}`}
                          />
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Profile Information Group */}
            <div className="field-group">
              <h4 className="group-title">Profile Information</h4>
              <div className="group-fields">
                {editableFields
                  .filter(field => ['avatar', 'bio', 'website', 'location'].includes(field))
                  .map((fieldName) => {
                    const value = userDetails[fieldName];
                    const inputType = getInputType(fieldName, value);
                    
                    return (
                      <div key={fieldName} className="form-field">
                        <label className="field-label">
                          <span className="label-text">{formatFieldName(fieldName)}</span>
                          {fieldName === 'bio' ? (
                            <textarea
                              name={fieldName}
                              value={String(value || '')}
                              onChange={handleInputChange}
                              className="field-textarea"
                              rows={4}
                              placeholder={`Enter ${formatFieldName(fieldName).toLowerCase()}`}
                            />
                          ) : (
                            <input
                              type={inputType}
                              name={fieldName}
                              value={String(value || '')}
                              onChange={handleInputChange}
                              className="field-input"
                              placeholder={`Enter ${formatFieldName(fieldName).toLowerCase()}`}
                            />
                          )}
                        </label>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Administrative Settings Group */}
            {user?.role === 'Admin' && (
              <div className="field-group admin-group admin-span">
                <h4 className="group-title">
                  <span>Administrative Settings</span>
                  <span className="admin-badge">Admin Only</span>
                </h4>
                <div className="group-fields">
                  {editableFields
                    .filter(field => ['role', 'isActive'].includes(field))
                    .map((fieldName) => {
                      const value = userDetails[fieldName];
                      const inputType = getInputType(fieldName, value);
                      
                      return (
                        <div key={fieldName} className="form-field admin-field">
                          <label className="field-label">
                            <span className="label-text">{formatFieldName(fieldName)}</span>
                            {fieldName === 'role' ? (
                              <DDItems
                                selectedValue={String(value || '')}
                                onValueChange={(newValue) => {
                                  setUserDetails(prev => ({
                                    ...prev,
                                    [fieldName]: newValue,
                                  }));
                                }}
                                items={roleItems}
                                dropdownType="outlined"
                                placeholder="Select Role"
                                className="field-select"
                              />
                            ) : inputType === 'checkbox' ? (
                              <div className="checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  name={fieldName}
                                  checked={Boolean(value)}
                                  onChange={handleInputChange}
                                  className="field-checkbox"
                                  id={`checkbox-${fieldName}`}
                                />
                                <label htmlFor={`checkbox-${fieldName}`} className="checkbox-label">
                                  {Boolean(value) ? 'Active' : 'Inactive'}
                                </label>
                              </div>
                            ) : (
                              <input
                                type={inputType}
                                name={fieldName}
                                value={String(value || '')}
                                onChange={handleInputChange}
                                className="field-input"
                                placeholder={`Enter ${formatFieldName(fieldName).toLowerCase()}`}
                              />
                            )}
                          </label>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
            <ButtonComponent
              type="submit"
              variant="success"
              label="Update User"
              icon="💾"
              size="sm"
              iconPosition="right"
            />
          <ButtonComponent
            type="button"
            onClick={() => navigate(-1)}
            variant="warning"
            label="Cancel"
            icon="❌"
            size="sm"
            iconPosition="right"
          />
        </div>
      </form>
    </div>
  );
};

export default EditUser;
