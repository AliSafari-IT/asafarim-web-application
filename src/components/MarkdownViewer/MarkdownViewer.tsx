// Import our custom viewer that avoids router nesting issues
import { CustomMarkdownViewer } from './CustomViewers';

const MarkdownViewer = ({
  apiBaseUrl,
  basePath,
  hideFileTree,
  integrated
}: {
  apiBaseUrl: string;
  basePath?: string;
  hideFileTree?: boolean;
  integrated?: boolean;
}) => {
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{ flex: 1 }}>
        <CustomMarkdownViewer
          apiBaseUrl={apiBaseUrl}
          basePath={basePath || (integrated ? '/md-docs' : '/docs')}
          hideFileTree={hideFileTree}
        />
      </div>
    </div>
  );
};

export default MarkdownViewer;
