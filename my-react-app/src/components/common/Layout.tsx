import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (

      <main id="main-content">
      <Header />
      {children}
      <Footer />
      </main>

  );
};

export default Layout;