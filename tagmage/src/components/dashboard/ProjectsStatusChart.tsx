'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface ProjectsStatusChartProps {
  title?: string;
  data: ChartData[];
}

const COLORS = {
  ok: '#22c55e', // green-500
  warning: '#f97316', // orange-500
  attention: '#ef4444', // red-500
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ProjectsStatusChart({ title = "Saúde dos Projetos", data }: ProjectsStatusChartProps) {
  const hasData = data && data.some(item => item.value > 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      <>
        {hasData ? (
          <div className="flex-1 -ml-6">
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number, name: string) => [`${value} projeto(s)`, name]}
                />
                <Legend 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px' }}
                />
                </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sem dados de projetos</h3>
              <p className="mt-1 text-sm text-gray-500">Adicione um projeto para ver o gráfico.</p>
            </div>
          </div>
        )}
      </>
    </div>
  );
} 