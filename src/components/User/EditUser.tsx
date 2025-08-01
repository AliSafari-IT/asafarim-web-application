// User edit form component with table layout matching DisplayUser
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";
import { fetchUserDetails, updateUser } from "../../services/UserService";
import { IUser } from "../../interfaces/IUser";
import { ButtonComponent, InputFields } from "@asafarim/shared";
import "./EditUser.css";
import AdminHeader from "../AdminHeader";

const EditUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();

  const [userDetails, setUserDetails] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAdminUser = user?.role === "Admin";
  // Define which fields are editable
  const editableFields: (keyof IUser)[] = [
    "username",
    "firstName",
    "lastName",
    "bio",
    "website",
    "location",
    "avatar",
  ];
  // Only admins can edit email, role, and isActive status
  if (isAdminUser) {
    editableFields.push("role", "isActive", "email");
  }

  // Define which fields are read-only but should be displayed
  const readOnlyFields: (keyof IUser)[] = [
    "id",
    "isEmailVerified",
    "createdAt",
    "updatedAt",
  ];
  // Non-admins cannot edit email, role, and isActive status, show as read-only
  if (!isAdminUser) {
    readOnlyFields.push("email", "role", "isActive");
  }

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await fetchUserDetails(id!);
        setUserDetails(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isAuthenticated, navigate]);

  const handleChange = (field: keyof IUser, value: string | boolean) => {
    console.log("Updating field:", field, "with value:", value);
    // Update the userDetails state with the new value for the specified field
    if (!userDetails) return;
    setUserDetails({
      ...userDetails,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;

    setSaving(true);
    try {
      // Determine if current user is admin and pass necessary parameters
      const isAdmin = user?.role === "Admin";
      const currentUserId = user?.id;

      await updateUser(id!, userDetails, isAdmin, currentUserId);

      addNotification({
        type: "success",
        message: "User updated successfully",
      });

      // Refresh the user data to get the latest from the server
      const refreshedData = await fetchUserDetails(id!);
      setUserDetails(refreshedData);

      // Navigate after refreshing the data
      navigate(`/users/${id}`);
    } catch (err) {
      addNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update user",
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to format field names for display
  const formatFieldName = (fieldName: string): string => {
    return fieldName
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Function to format read-only field values
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (
      typeof value === "string" &&
      (value.includes("T") || value.includes("Z"))
    ) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString() + " " + date.toLocaleTimeString();
        }
      } catch (e) {
        // If parsing fails, return as string
      }
    }
    return String(value);
  };

  // Function to render input based on field type
  const renderInput = (field: keyof IUser, value: any) => {
    const fieldValue = value || "";
    const resize = field === "bio" || field === "avatar";

    const isChecked = fieldValue === "true" || fieldValue === "on";
    const inputClasses = ["input-field", resize ? "input-field-textarea" : ""]
      .filter(Boolean)
      .join(" ");

    switch (field) {
      case "isActive":
        return (
          <InputFields.Checkbox
            checked={userDetails?.isActive || false}
            onChange={(val: string | boolean) => handleChange(field, val)}
            key={field + "__checkbox"}
            styling="default"
            label={userDetails?.isActive ? "Active" : "Inactive"}
            className="checkbox-wrapper"
          />
        );

      case "email":
        return (
          <InputFields.Email
            value={fieldValue}
            onChange={(val: string) => handleChange(field, val)}
            key={field + "_email"}
          />
        );
      case "website":
        return (
          <InputFields.Url
            placeholder="https://example.com"
            value={fieldValue}
            onChange={(val: string) => handleChange(field, val)}
            key={field + "_website"}
          />
        );
      case "bio":
        return (
          <InputFields.Textarea
            name="bio"
            value={fieldValue}
            onChange={(val: string) => handleChange(field, val)}
            rows={3}
            placeholder="Tell us about yourself..."
          />
        );
      case "role":
        return (
          <InputFields.Select
            name="role"
            onChange={(val: string) => handleChange(field, val)}
            value={fieldValue}
            className="field-select"
            key={field + "_role"}
            options={[
              { value: "User", label: "User" },
              { value: "Admin", label: "Admin" },
              { value: "Moderator", label: "Moderator" },
              { value: "Guest", label: "Guest" },
            ]}
          />
        );

      default:
        return (
          <InputFields.Text
            name={field}
            value={fieldValue}
            onChange={(val: string) => handleChange(field, val)}
            required={
              field === "username" ||
              field === "firstName" ||
              field === "lastName"
            }
          />
        );
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!userDetails) return <div className="error-message">User not found</div>;

  return (
    <div className="user-edit">
      {/* Wrapper to collapse header spacing */}
      <div className="edituser-header-wrapper">
        <AdminHeader
          title="Edit User"
          subtitle="Modify user details and settings"
          icon="✏️"
        />
      </div>
      <form onSubmit={handleSubmit} className="user-edit-form">
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {/* Editable fields */}
              {editableFields.map((field) => (
                <tr key={field}>
                  <td className="field-name">{formatFieldName(field)}</td>
                  <td
                    className={`field-value ${
                      field === "isActive" ? "checkbox-cell" : ""
                    }`}
                  >
                    {renderInput(field, userDetails[field])}
                  </td>
                </tr>
              ))}

              {/* Read-only fields */}
              {readOnlyFields.map((field) => (
                <tr key={field} className="readonly-row">
                  <td className="field-name readonly">
                    {formatFieldName(field)}
                  </td>
                  <td className="field-value readonly">
                    {formatFieldValue(userDetails[field])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="user-table-footer">
          <ButtonComponent
            type="button"
            label="Cancel"
            onClick={() => navigate(`/users/${id}`)}
            variant="secondary"
            icon="↩️"
            iconPosition="left"
            size="sm"
            disabled={saving}
          />
          <ButtonComponent
            type="submit"
            label={saving ? "Saving..." : "Save Changes"}
            variant="primary"
            icon="💾"
            iconPosition="left"
            size="sm"
            disabled={saving}
          />
        </div>
      </form>
    </div>
  );
};

export default EditUser;
