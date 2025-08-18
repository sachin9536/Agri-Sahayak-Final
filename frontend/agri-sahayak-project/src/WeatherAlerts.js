import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, X, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WeatherAlerts = ({ userId }) => {
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch weather alerts
  const fetchWeatherAlerts = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:8000/weather-alerts/${userId}`);
      const data = response.data;
      
      setAlerts(data.alerts || []);
      setLastUpdated(data.last_updated);
      
      // Count unread alerts (new alerts since last check)
      const storedTimestamp = localStorage.getItem(`weather_alerts_last_check_${userId}`);
      const newAlerts = data.alerts.filter(alert => {
        if (!storedTimestamp) return true;
        return new Date(alert.timestamp) > new Date(storedTimestamp);
      });
      setUnreadCount(newAlerts.length);
      
    } catch (error) {
      console.error('Failed to fetch weather alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // Mark alerts as read
  const markAlertsAsRead = () => {
    if (userId && lastUpdated) {
      localStorage.setItem(`weather_alerts_last_check_${userId}`, lastUpdated);
      setUnreadCount(0);
    }
  };

  // Toggle dropdown and mark as read
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      markAlertsAsRead();
    }
  };

  // Fetch alerts on component mount and every 30 minutes
  useEffect(() => {
    fetchWeatherAlerts();
    const interval = setInterval(fetchWeatherAlerts, 30 * 60 * 1000); // 30 minutes
    return () => clearInterval(interval);
  }, [userId]);

  // Get severity color and icon
  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
          icon: <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
        };
      case 'medium':
        return {
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
          icon: <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400" />
        };
      default:
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
          icon: <Info size={16} className="text-blue-600 dark:text-blue-400" />
        };
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
        title={t('weatherAlerts') || 'Weather Alerts'}
      >
        <Bell size={20} />
        
        {/* Notification Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Dropdown Panel */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('weatherAlerts') || 'Weather Alerts'}
              </h3>
            </div>
            <button
              onClick={() => setShowDropdown(false)}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {t('loadingAlerts') || 'Loading alerts...'}
                </p>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={32} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('noWeatherAlerts') || 'No weather alerts at this time'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {t('stayTuned') || 'We\'ll notify you of any weather conditions that may affect your crops'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {alerts.map((alert, index) => {
                  const style = getSeverityStyle(alert.severity);
                  return (
                    <div
                      key={index}
                      className={`p-3 m-2 rounded-xl border ${style.bgColor} ${style.borderColor} ${style.textColor}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {style.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{alert.icon}</span>
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                          </div>
                          <p className="text-xs leading-relaxed mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between text-xs opacity-75">
                            <span>{alert.district}</span>
                            <span>{formatTime(alert.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {alerts.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <button
                onClick={fetchWeatherAlerts}
                disabled={loading}
                className="w-full text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium py-1 disabled:opacity-50"
              >
                {loading ? (t('refreshing') || 'Refreshing...') : (t('refresh') || 'Refresh')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default WeatherAlerts;
