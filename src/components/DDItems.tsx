import React from 'react';

type DropdownType = 'default' | 'compact' | 'outlined' | 'minimal';

interface DropdownItem {
  value: string;
  label: string;
}

interface DDItemsProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  items: DropdownItem[];
  dropdownType?: DropdownType;
  className?: string;
  placeholder?: string;
}

const DDItems: React.FC<DDItemsProps> = ({
  selectedValue,
  onValueChange,
  items,
  dropdownType = 'default',
  className = 'filter-select',
  placeholder = 'Select an option'
}) => {
  // Define styles for different dropdown types using CSS variables
  const getDropdownStyles = (type: DropdownType) => {
    const baseSelectStyle = {
      padding: '8px 12px',
      height: '40px',
      border: '1px solid var(--border-color)',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-color)',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
      width: '100%',
      boxSizing: 'border-box' as const,
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '16px',
      paddingRight: '40px',
    };

    const baseContainerStyle = {
      position: 'relative' as const,
      display: 'block',
      width: '100%',
      maxWidth: '200px',
    };

    switch (type) {
      case 'compact':
        return {
          container: {
            ...baseContainerStyle,
            maxWidth: '160px',
          },
          select: {
            ...baseSelectStyle,
            height: '32px',
            fontSize: '13px',
            padding: '6px 10px',
            paddingRight: '32px',
            backgroundSize: '14px',
            backgroundPosition: 'right 10px center',
          },
        };

      case 'outlined':
        return {
          container: baseContainerStyle,
          select: {
            ...baseSelectStyle,
            border: '2px solid var(--border-color)',
            borderRadius: '8px',
            height: '44px',
            backgroundColor: 'var(--bg-secondary)',
            padding: '10px 14px',
            paddingRight: '44px',
            backgroundPosition: 'right 14px center',
          },
        };

      case 'minimal':
        return {
          container: baseContainerStyle,
          select: {
            ...baseSelectStyle,
            border: 'none',
            borderBottom: '2px solid var(--border-color)',
            borderRadius: '0',
            backgroundColor: 'transparent',
            padding: '8px 0',
            paddingRight: '30px',
            backgroundPosition: 'right 0 center',
          },
        };

      default: // 'default'
        return {
          container: baseContainerStyle,
          select: baseSelectStyle,
        };
    }
  };

  const styles = getDropdownStyles(dropdownType);

  // Create dropdown options with placeholder, avoiding duplicate keys
  const dropdownOptions = [
    { value: '', label: placeholder },
    ...items.filter(item => item.value !== '') // Filter out empty values to avoid duplicates
  ];

  return (
    <div className="filter-group">
      <div 
        className="dropdown-container" 
        style={styles.container}
      >
        <select
          value={selectedValue}
          onChange={(e) => onValueChange(e.target.value)}
          className={className}
          style={styles.select}
          onFocus={(e) => {
            if (dropdownType === 'outlined') {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 0 0 2px var(--primary-color-alpha)';
            } else if (dropdownType === 'minimal') {
              e.target.style.borderBottomColor = 'var(--primary-color)';
            } else {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 0 0 2px var(--primary-color-alpha)';
            }
          }}
          onBlur={(e) => {
            if (dropdownType === 'outlined') {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            } else if (dropdownType === 'minimal') {
              e.target.style.borderBottomColor = 'var(--border-color)';
            } else {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }
          }}
        >
          {dropdownOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              style={{
                backgroundColor: 'var(--card-bg)',
                color: 'var(--text-color)',
              }}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DDItems;
