import React, { useState, useEffect } from 'react';
import { MarkdownViewerBase } from '@asafarim/complete-md-viewer';
import '@asafarim/complete-md-viewer/dist/style.css';

// Enhanced viewer wrapper with mobile optimizations
const EnhancedMobileViewer: React.FC<{
  apiBaseUrl: string;
  basePath?: string;
  hideFileTree?: boolean;
  useExternalRouter?: boolean;
}> = (props) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    // Initial check
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return (
    <>      
      <div className={`enhanced-viewer ${isMobile ? 'mobile' : ''}`}>
        <MarkdownViewerBase
          {...props}
          hideFileTree={isMobile ? false : props.hideFileTree}
          useExternalRouter={props.useExternalRouter || true}
        />
      </div>
    </>
  );
};

/**
 * Custom markdown viewer that doesn't create its own router
 * This avoids the "You cannot render a <Router> inside another <Router>" error
 * Can be used for both standalone and integrated modes
 */
export const CustomMarkdownViewer: React.FC<{
  apiBaseUrl: string;
  basePath?: string;
  hideFileTree?: boolean;
}> = (props) => {
  return (
    <EnhancedMobileViewer
      {...props}
      useExternalRouter={true} // Use the app's router instead of creating a new one
    />
  );
};

// Backwards compatibility exports - both point to the same component
export const CustomStandaloneViewer = CustomMarkdownViewer;
export const CustomIntegratedViewer = CustomMarkdownViewer;
