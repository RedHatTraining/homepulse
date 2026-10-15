function FlowNode({ label, value, unit, color, x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="45" fill={color} opacity="0.15" />
      <circle r="45" fill="none" stroke={color} strokeWidth="2" />
      <text textAnchor="middle" y="-8" fontSize="12" fill="#6a6e73">
        {label}
      </text>
      <text textAnchor="middle" y="14" fontSize="18" fontWeight="bold">
        {value}
      </text>
      <text textAnchor="middle" y="30" fontSize="11" fill="#6a6e73">
        {unit}
      </text>
    </g>
  );
}

function FlowArrow({ x1, y1, x2, y2, active, color = "#06c" }) {
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={active ? color : "#d2d2d2"}
      strokeWidth={active ? 2.5 : 1.5}
      strokeDasharray={active ? "none" : "6,4"}
      markerEnd={active ? "url(#arrowhead)" : ""}
    />
  );
}

function EnergyFlow({ reading }) {
  if (!reading) return null;

  const solarActive = reading.solar_kw > 0.1;
  const gridActive = reading.grid_kw > 0.1;
  const batteryCharging = reading.battery_kw > 0.1;
  const batteryDischarging = reading.battery_kw < -0.1;

  return (
    <svg viewBox="0 0 500 300" style={{ width: "100%", maxWidth: "500px" }}>
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 8 3, 0 6" fill="#06c" />
        </marker>
      </defs>

      {/* Solar → Home */}
      <FlowArrow
        x1={140}
        y1={65}
        x2={225}
        y2={130}
        active={solarActive}
        color="#f0ab00"
      />
      {/* Grid → Home */}
      <FlowArrow
        x1={360}
        y1={65}
        x2={275}
        y2={130}
        active={gridActive}
        color="#c9190b"
      />
      {/* Home → Battery / Battery → Home */}
      <FlowArrow
        x1={250}
        y1={200}
        x2={250}
        y2={245}
        active={batteryCharging}
        color="#3e8635"
      />
      {batteryDischarging && (
        <FlowArrow
          x1={250}
          y1={245}
          x2={250}
          y2={200}
          active
          color="#3e8635"
        />
      )}

      {/* Solar */}
      <FlowNode
        label="Solar"
        value={reading.solar_kw}
        unit="kW"
        color="#f0ab00"
        x={120}
        y={50}
      />

      {/* Grid */}
      <FlowNode
        label="Grid"
        value={reading.grid_kw}
        unit="kW"
        color="#c9190b"
        x={380}
        y={50}
      />

      {/* Home */}
      <FlowNode
        label="Home"
        value={reading.home_kw}
        unit="kW"
        color="#06c"
        x={250}
        y={150}
      />

      {/* Battery */}
      <FlowNode
        label="Battery"
        value={`${reading.battery_pct}%`}
        unit={`${Math.abs(reading.battery_kw)} kW`}
        color="#3e8635"
        x={250}
        y={265}
      />
    </svg>
  );
}

export default EnergyFlow;
