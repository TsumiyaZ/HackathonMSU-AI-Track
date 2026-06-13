"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#8A2BE2', '#4169E1', '#00CED1', '#FF6347', '#FFD700'];

type ExpenseData = { name: string; value: number }[];
type MonthlySpendData = { name: string; spend: number }[];

interface DashboardChartsProps {
  expenseData: ExpenseData;
  monthlySpend: MonthlySpendData;
}

export function DashboardCharts({ expenseData, monthlySpend }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="font-display text-lg font-semibold mb-6">ค่าใช้จ่ายตามหมวดหมู่</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => `฿${Number(value).toLocaleString()}`}
                contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-white/5">
        <h3 className="font-display text-lg font-semibold mb-6">แนวโน้มการใช้จ่าย (6 เดือนล่าสุด)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySpend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(value: any) => `฿${Number(value)/1000}k`} />
              <Tooltip 
                formatter={(value: any) => `฿${Number(value).toLocaleString()}`}
                contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="spend" fill="#4169E1" radius={[4, 4, 0, 0]} name="งบประมาณที่ใช้" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
