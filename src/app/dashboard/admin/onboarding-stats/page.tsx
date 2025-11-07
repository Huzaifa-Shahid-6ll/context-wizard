'use client';

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const OnboardingStatsPage = () => {
  const stats = useQuery(api.onboarding.getOnboardingStats);

  if (!stats) {
    return <div className="p-6">Loading...</div>;
  }

  // Prepare data for charts
  const roleData = Object.entries(stats.roleBreakdown).map(([role, count]) => ({
    name: role,
    count: count as number
  }));

  const painPointData = Object.entries(stats.painPointBreakdown).map(([painPoint, count]) => ({
    name: painPoint,
    count: count as number
  }));

  const toolsData = Object.entries(stats.toolsBreakdown).map(([tool, count]) => ({
    name: tool,
    count: count as number
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-8">Onboarding Statistics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Total Responses</h3>
          <p className="text-3xl font-bold text-blue-400">{stats.totalResponses}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Roles</h3>
          <p className="text-3xl font-bold text-green-400">{roleData.length}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Pain Points</h3>
          <p className="text-3xl font-bold text-yellow-400">{painPointData.length}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-300 mb-2">Tools</h3>
          <p className="text-3xl font-bold text-purple-400">{toolsData.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Role Distribution Pie Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Role Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pain Point Distribution Bar Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Pain Point Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={painPointData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 100,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Pain Points" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Tool Usage Bar Chart */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Tool Usage</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={toolsData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 100,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Tool Usage" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Roles Table */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Top 5 Roles</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="py-2 px-4 text-left text-gray-300">Role</th>
                  <th className="py-2 px-4 text-right text-gray-300">Count</th>
                  <th className="py-2 px-4 text-right text-gray-300">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {roleData
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 5)
                  .map((item, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-2 px-4 text-gray-200">{item.name}</td>
                      <td className="py-2 px-4 text-right text-gray-200">{item.count}</td>
                      <td className="py-2 px-4 text-right text-gray-200">
                        {((item.count / stats.totalResponses) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Additional Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Most Common Pain Points</h3>
            <ul className="space-y-2">
              {painPointData
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((item, index) => (
                  <li key={index} className="flex justify-between text-gray-200">
                    <span>{item.name}</span>
                    <span className="text-blue-400">{item.count}</span>
                  </li>
                ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Most Used Tools</h3>
            <ul className="space-y-2">
              {toolsData
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map((item, index) => (
                  <li key={index} className="flex justify-between text-gray-200">
                    <span>{item.name}</span>
                    <span className="text-green-400">{item.count}</span>
                  </li>
                ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">User Goals</h3>
            <p className="text-gray-400">Goal distribution data would appear here once collected.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatsPage;