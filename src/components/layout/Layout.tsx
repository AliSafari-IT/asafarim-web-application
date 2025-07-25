import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} ASafariM - All rights reserved</p>
      </footer>
    </div>
  );
};

export default Layout;
