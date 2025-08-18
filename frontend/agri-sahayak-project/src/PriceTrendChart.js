import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from 'recharts';
import { X } from 'lucide-react';

const PriceTrendChart = ({ isOpen, onClose, userId }) => {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show7Days, setShow7Days] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      (async () => {
        try {
          setLoading(true);
          const res = await axios.get(`http://127.0.0.1:8000/market-price-history/${userId}`);
          setData(res.data);
        } catch (_) {
          setData(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  const locale = (i18n?.language || 'en').toLowerCase().startsWith('hi') ? 'hi-IN' : 'en-US';
  const chartData = (data?.price_history || []).slice(show7Days ? -7 : -30).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
  }));

  const maybeTitle = t('priceTrendChart.title');
  const localizedTitle = maybeTitle === 'priceTrendChart.title' ? 'Price Trend Chart' : maybeTitle;
  const title = localizedTitle + (data?.crop ? ` • ${String(data.crop).toUpperCase()}` : '');

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-3 sm:p-5" onClick={onClose}>
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-5xl h-[82vh] max-h-[820px] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex flex-wrap justify-between items-center gap-3 p-5 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <div className="flex items-center gap-3">
              <button onClick={() => setShow7Days(true)} className={`px-3 py-1.5 text-sm rounded-md ${show7Days ? 'bg-agri-blue text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>7D</button>
              <button onClick={() => setShow7Days(false)} className={`px-3 py-1.5 text-sm rounded-md ${!show7Days ? 'bg-agri-blue text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>30D</button>
              <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 ml-1">
                <X size={20} />
              </button>
          </div>
        </div>
        <div className="flex-grow p-5">
          {loading ? (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 16, right: 24, left: 56, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.25)" />
                <XAxis dataKey="date" tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} tickMargin={10} />
                <YAxis 
                  width={56}
                  tick={{ fill: 'rgb(156 163 175)', fontSize: 12 }} 
                  tickMargin={10}
                  allowDecimals={false}
                  domain={[dataMin => Math.floor(dataMin - 100), dataMax => Math.ceil(dataMax + 100)]}
                  tickFormatter={(value) => `₹${Number(value).toLocaleString(locale === 'hi-IN' ? 'en-IN' : 'en-IN')}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                    borderColor: 'rgb(55 65 81)',
                    color: '#fff',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, t('price')]} 
                />
                <Legend formatter={(value) => <span className="capitalize text-gray-700 dark:text-gray-300">{t(value)}</span>} />
                <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 7 }} dot={{ r: 3.5 }} name={data.crop} />
                {!show7Days && (
                  <Brush dataKey="date" height={24} travellerWidth={8} stroke="#10b981" />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">{t('priceTrendChart.noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceTrendChart;
