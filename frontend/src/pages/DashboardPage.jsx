import { useState, useEffect } from "react";
import {
  PageSection,
  Card,
  CardBody,
  Grid,
  GridItem,
  Label,
} from "@patternfly/react-core";

function Bar({ value, max, color, showPct = false }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const filled = Math.round(pct / 10);
  const empty = 10 - filled;
  return (
    <span style={{ fontFamily: "monospace", fontSize: "14px" }}>
      <span style={{ color }}>{"█".repeat(filled)}</span>
      <span style={{ color: "#d2d2d2" }}>{"░".repeat(empty)}</span>
      {showPct && <>{" "}{pct}%</>}
    </span>
  );
}

function StatusDot({ ok }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: ok ? "#3e8635" : "#c9190b",
        marginRight: "6px",
      }}
    />
  );
}


function DashboardPage() {
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

  const onlineDevices = devices.filter((a) => a.status === "on");
  const totalDraw = onlineDevices.reduce((sum, a) => sum + a.power_w, 0);

  const homeKw = reading?.home_kw || 1;
  const waterTotal = reading
    ? reading.water_main_lpm + reading.water_rain_lpm
    : 0;

  return (
    <>
      <PageSection>
        <Grid hasGutter>
          {/* Left: Connected Devices */}
          <GridItem span={6}>
            <Card isFullHeight>
              <CardBody>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                    color: "#6a6e73",
                  }}
                >
                  Connected Devices
                </div>
                <p style={{ fontSize: "13px", color: "#6a6e73", marginBottom: "12px" }}>
                  Appliances and their current power draw. Click a status label to toggle on/off.
                </p>
                <table
                  style={{
                    width: "100%",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    borderCollapse: "collapse",
                  }}
                >
                  <tbody>
                    {devices.map((a) => (
                      <tr
                        key={a.id}
                        style={{
                          borderBottom: "1px solid #f0f0f0",
                          opacity: a.status === "on" ? 1 : 0.5,
                        }}
                      >
                        <td style={{ padding: "8px 4px" }}>
                          <Label
                            color={a.status === "on" ? "green" : "grey"}
                            isCompact
                            onClick={() => {
                              const newStatus = a.status === "on" ? "off" : "on";
                              fetch(`/api/devices/${a.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus }),
                              }).then(() => {
                                fetch("/api/devices").then((r) => r.json()).then(setDevices);
                              });
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            {a.status.toUpperCase()}
                          </Label>
                        </td>
                        <td style={{ padding: "8px 4px" }}>{a.name}</td>
                        <td
                          style={{
                            padding: "8px 4px",
                            textAlign: "right",
                          }}
                        >
                          {a.status === "on"
                            ? `${a.power_w}W`
                            : a.standby_w
                              ? `${a.standby_w}W`
                              : "0W"}
                          {a.water_lpm && a.status === "on" && (
                            <span style={{ color: "#06c", marginLeft: "4px" }}>
                              💧{a.water_lpm}L/m
                            </span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "8px 4px",
                            color: a.activity === "Running" ? "#06c" : "#6a6e73",
                            fontWeight: a.activity === "Running" ? "bold" : "normal",
                          }}
                        >
                          {a.activity ||
                            (a.status === "on"
                              ? "Active"
                              : a.standby_w
                                ? "Standby"
                                : "Off")}
                        </td>
                        <td style={{ padding: "8px 4px", width: "100px" }}>
                          {(() => {
                            const max = a.nominal_w || a.power_w;
                            const cur = a.status === "on" ? a.power_w : (a.standby_w || 0);
                            const pct = Math.min(100, Math.round((cur / max) * 100));
                            const color = pct > 80 ? "#c9190b" : pct > 50 ? "#f0ab00" : "#3e8635";
                            return (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <div style={{
                                  flex: 1, height: "6px", background: "#f0f0f0",
                                  borderRadius: "3px", overflow: "hidden",
                                }}>
                                  <div style={{
                                    width: `${pct}%`, height: "100%",
                                    background: color, borderRadius: "3px",
                                    transition: "width 0.5s ease",
                                  }} />
                                </div>
                                <span style={{ fontSize: "11px", color: "#6a6e73", minWidth: "28px" }}>
                                  {pct}%
                                </span>
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </GridItem>

          {/* Right: Home Utilities Flow */}
          <GridItem span={6}>
            <Card isFullHeight>
              <CardBody>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    textTransform: "uppercase",
                    marginBottom: "12px",
                    color: "#6a6e73",
                  }}
                >
                  Home Utilities Flow
                </div>
                <p style={{ fontSize: "13px", color: "#6a6e73", marginBottom: "12px" }}>
                  Real-time energy and water flow between sources and your home.
                </p>

                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "14px",
                    lineHeight: "2",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                    ⚡ POWER DRAW: {totalDraw} W
                  </div>
                  <div style={{ paddingLeft: "20px" }}>
                    Solar → Home:{" "}
                    <Bar value={reading?.solar_to_home || 0} max={homeKw} color="#f0ab00" />
                    {" "}{reading?.solar_to_home ?? 0} kW
                  </div>
                  <div style={{ paddingLeft: "20px" }}>
                    Solar → Battery:{" "}
                    <Bar value={reading?.solar_to_battery || 0} max={homeKw} color="#f0ab00" />
                    {" "}{reading?.solar_to_battery ?? 0} kW
                  </div>
                  <div style={{ paddingLeft: "20px" }}>
                    Battery → Home:{" "}
                    <Bar value={reading?.battery_to_home || 0} max={homeKw} color="#3e8635" />
                    {" "}{reading?.battery_to_home ?? 0} kW
                  </div>
                  <div style={{ paddingLeft: "20px" }}>
                    Grid → Home:{" "}
                    <Bar value={reading?.grid_to_home || 0} max={homeKw} color="#c9190b" />
                    {" "}{reading?.grid_to_home ?? 0} kW
                  </div>
                  <div
                    style={{
                      paddingLeft: "20px",
                      marginTop: "8px",
                      color: "#6a6e73",
                    }}
                  >
                    Battery: {reading?.battery_pct ?? "—"}%
                  </div>

                  <div
                    style={{
                      fontWeight: "bold",
                      marginTop: "16px",
                      marginBottom: "4px",
                    }}
                  >
                    💧 WATER FLOW: {waterTotal.toFixed(1)} L/min
                    {reading?.water_event && (
                      <span style={{ color: "#06c", marginLeft: "8px" }}>
                        ({reading.water_event})
                      </span>
                    )}
                    {waterTotal === 0 && (
                      <span style={{ color: "#6a6e73", marginLeft: "8px" }}>
                        (idle)
                      </span>
                    )}
                  </div>
                  <div style={{ paddingLeft: "20px" }}>
                    Main Supply: {reading?.water_main_lpm ?? 0} L/min
                  </div>
                  <div style={{ paddingLeft: "20px" }}>
                    Rain Harvesting: {reading?.water_rain_lpm ?? 0} L/min
                  </div>
                  <div
                    style={{
                      paddingLeft: "20px",
                      marginTop: "8px",
                      color: "#6a6e73",
                    }}
                  >
                    Rain Tank: {reading?.rain_tank_pct ?? "—"}%
                  </div>
                </div>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </PageSection>

      {/* Telemetry footer */}
      <PageSection
        style={{
          background: "#151515",
          color: "#a0a0a0",
          fontFamily: "monospace",
          fontSize: "13px",
          padding: "10px 24px",
        }}
      >
        <StatusDot ok />
        Power Stream: OK &nbsp;|&nbsp;
        <StatusDot ok />
        Water-Service: Healthy (15ms) &nbsp;|&nbsp;
        <StatusDot ok />
        Leak Detector: ACTIVE (200 OK)
      </PageSection>
    </>
  );
}

export default DashboardPage;
