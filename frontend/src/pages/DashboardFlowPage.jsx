import { useState, useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const WEATHER_EMOJI = {
  sunny: "☀️",
  clear: "🌙",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  overcast: "🌥️",
  rainy: "🌧️",
};

const ACCENT = "#2dd4bf";
const HANDLE_STYLE = { background: "#4b5563", border: "2px solid #6b7280", width: 10, height: 10 };

const cardStyle = {
  background: "rgba(30, 41, 59, 0.85)",
  border: "1px solid rgba(100, 116, 139, 0.4)",
  borderRadius: 12,
  padding: "16px 22px",
  textAlign: "center",
  minWidth: 150,
  backdropFilter: "blur(8px)",
  position: "relative",
  overflow: "hidden",
};

function AccentBar({ position = "top", active = true }) {
  return (
    <div style={{
      position: "absolute",
      [position]: 0,
      left: "20%",
      width: "60%",
      height: 3,
      background: active ? ACCENT : "#334155",
      borderRadius: position === "top" ? "0 0 2px 2px" : "2px 2px 0 0",
      transition: "background 0.5s ease",
    }} />
  );
}

function IconBadge({ emoji, size = 36 }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "rgba(51, 65, 85, 0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.5,
      margin: "0 auto 8px",
    }}>
      {emoji}
    </div>
  );
}

function SolarNode({ data }) {
  const active = (data.solar_kw ?? 0) > 0;
  return (
    <div style={cardStyle}>
      <AccentBar active={active} />
      <IconBadge emoji="☀️" />
      <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>Solar Panels</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: active ? "#fff" : "#64748b", marginTop: 4 }}>
        {data.solar_kw ?? "—"} <span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8" }}>kW</span>
      </div>
      <AccentBar position="bottom" active={active} />
      <Handle type="source" position={Position.Right} id="to-home" style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Bottom} id="to-battery" style={HANDLE_STYLE} />
    </div>
  );
}

function HomeNode({ data }) {
  const emoji = WEATHER_EMOJI[data.weather] ?? "🌡️";
  const active = (data.home_kw ?? 0) > 0;
  return (
    <div style={{ ...cardStyle, minWidth: 180, padding: "20px 28px" }}>
      <AccentBar active={active} />
      <IconBadge emoji="🏠" size={44} />
      <div style={{ fontWeight: 700, fontSize: 16, color: "#e2e8f0" }}>Home</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 4 }}>
        {data.home_kw ?? "—"} <span style={{ fontSize: 14, fontWeight: 400, color: "#94a3b8" }}>kW</span>
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
        {emoji} {data.weather?.replace("_", " ") ?? "—"} · {data.temp_c ?? "—"}°C
      </div>
      <AccentBar position="bottom" active={active} />
      <Handle type="target" position={Position.Left} id="from-solar" style={{ ...HANDLE_STYLE, top: "30%" }} />
      <Handle type="target" position={Position.Left} id="from-battery" style={{ ...HANDLE_STYLE, top: "70%" }} />
      <Handle type="target" position={Position.Right} id="from-grid" style={HANDLE_STYLE} />
      <Handle type="target" position={Position.Bottom} id="from-water" style={{ ...HANDLE_STYLE, left: "35%" }} />
      <Handle type="target" position={Position.Bottom} id="from-rain" style={{ ...HANDLE_STYLE, left: "65%" }} />
    </div>
  );
}

function BatteryNode({ data }) {
  const pct = data.battery_pct ?? 0;
  const active = (data.battery_to_home ?? 0) > 0 || (data.solar_to_battery ?? 0) > 0;
  const fillColor = pct > 50 ? ACCENT : pct > 20 ? "#f59e0b" : "#ef4444";
  return (
    <div style={cardStyle}>
      <AccentBar active={active} />
      <IconBadge emoji="🔋" />
      <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>Battery</div>
      <div style={{
        margin: "10px auto 6px",
        width: 80,
        height: 8,
        background: "rgba(51, 65, 85, 0.6)",
        borderRadius: 4,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: fillColor,
          borderRadius: 4,
          transition: "width 0.5s ease",
        }} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{pct}%</div>
      <AccentBar position="bottom" active={active} />
      <Handle type="target" position={Position.Top} id="from-solar" style={HANDLE_STYLE} />
      <Handle type="source" position={Position.Right} id="to-home" style={HANDLE_STYLE} />
    </div>
  );
}

function GridNode({ data }) {
  const kw = data.grid_to_home ?? 0;
  const active = kw > 0;
  return (
    <div style={cardStyle}>
      <AccentBar active={active} />
      <IconBadge emoji="⚡" />
      <div style={{ fontWeight: 700, fontSize: 14, color: "#e2e8f0" }}>Power Grid</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: active ? "#fff" : "#64748b", marginTop: 4 }}>
        {kw} <span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8" }}>kW</span>
      </div>
      <AccentBar position="bottom" active={active} />
      <Handle type="source" position={Position.Left} id="to-home" style={HANDLE_STYLE} />
    </div>
  );
}

function WaterNode({ data }) {
  const active = (data.water_main_lpm ?? 0) > 0;
  return (
    <div style={cardStyle}>
      <AccentBar active={active} />
      <IconBadge emoji="💧" />
      <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>Main Supply</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: active ? "#fff" : "#64748b", marginTop: 4 }}>
        {data.water_main_lpm ?? 0} <span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>L/m</span>
      </div>
      <AccentBar position="bottom" active={active} />
      <Handle type="source" position={Position.Top} id="to-home" style={HANDLE_STYLE} />
    </div>
  );
}

function RainTankNode({ data }) {
  const pct = data.rain_tank_pct ?? 0;
  const active = (data.water_rain_lpm ?? 0) > 0;
  return (
    <div style={cardStyle}>
      <AccentBar active={active} />
      <IconBadge emoji="🌧️" />
      <div style={{ fontWeight: 700, fontSize: 13, color: "#e2e8f0" }}>Rain Tank</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: active ? "#fff" : "#64748b", marginTop: 4 }}>
        {pct}<span style={{ fontSize: 12, fontWeight: 400, color: "#94a3b8" }}>%</span>
      </div>
      <div style={{ fontSize: 11, color: active ? "#94a3b8" : "#475569" }}>
        {data.water_rain_lpm ?? 0} L/m
      </div>
      <AccentBar position="bottom" active={active} />
      <Handle type="source" position={Position.Top} id="to-home" style={HANDLE_STYLE} />
    </div>
  );
}

const nodeTypes = {
  solar: SolarNode,
  home: HomeNode,
  battery: BatteryNode,
  grid: GridNode,
  water: WaterNode,
  rainTank: RainTankNode,
};

const INITIAL_NODES = [
  { id: "solar", type: "solar", position: { x: 50, y: 30 }, data: {} },
  { id: "home", type: "home", position: { x: 350, y: 60 }, data: {} },
  { id: "battery", type: "battery", position: { x: 50, y: 260 }, data: {} },
  { id: "grid", type: "grid", position: { x: 650, y: 80 }, data: {} },
  { id: "water", type: "water", position: { x: 280, y: 320 }, data: {} },
  { id: "rainTank", type: "rainTank", position: { x: 450, y: 320 }, data: {} },
];

function makeEdge(id, source, target, sourceHandle, targetHandle, value, label) {
  const active = (value || 0) > 0;
  return {
    id,
    source,
    target,
    sourceHandle,
    targetHandle,
    animated: active,
    label: active ? label : "",
    style: {
      stroke: active ? "#94a3b8" : "#334155",
      strokeWidth: active ? 2 : 1,
      opacity: active ? 1 : 0.3,
    },
    labelStyle: { fill: "#e2e8f0", fontWeight: 600, fontSize: 11, fontFamily: "monospace" },
    labelBgStyle: { fill: "#1e293b", fillOpacity: 0.9 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
  };
}

function makeEdges(reading) {
  if (!reading) return [];
  return [
    makeEdge("solar-home", "solar", "home", "to-home", "from-solar", reading.solar_to_home, `${reading.solar_to_home} kW`),
    makeEdge("solar-battery", "solar", "battery", "to-battery", "from-solar", reading.solar_to_battery, `${reading.solar_to_battery} kW`),
    makeEdge("battery-home", "battery", "home", "to-home", "from-battery", reading.battery_to_home, `${reading.battery_to_home} kW`),
    makeEdge("grid-home", "grid", "home", "to-home", "from-grid", reading.grid_to_home, `${reading.grid_to_home} kW`),
    makeEdge("water-home", "water", "home", "to-home", "from-water", reading.water_main_lpm, `${reading.water_main_lpm} L/m`),
    makeEdge("rain-home", "rainTank", "home", "to-home", "from-rain", reading.water_rain_lpm, `${reading.water_rain_lpm} L/m`),
  ];
}

function DashboardFlowPage() {
  const [reading, setReading] = useState(null);
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    function fetchAll() {
      fetch("/api/home/status")
        .then((r) => (r.ok ? r.json() : null))
        .then(setReading);
      fetch("/api/devices")
        .then((r) => r.json())
        .then(setDevices);
    }
    fetchAll();
    const interval = setInterval(fetchAll, 3000);
    return () => clearInterval(interval);
  }, []);

  const nodes = useMemo(() => {
    if (!reading) return INITIAL_NODES;
    return INITIAL_NODES.map((n) => ({ ...n, data: { ...reading } }));
  }, [reading]);

  const edges = useMemo(() => makeEdges(reading), [reading]);
  const onlineCount = devices.filter((a) => a.status === "on").length;

  return (
    <div style={{
      width: "100%",
      height: "calc(100vh - 80px)",
      position: "relative",
      background: "#0f172a",
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant="dots" gap={24} size={1} color="#1e293b" />
        <Controls showInteractive={false} />
      </ReactFlow>

      {reading && (
        <div style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 24,
          background: "rgba(30, 41, 59, 0.9)",
          borderRadius: 12,
          padding: "10px 24px",
          border: "1px solid rgba(100, 116, 139, 0.3)",
          backdropFilter: "blur(8px)",
          fontFamily: "monospace",
          fontSize: 12,
          fontWeight: 600,
          color: "#94a3b8",
        }}>
          <span>Carbon: {reading.home_carbon_gco2 ?? "—"} gCO₂/kWh</span>
          <span style={{ color: ACCENT }}>Clean: {reading.clean_pct ?? "—"}%</span>
          <span>Devices: {onlineCount} on</span>
          <span>{reading.water_event ? reading.water_event : "Water: idle"}</span>
        </div>
      )}
    </div>
  );
}

export default DashboardFlowPage;
