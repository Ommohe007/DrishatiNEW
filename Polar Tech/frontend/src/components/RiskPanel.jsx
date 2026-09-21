/**
 * RiskPanel.jsx — AI Predictive Risk Gauges (MoES Defense Grade)
 * Project Drishti | SIH 2026 PS-26060
 */
import React from 'react'
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const LEVEL_COLORS = {
  HIGH: '#ef4444',    // Defense Red
  MEDIUM: '#f59e0b',  // Advisory Amber
  LOW: '#10b981',     // Nominal Emerald
}

function RiskGauge({ label, score, level, horizon }) {
  const color = LEVEL_COLORS[level] || LEVEL_COLORS.LOW
  const pct = Math.round((score || 0) * 100)
  const data = [{ value: pct, fill: color }]

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center shadow-sm">
      <div style={{ width: 85, height: 85 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="55%" outerRadius="100%"
            startAngle={225} endAngle={-45}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background={{ fill: 'rgba(255,255,255,0.05)' }}
              dataKey="value"
              cornerRadius={4}
              fill={color}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-1 w-full">
        <div className="text-sm font-bold font-mono" style={{ color }}>{pct}%</div>
        <div className="text-[11px] text-slate-300 font-medium leading-tight truncate">{label}</div>
        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Horizon: {horizon}</div>
        <span
          className="text-[9px] font-bold font-mono px-2 py-0.5 rounded mt-1 inline-block border"
          style={{ color, borderColor: `${color}40`, background: `${color}15` }}
        >
          {level || 'NOMINAL'}
        </span>
      </div>
    </div>
  )
}

export default function RiskPanel({ riskData }) {
  const risks = riskData?.risks

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700">
            AI-ML
          </span>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Predictive Risk Assessment Engine (RandomForest / GradientBoosting)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">60s Cycle</span>
      </div>

      {risks ? (
        <>
          <div className="grid grid-cols-3 gap-2.5">
            <RiskGauge
              label="Blizzard Storm"
              score={risks.blizzard?.score}
              level={risks.blizzard?.level}
              horizon={risks.blizzard?.horizon || '6h'}
            />
            <RiskGauge
              label="Fuel Criticality"
              score={risks.fuel_critical?.score}
              level={risks.fuel_critical?.level}
              horizon={risks.fuel_critical?.horizon || '7d'}
            />
            <RiskGauge
              label="Water Freeze"
              score={risks.water_freeze?.score}
              level={risks.water_freeze?.level}
              horizon={risks.water_freeze?.horizon || '12h'}
            />
          </div>
          {riskData.recommendation && (
            <div className="mt-3 p-2.5 bg-slate-950/90 border border-slate-700 rounded text-xs text-slate-200 flex items-start gap-2">
              <span className="text-blue-400 font-bold whitespace-nowrap font-mono">[MoES Advisory]</span>
              <span className="text-slate-300 leading-relaxed">{riskData.recommendation}</span>
            </div>
          )}
        </>
      ) : (
        <div className="text-slate-500 text-xs text-center py-6 font-mono">
          Awaiting ML inference telemetry pipeline...
        </div>
      )}
    </div>
  )
}
