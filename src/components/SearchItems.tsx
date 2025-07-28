import React from 'react';

type SearchType = 'default' | 'compact' | 'outlined' | 'minimal';

interface SearchItemsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  searchType?: SearchType;
}

const SearchItems: React.FC<SearchItemsProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search projects...",
  className = "search-input",
  searchType = 'default'
}) => {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  // Define styles for different search types using CSS variables
  const getSearchStyles = (type: SearchType) => {
    const baseInputStyle = {
      paddingRight: searchTerm ? '30px' : '12px',
      paddingLeft: '12px',
      height: '40px',
      border: '1px solid var(--border-color)',
      borderRadius: '4px',
      fontSize: '14px',
      backgroundColor: 'var(--card-bg)',
      color: 'var(--text-color)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      width: '100%',
      boxSizing: 'border-box' as const,
    };

    const baseContainerStyle = {
      position: 'relative' as const,
      display: 'block',
      width: '100%',
      maxWidth: '400px',
    };

    switch (type) {
      case 'compact':
        return {
          container: {
            ...baseContainerStyle,
            maxWidth: '250px',
          },
          input: {
            ...baseInputStyle,
            height: '32px',
            fontSize: '13px',
            paddingLeft: '10px',
            paddingRight: searchTerm ? '28px' : '10px',
          },
        };

      case 'outlined':
        return {
          container: baseContainerStyle,
          input: {
            ...baseInputStyle,
            border: '2px solid var(--border-color)',
            borderRadius: '8px',
            height: '44px',
            backgroundColor: 'var(--bg-secondary)',
          },
        };

      case 'minimal':
        return {
          container: baseContainerStyle,
          input: {
            ...baseInputStyle,
            border: 'none',
            borderBottom: '2px solid var(--border-color)',
            borderRadius: '0',
            backgroundColor: 'transparent',
            paddingLeft: '0',
            paddingRight: searchTerm ? '25px' : '0',
          },
        };

      default: // 'default'
        return {
          container: baseContainerStyle,
          input: baseInputStyle,
        };
    }
  };

  const styles = getSearchStyles(searchType);

  const buttonStyle = {
    position: 'absolute' as const,
    right: searchType === 'minimal' ? '0' : '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s, opacity 0.2s',
    opacity: 0.7,
  };

  return (
    <div className="filter-group">
      <div 
        className="search-input-container" 
        style={styles.container}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className={className}
          style={styles.input}
          onFocus={(e) => {
            if (searchType === 'outlined') {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 0 0 2px var(--primary-color-alpha)';
            } else if (searchType === 'minimal') {
              e.target.style.borderBottomColor = 'var(--primary-color)';
            } else {
              e.target.style.borderColor = 'var(--primary-color)';
              e.target.style.boxShadow = '0 0 0 2px var(--primary-color-alpha)';
            }
          }}
          onBlur={(e) => {
            if (searchType === 'outlined') {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            } else if (searchType === 'minimal') {
              e.target.style.borderBottomColor = 'var(--border-color)';
            } else {
              e.target.style.borderColor = 'var(--border-color)';
              e.target.style.boxShadow = 'none';
            }
          }}
        />
        {searchTerm ? (
          <button
            type="button"
            onClick={handleClearSearch}
            className="clear-search-btn"
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.opacity = '0.7';
            }}
            title="Clear search"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#dc3545"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div
            className="search-icon"
            style={{
              ...buttonStyle,
              cursor: 'default',
              opacity: 0.5,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ transform: 'scaleX(-1)' }}
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="m21 21-4.35-4.35"
                stroke="#666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItems;
