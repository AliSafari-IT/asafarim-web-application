import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectService } from '../../services/ProjectService';
import { TechStackService } from '../../services/TechStackService';
import { ICreateProject, IProject } from '../../interfaces/IProject';
import { ITechStack } from '../../interfaces/ITechStack';
import './AddProject.css';

interface FormErrors {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  budget?: string;
  tags?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  techStackId?: string;
}

interface AddProjectProps {
  onProjectAdded?: () => void;
  onCancel?: () => void;
}

const AddProject: React.FC<AddProjectProps> = ({ onProjectAdded, onCancel }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(isEditMode);
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ICreateProject>({
    title: '',
    description: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: '',
    endDate: '',
    dueDate: '',
    budget: undefined,
    tags: [],
    thumbnailUrl: '',
    repositoryUrl: '',
    liveUrl: '',
    isPublic: false,
    isFeatured: false,
    techStackId: ''
  });
  const [tagInput, setTagInput] = useState('');
  const [techStacks, setTechStacks] = useState<ITechStack[]>([]);
  const [isLoadingTechStacks, setIsLoadingTechStacks] = useState(false);

  // Load project data when in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadProject = async () => {
        try {
          setIsLoadingProject(true);
          setApiError(null);
          
          const response = await ProjectService.getProject(id);
          
          if (response.success && response.data) {
            const project = response.data;
            setFormData({
              title: project.title,
              description: project.description || '',
              status: project.status,
              priority: project.priority,
              startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
              endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
              dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
              budget: project.budget,
              tags: project.tags || [],
              thumbnailUrl: project.thumbnailUrl || '',
              repositoryUrl: project.repositoryUrl || '',
              liveUrl: project.liveUrl || '',
              isPublic: project.isPublic,
              isFeatured: project.isFeatured,
              techStackId: project.techStackId || ''
            });
          } else {
            setApiError(response.message || 'Failed to load project');
          }
        } catch (error) {
          console.error('Error loading project:', error);
          setApiError('Failed to load project data');
        } finally {
          setIsLoadingProject(false);
        }
      };
      
      loadProject();
    }
  }, [isEditMode, id]);

  // Load tech stacks on component mount
  useEffect(() => {
    const loadTechStacks = async () => {
      try {
        setIsLoadingTechStacks(true);
        const response = await TechStackService.getTechStacks();
        
        if (response.success && response.data) {
          setTechStacks(response.data);
        } else {
          console.error('Failed to load tech stacks:', response.message);
        }
      } catch (error) {
        console.error('Error loading tech stacks:', error);
      } finally {
        setIsLoadingTechStacks(false);
      }
    };
    
    loadTechStacks();
  }, []);

  const statusOptions = [
    'Planning',
    'In Progress',
    'On Hold',
    'Completed',
    'Cancelled'
  ];

  const priorityOptions = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Date validations
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.dueDate && formData.startDate) {
      if (new Date(formData.dueDate) < new Date(formData.startDate)) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }

    // Budget validation
    if (formData.budget !== undefined && formData.budget < 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    // URL validations
    if (formData.repositoryUrl && !isValidUrl(formData.repositoryUrl)) {
      newErrors.repositoryUrl = 'Please enter a valid URL';
    }

    if (formData.liveUrl && !isValidUrl(formData.liveUrl)) {
      newErrors.liveUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'budget') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : parseFloat(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags?.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError(null); // Clear previous errors
    
    // Clean up form data - convert empty strings to null for optional fields
    const cleanedFormData = {
      ...formData,
      description: formData.description?.trim() || undefined,
      startDate: formData.startDate || undefined,
      endDate: formData.endDate || undefined,
      dueDate: formData.dueDate || undefined,
      thumbnailUrl: formData.thumbnailUrl?.trim() || undefined,
      repositoryUrl: formData.repositoryUrl?.trim() || undefined,
      liveUrl: formData.liveUrl?.trim() || undefined,
      techStackId: formData.techStackId?.trim() || undefined,
      title: formData.title.trim(), // Remove trailing space
    };
    
    // Debug: Log the data being sent
    console.log('Sending project data:', cleanedFormData);
    
    try {
      let response;
      
      if (isEditMode && id) {
        // Update existing project
        response = await ProjectService.updateProject(id, cleanedFormData);
      } else {
        // Create new project
        response = await ProjectService.createProject(cleanedFormData);
      }
      
      if (response.success && response.data) {
        // Call callback if provided, otherwise navigate
        if (onProjectAdded) {
          onProjectAdded();
        } else {
          navigate(`/projects/${response.data.id || id}`);
        }
      } else {
        // Handle API error
        let errorMessage = response.message || `Failed to ${isEditMode ? 'update' : 'create'} project. Please check your input and try again.`;
        
        // Special handling for authentication errors
        if (response.statusCode === 401) {
          errorMessage = 'Your session has expired. Please refresh the page and log in again.';
        }
        
        setApiError(errorMessage);
        console.error(`Failed to ${isEditMode ? 'update' : 'create'} project:`, errorMessage);
      }
    } catch (error) {
      const errorMessage = `Network error occurred while ${isEditMode ? 'updating' : 'creating'} project. Please try again.`;
      setApiError(errorMessage);
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} project:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/projects');
    }
  };

  return (
    <div className="add-project-container">
      <div className="add-project-header">
        <h2>{isEditMode ? 'Edit Project' : 'Add New Project'}</h2>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
      </div>

      {apiError && (
        <div className="error-message api-error">
          {apiError}
        </div>
      )}

      {isLoadingProject ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading project data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="add-project-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title">Project Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={errors.title ? 'error' : ''}
            placeholder="Enter project title"
            required
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={errors.description ? 'error' : ''}
            placeholder="Enter project description"
            rows={4}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Status and Priority Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              {priorityOptions.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={errors.startDate ? 'error' : ''}
            />
            {errors.startDate && <span className="error-message">{errors.startDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={errors.endDate ? 'error' : ''}
            />
            {errors.endDate && <span className="error-message">{errors.endDate}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className={errors.dueDate ? 'error' : ''}
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
          </div>
        </div>

        {/* Budget */}
        <div className="form-group">
          <label htmlFor="budget">Budget ($)</label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget || ''}
            onChange={handleInputChange}
            className={errors.budget ? 'error' : ''}
            placeholder="Enter project budget"
            min="0"
            step="0.01"
          />
          {errors.budget && <span className="error-message">{errors.budget}</span>}
        </div>

        {/* Tags */}
        <div className="form-group">
          <label htmlFor="tags">Tags</label>
          <div className="tags-input-container">
            <input
              type="text"
              id="tags"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Type a tag and press Enter"
            />
            <button type="button" onClick={addTag} className="btn btn-sm">Add</button>
          </div>
          {formData.tags && formData.tags.length > 0 && (
            <div className="tags-display">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* URLs Row */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="repositoryUrl">Repository URL</label>
            <input
              type="url"
              id="repositoryUrl"
              name="repositoryUrl"
              value={formData.repositoryUrl}
              onChange={handleInputChange}
              className={errors.repositoryUrl ? 'error' : ''}
              placeholder="https://github.com/username/repo"
            />
            {errors.repositoryUrl && <span className="error-message">{errors.repositoryUrl}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="liveUrl">Live URL</label>
            <input
              type="url"
              id="liveUrl"
              name="liveUrl"
              value={formData.liveUrl}
              onChange={handleInputChange}
              className={errors.liveUrl ? 'error' : ''}
              placeholder="https://yourproject.com"
            />
            {errors.liveUrl && <span className="error-message">{errors.liveUrl}</span>}
          </div>
        </div>

        {/* Thumbnail URL */}
        <div className="form-group">
          <label htmlFor="thumbnailUrl">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Tech Stack */}
        <div className="form-group">
          <label htmlFor="techStackId">Tech Stack</label>
          <select
            id="techStackId"
            name="techStackId"
            value={formData.techStackId}
            onChange={handleInputChange}
            disabled={isLoadingTechStacks}
          >
            <option value="">
              {isLoadingTechStacks ? 'Loading tech stacks...' : 'Select a tech stack'}
            </option>
            {techStacks.map((techStack) => (
              <option key={techStack.id} value={techStack.id}>
                {techStack.name} ({techStack.category})
              </option>
            ))}
          </select>
          {errors.techStackId && (
            <span className="error-message">{errors.techStackId}</span>
          )}
        </div>

        {/* Checkboxes */}
        <div className="form-row">
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Make project public
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Feature this project
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Project' : 'Create Project')}
          </button>
        </div>
      </form>
      )}
    </div>
  );
};

export default AddProject;