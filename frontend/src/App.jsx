import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Label,
  Masthead,
  MastheadContent,
  MastheadMain,
  Page,
} from "@patternfly/react-core";
import {
  BellIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@patternfly/react-icons";
import DashboardPage from "./pages/DashboardPage.jsx";
import DashboardFlowPage from "./pages/DashboardFlowPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";

const WEATHER_EMOJI = {
  sunny: "☀️",
  clear: "🌙",
  partly_cloudy: "⛅",
  cloudy: "☁️",
  overcast: "🌥️",
  rainy: "🌧️",
};

const ICON_MAP = {
  water: <InfoCircleIcon color="var(--pf-t--global--icon--color--status--info--default)" />,
  energy: <ExclamationTriangleIcon color="var(--pf-t--global--icon--color--status--warning--default)" />,
  rain: <CheckCircleIcon color="var(--pf-t--global--icon--color--status--success--default)" />,
  weather: <ExclamationCircleIcon color="var(--pf-t--global--icon--color--status--danger--default)" />,
};

const navLinkStyle = {
  color: "#888",
  textDecoration: "none",
  padding: "2px 0",
  borderBottom: "2px solid transparent",
};

const navLinkActiveStyle = {
  color: "#e0e0e0",
  borderBottom: "2px solid #4caf50",
};

function AlertsDropdown() {
  const [alerts, setAlerts] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const load = useCallback(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then(setAlerts);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  const unacked = alerts.filter((a) => !a.acknowledged);

  function acknowledge(id) {
    fetch(`/api/alerts/${id}`, { method: "PATCH" }).then(load);
    setIsOpen(false);
  }

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={() => setIsOpen(false)}
      onOpenChange={setIsOpen}
      toggle={(toggleRef) => (
        <span
          ref={toggleRef}
          onClick={() => setIsOpen(!isOpen)}
          style={{ position: "relative", cursor: "pointer", fontSize: "16px", color: "#a0a0a0" }}
        >
          <BellIcon />
          {unacked.length > 0 && (
            <span style={{
              position: "absolute", top: "-4px", right: "-6px",
              background: "#c9190b", color: "#fff",
              fontSize: "10px", fontWeight: 700,
              width: "16px", height: "16px",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {unacked.length}
            </span>
          )}
        </span>
      )}
      popperProps={{ position: "end" }}
    >
      <DropdownList>
        {unacked.length === 0 ? (
          <DropdownItem key="none" isDisabled>
            No active alerts
          </DropdownItem>
        ) : (
          unacked.map((a) => (
            <DropdownItem
              key={a.id}
              icon={ICON_MAP[a.type] || ICON_MAP.energy}
              description={a.recommendation}
              onClick={() => acknowledge(a.id)}
            >
              {a.title}
            </DropdownItem>
          ))
        )}
      </DropdownList>
    </Dropdown>
  );
}

function AppMasthead({ reading }) {
  return (
    <Masthead>
      <MastheadMain style={{ flex: "none" }}>
        <span style={{ color: "#e0e0e0", whiteSpace: "nowrap" }}>
          <strong>[HOMEPULSE]</strong> Living Room Hub
        </span>
      </MastheadMain>
      <MastheadContent style={{ flex: 1 }}>
        <div style={{ width: "100%" }}>
          {/* Top row: nav + labels + alerts */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "8px",
          }}>
            <nav style={{ display: "flex", gap: "16px" }}>
              {[
                { to: "/", label: "Dashboard" },
                { to: "/dashboard/flow", label: "Flow" },
                { to: "/alerts", label: "Alerts" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === "/"}
                  style={({ isActive }) => ({
                    ...navLinkStyle,
                    ...(isActive ? navLinkActiveStyle : {}),
                  })}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Label color={import.meta.env.VITE_ENV === "PRODUCTION" ? "green" : "orange"} isCompact>
                {import.meta.env.VITE_ENV}
              </Label>
              <Label color="blue" isCompact>
                {import.meta.env.VITE_VERSION}
              </Label>
              <AlertsDropdown />
            </div>
          </div>
          {/* Bottom row: pod + weather + carbon */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "4px",
            color: "#a0a0a0",
            fontSize: "12px",
          }}>
            <span>Pod: {import.meta.env.VITE_POD_NAME}</span>
            <span>
              {WEATHER_EMOJI[reading?.weather] ?? "🌡️"}{" "}
              {reading?.weather?.replace("_", " ") ?? "—"}{" "}
              {reading?.temp_c ?? "—"}°C | Carbon:{" "}
              {reading?.home_carbon_gco2 ?? "—"} gCO2/kWh (
              {reading?.clean_pct ?? "—"}% Clean)
            </span>
          </div>
        </div>
      </MastheadContent>
    </Masthead>
  );
}

function App() {
  const [reading, setReading] = useState(null);

  useEffect(() => {
    function fetchReading() {
      fetch("/api/home/status")
        .then((r) => (r.ok ? r.json() : null))
        .then(setReading);
    }
    fetchReading();
    const interval = setInterval(fetchReading, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <Page masthead={<AppMasthead reading={reading} />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard/flow" element={<DashboardFlowPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
        </Routes>
      </Page>
    </BrowserRouter>
  );
}

export default App;
