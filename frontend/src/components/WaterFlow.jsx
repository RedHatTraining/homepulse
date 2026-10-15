function WaterFlow({ reading }) {
  if (!reading) return null;

  const totalFlow = reading.water_main_lpm + reading.water_rain_lpm;
  const mainPct = totalFlow > 0 ? (reading.water_main_lpm / totalFlow) * 100 : 0;
  const rainPct = totalFlow > 0 ? (reading.water_rain_lpm / totalFlow) * 100 : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontWeight: "bold", fontSize: "20px" }}>
          {totalFlow.toFixed(1)} L/min
        </span>
        <span style={{ color: "#6a6e73" }}>Total flow</span>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            marginBottom: "4px",
          }}
        >
          <span>Main Supply</span>
          <span>{reading.water_main_lpm} L/min</span>
        </div>
        <div
          style={{
            background: "#e0e0e0",
            borderRadius: "4px",
            height: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${mainPct}%`,
              background: "#06c",
              height: "100%",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            marginBottom: "4px",
          }}
        >
          <span>Rain Harvesting</span>
          <span>{reading.water_rain_lpm} L/min</span>
        </div>
        <div
          style={{
            background: "#e0e0e0",
            borderRadius: "4px",
            height: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${rainPct}%`,
              background: "#3e8635",
              height: "100%",
              borderRadius: "4px",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "13px",
        }}
      >
        <span>Rain Tank</span>
        <span style={{ fontWeight: "bold" }}>{reading.rain_tank_pct}%</span>
      </div>
      <div
        style={{
          background: "#e0e0e0",
          borderRadius: "4px",
          height: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${reading.rain_tank_pct}%`,
            background: "#009596",
            height: "100%",
            borderRadius: "4px",
          }}
        />
      </div>
    </div>
  );
}

export default WaterFlow;
