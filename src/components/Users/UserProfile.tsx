import { useAuth } from '../../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import ButtonComponent from '../Button/ButtonComponent';

interface UserProfileProps {
  // Add props here
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username;

  const initials = user.firstName && user.lastName
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : user.username.charAt(0).toUpperCase();

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          {user.avatar ? (
            <img src={user.avatar} alt={displayName} className="avatar-image" />
          ) : (
            <span className="avatar-initials">{initials}</span>
          )}
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{displayName}</h1>
          <p className="profile-username">@{user.username}</p>
          <p className="profile-email">{user.email}</p>
          {!user.isEmailVerified && (
            <div className="verification-status">
              <span className="status-badge unverified">Email not verified</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="profile-actions">
        <div className="action-buttons-container">
          <ButtonComponent
            label="View Detailed Profile"
            onClick={() => navigate(`/users/${user.id}`)}
            variant="info"
            key={user.id + '-view'}
            icon="👁️"
            iconPosition="right"
            size='sm'
          />
          <ButtonComponent
            label="Edit Profile"
            onClick={() => navigate(`/users/${user.id}/edit`)}
            variant="primary"
            key={user.id + '-edit'}
            icon="✏️"
            iconPosition="right"
            size='sm'
          />
        </div>
      </div>

      <div className="profile-details">
        <div className="detail-section">
          <h2>Account Information</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Role</label>
              <span>{user.role}</span>
            </div>
            <div className="detail-item">
              <label>Member since</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="detail-item">
              <label>Last login</label>
              <span>
                {user.lastLoginAt 
                  ? new Date(user.lastLoginAt).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
            <div className="detail-item">
              <label>Account status</label>
              <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {(user.bio || user.website || user.location) && (
          <div className="detail-section">
            <h2>About</h2>
            <div className="detail-grid">
              {user.bio && (
                <div className="detail-item full-width">
                  <label>Bio</label>
                  <span>{user.bio}</span>
                </div>
              )}
              {user.website && (
                <div className="detail-item">
                  <label>Website</label>
                  <a href={user.website} target="_blank" rel="noopener noreferrer">
                    {user.website}
                  </a>
                </div>
              )}
              {user.location && (
                <div className="detail-item">
                  <label>Location</label>
                  <span>{user.location}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
