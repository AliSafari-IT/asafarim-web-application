import React from 'react';
import { ITechStack } from '../../interfaces/ITechStack';

interface TechStackMultiSelectProps {
  techStacks: ITechStack[];
  selectedTechStackIds: string[];
  onChange: (selectedIds: string[]) => void;
  isLoading?: boolean;
  error?: string;
}

const TechStackMultiSelect: React.FC<TechStackMultiSelectProps> = ({
  techStacks,
  selectedTechStackIds,
  onChange,
  isLoading = false,
  error
}) => {
  const handleCheckboxChange = (techStackId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedTechStackIds, techStackId]);
    } else {
      onChange(selectedTechStackIds.filter(id => id !== techStackId));
    }
  };

  const handleSelectAll = () => {
    if (!Array.isArray(techStacks)) return;
    
    if (selectedTechStackIds.length === techStacks.length) {
      onChange([]);
    } else {
      onChange(techStacks.map(ts => ts.id));
    }
  };

  if (isLoading) {
    return (
      <div className="form-group">
        <label>Tech Stacks</label>
        <div className="loading-message">Loading tech stacks...</div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label>Tech Stacks</label>
      <div className="tech-stack-multi-select">
        <div className="select-all-container">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={Array.isArray(techStacks) && selectedTechStackIds.length === techStacks.length && techStacks.length > 0}
              onChange={handleSelectAll}
            />
            <span className="checkmark"></span>
            Select All ({selectedTechStackIds.length} selected)
          </label>
        </div>
        
        <div className="tech-stack-options">
          {Array.isArray(techStacks) && techStacks.map((techStack) => (
            <label key={techStack.id} className="checkbox-label tech-stack-option">
              <input
                type="checkbox"
                checked={selectedTechStackIds.includes(techStack.id)}
                onChange={(e) => handleCheckboxChange(techStack.id, e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="tech-stack-info">
                <span className="tech-stack-name">{techStack.name}</span>
                <span className="tech-stack-category">({techStack.category})</span>
              </span>
            </label>
          ))}
        </div>
        
        {selectedTechStackIds.length > 0 && (
          <div className="selected-tech-stacks">
            <strong>Selected:</strong> {selectedTechStackIds.length} tech stack{selectedTechStackIds.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default TechStackMultiSelect;
