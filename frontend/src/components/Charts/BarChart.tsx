'use client'
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface CityBarChartProps {
  data: { name: string; value: number; color?: string }[]
  color?: string
  height?: number
  title?: string
  unit?: string
}

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-city-card border border-city-border rounded-lg p-3 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-medium">{payload[0].value?.toFixed(1)}{unit ? ` ${unit}` : ''}</p>
    </div>
  )
}

export default function CityBarChart({ data, color = '#00d4ff', height = 200, title, unit }: CityBarChartProps) {
  return (
    <div>
      {title && <p className="text-sm text-slate-400 mb-3 font-medium">{title}</p>}
      <ResponsiveContainer width="100%" height={height}>
        <ReBarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2744" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || color} opacity={0.85} />
            ))}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
