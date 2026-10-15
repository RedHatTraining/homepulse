import { useState, useEffect, useCallback } from "react";
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Button,
  Alert,
  Flex,
  FlexItem,
  Label,
} from "@patternfly/react-core";

const VARIANT_MAP = {
  water: "info",
  energy: "warning",
  rain: "success",
  weather: "danger",
};

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);

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

  function acknowledge(id) {
    fetch(`/api/alerts/${id}`, { method: "PATCH" }).then(load);
  }

  const unacked = alerts.filter((a) => !a.acknowledged);
  const acked = alerts.filter((a) => a.acknowledged);

  return (
    <>
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Alerts{" "}
          {unacked.length > 0 && (
            <Label color="red" isCompact>
              {unacked.length} active
            </Label>
          )}
        </Title>
      </PageSection>

      <PageSection>
        <Card>
          <CardBody>
            {alerts.length === 0 && <p>No alerts.</p>}
            <Flex direction={{ default: "column" }} gap={{ default: "gapSm" }}>
              {unacked.map((a) => (
                <FlexItem key={a.id}>
                  <Alert
                    variant={VARIANT_MAP[a.type] || "warning"}
                    isInline
                    title={a.title}
                    actionClose={
                      <Button
                        variant="plain"
                        onClick={() => acknowledge(a.id)}
                      >
                        Acknowledge
                      </Button>
                    }
                  >
                    <p>{a.detail}</p>
                    <p>
                      <strong>Recommendation:</strong> {a.recommendation}
                    </p>
                  </Alert>
                </FlexItem>
              ))}
              {acked.length > 0 && (
                <>
                  <FlexItem>
                    <Title headingLevel="h3" size="md">
                      Acknowledged
                    </Title>
                  </FlexItem>
                  {acked.map((a) => (
                    <FlexItem key={a.id}>
                      <Alert variant="default" isInline title={a.title}>
                        <p>{a.detail}</p>
                      </Alert>
                    </FlexItem>
                  ))}
                </>
              )}
            </Flex>
          </CardBody>
        </Card>
      </PageSection>
    </>
  );
}

export default AlertsPage;
