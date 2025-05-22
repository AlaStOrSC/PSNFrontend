import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const data = [
  { users: 1000, environmentalImpact: 10 },
  { users: 2000, environmentalImpact: 25 },
  { users: 3000, environmentalImpact: 45 },
  { users: 4000, environmentalImpact: 70 },
  { users: 5000, environmentalImpact: 100 },
];

function EnvironmentalImpactChart() {
  const { t } = useTranslation();

  return (
    <div className="bg-neutral dark:bg-dark-bg py-12">
      <h2 className="text-3xl font-bold text-primary dark:text-dark-text-accent text-center mb-6">
        {t('conocenos.chart.title')}
      </h2>
      <p className="text-lg text-gray-700 dark:text-dark-text-secondary text-center mb-8 max-w-3xl mx-auto">
        {t('conocenos.chart.description')}
      </p>
      <div className="w-full h-96">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" strokeOpacity={0.5} />
            <XAxis
              dataKey="users"
              label={{ value: t('conocenos.chart.x_axis'), position: 'bottom', offset: 10, fill: '#374151' }}
              stroke="#374151"
              tick={{ fill: '#374151' }}
              className="dark:text-dark-text-primary"
            />
            <YAxis
              label={{ value: t('conocenos.chart.y_axis'), angle: -90, position: 'insideLeft', offset: 10, fill: '#374151' }}
              stroke="#374151"
              tick={{ fill: '#374151' }}
              className="dark:text-dark-text-primary"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                color: '#374151',
              }}
              wrapperClassName="dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:border-dark-border"
            />
            <Legend verticalAlign="top" height={36} formatter={() => t('conocenos.chart.legend')} />
            <Line
              type="monotone"
              dataKey="environmentalImpact"
              name={t('conocenos.chart.legend')}
              stroke="#05374d"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              className="dark:stroke-dark-primary"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default EnvironmentalImpactChart;