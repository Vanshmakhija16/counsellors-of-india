'use client'

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts'

interface Point {
  date: string
  score: number
  severity: string
}

interface ScreeningTrendProps {
  data: Point[]
  min: number
  max: number
}

export default function ScreeningTrend({ data, min, max }: ScreeningTrendProps) {
  if (data.length < 2) {
    return (
      <div className="h-20 flex items-center text-xs text-[#9ca3af]">
        Need at least two administrations to plot a trend.
      </div>
    )
  }

  return (
    <div className="h-20 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
          <YAxis hide domain={[min, max]} />
          <XAxis dataKey="date" hide />
          <Tooltip
            cursor={{ stroke: '#b8ceca', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid #e8e4df',
              background: 'white',
              fontSize: 12,
            }}
            labelFormatter={(v) => new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            formatter={((value: number, _name: unknown, item: { payload?: Point }) => {
              const sev = item?.payload?.severity
              return [`${value} · ${sev ?? ''}`, 'Score']
            }) as never}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2d4a47"
            strokeWidth={2}
            dot={{ r: 3, fill: '#2d4a47' }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
