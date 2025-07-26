import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { IUpdateUserPreferences } from '../../interfaces/IUser';

const UserSettings = () => {
  const { preferences, getPreferences, updatePreferences, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState<IUpdateUserPreferences>({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
    projectVisibility: 'public'
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      try {
        if (preferences) {
          setFormData(preferences);
        } else {
          const result = await getPreferences();
          if (result?.success && result.data) {
            setFormData(result.data);
          } else if (result?.statusCode === 401) {
            // Preferences endpoint not available - don't treat as session expiry
            setMessage({ type: 'error', text: result.message || 'User preferences feature is not yet available on the backend. Using default settings.' });
          } else if (result?.statusCode === 404) {
            // Preferences endpoint not implemented yet - use defaults
            setMessage({ type: 'error', text: 'User preferences feature is not yet available on the backend. Using default settings.' });
          } else if (result?.message) {
            setMessage({ type: 'error', text: result.message });
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        setMessage({ type: 'error', text: 'Failed to load preferences' });
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [preferences, getPreferences, isAuthenticated]);

  const handleInputChange = (field: keyof IUpdateUserPreferences, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    
    setIsSaving(true);
    setMessage(null);

    try {
      const result = await updatePreferences(formData);
      
      if (result?.success) {
        setMessage({ type: 'success', text: 'Preferences updated successfully!' });
      } else if (result?.statusCode === 401) {
        // Preferences endpoint not available - don't treat as session expiry
        setMessage({ type: 'error', text: result.message || 'User preferences feature is not yet available. Cannot save settings.' });
      } else {
        setMessage({ type: 'error', text: result?.message || 'Failed to update preferences' });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Network error occurred while saving preferences' });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>User Settings</h1>
        <p>Manage your account preferences and settings</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              value={formData.theme || 'light'}
              onChange={(e) => handleInputChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Localization</h2>
          <div className="form-group">
            <label htmlFor="language">Language</label>
            <select
              id="language"
              value={formData.language || 'en'}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="timezone">Timezone</label>
            <select
              id="timezone"
              value={formData.timezone || 'UTC'}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Europe/Berlin">Berlin</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.emailNotifications ?? true}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              />
              <span className="checkmark"></span>
              <div>
                Email Notifications
                <small>Receive email notifications for important updates</small>
              </div>
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.pushNotifications ?? true}
                onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
              />
              <span className="checkmark"></span>
              <div>
                Push Notifications
                <small>Receive browser push notifications</small>
              </div>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2>Privacy</h2>
          <div className="form-group">
            <label htmlFor="projectVisibility">Default Project Visibility</label>
            <select
              id="projectVisibility"
              value={formData.projectVisibility || 'public'}
              onChange={(e) => handleInputChange('projectVisibility', e.target.value as 'public' | 'private' | 'unlisted')}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
            </select>
            <small>Choose the default visibility for your new projects</small>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserSettings;
