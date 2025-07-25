import { useContext, useState } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sample data for the dashboard
  const stats = [
    { id: 1, title: 'Total Users', value: '1,245', change: '+12%' },
    { id: 2, title: 'Active Projects', value: '48', change: '+5%' },
    { id: 3, title: 'Documentation Pages', value: '156', change: '+8%' },
    { id: 4, title: 'System Uptime', value: '99.9%', change: '0%' }
  ];

  return (
    <div className={`dashboard-container ${theme}`}>
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your application dashboard</p>
      </div>
      
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="stats-grid">
            {stats.map(stat => (
              <div key={stat.id} className="stat-card">
                <h3>{stat.title}</h3>
                <div className="stat-value">{stat.value}</div>
                <div className={`stat-change ${stat.change.startsWith('+') ? 'positive' : stat.change === '0%' ? 'neutral' : 'negative'}`}>
                  {stat.change}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics-placeholder">
            <h2>Analytics Dashboard</h2>
            <p>Analytics features would be displayed here.</p>
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div className="settings-placeholder">
            <h2>Dashboard Settings</h2>
            <p>Settings options would be displayed here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
