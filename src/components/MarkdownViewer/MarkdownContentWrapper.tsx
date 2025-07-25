import React from 'react';
// Import from our lib directory which re-exports from the local package
import { IntegratedMarkdownViewer, StandaloneMarkdownViewer } from '@asafarim/complete-md-viewer';

interface MarkdownContentWrapperProps {
  apiBaseUrl: string;
  hideFileTree?: boolean;
  basePath?: string;
  integrated?: boolean;
}

/**
 * Wrapper component for MarkdownContent that provides its own Router context
 * This solves the issue with useNavigate() being used outside of Router context
 */
const MarkdownContentWrapper: React.FC<MarkdownContentWrapperProps> = ({
  apiBaseUrl,
  hideFileTree = false,
  basePath = '/docs',
  integrated = false,
}) => {
  // Pass the props directly to MarkdownContent
  // We're not using a Router here as the app already has one
  return (
    integrated ? <IntegratedMarkdownViewer
      apiBaseUrl={apiBaseUrl}
      basePath={basePath}
      hideFileTree={hideFileTree}
    />
    : <StandaloneMarkdownViewer
      apiBaseUrl={apiBaseUrl}
      basePath={basePath}
      hideFileTree={hideFileTree}
    />
  );
};


export default MarkdownContentWrapper;
