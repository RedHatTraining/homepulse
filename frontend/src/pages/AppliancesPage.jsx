import { useState, useEffect, useCallback } from "react";
import {
  PageSection,
  Title,
  Card,
  CardBody,
  Button,
  Modal,
  ModalVariant,
  Form,
  FormGroup,
  TextInput,
  Label,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Switch,
} from "@patternfly/react-core";
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table";

const EMPTY_FORM = { name: "", location: "", power_w: 100 };

function AppliancesPage() {
  const [appliances, setAppliances] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = useCallback(() => {
    fetch("/api/devices")
      .then((r) => r.json())
      .then(setAppliances);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(a) {
    setEditing(a.id);
    setForm({ name: a.name, location: a.location, power_w: a.power_w });
    setModalOpen(true);
  }

  function save() {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/devices/${editing}` : "/api/devices";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(() => {
      setModalOpen(false);
      load();
    });
  }

  function remove(id) {
    fetch(`/api/devices/${id}`, { method: "DELETE" }).then(load);
  }

  function toggle(a) {
    const newStatus = a.status === "on" ? "off" : "on";
    fetch(`/api/devices/${a.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    }).then(load);
  }

  return (
    <>
      <PageSection>
        <Title headingLevel="h1" size="2xl">
          Appliances
        </Title>
      </PageSection>

      <PageSection>
        <Card>
          <CardBody>
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <Button variant="primary" onClick={openAdd}>
                    Add appliance
                  </Button>
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label="Appliances">
              <Thead>
                <Tr>
                  <Th>Status</Th>
                  <Th>Name</Th>
                  <Th>Location</Th>
                  <Th>Power (W)</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {appliances.map((a) => (
                  <Tr key={a.id}>
                    <Td>
                      <Switch
                        id={`switch-${a.id}`}
                        isChecked={a.status === "on"}
                        onChange={() => toggle(a)}
                        aria-label={`Toggle ${a.name}`}
                      />
                    </Td>
                    <Td>
                      {a.name}{" "}
                      {a.status === "on" && (
                        <Label color="green" isCompact>
                          ON
                        </Label>
                      )}
                    </Td>
                    <Td>{a.location}</Td>
                    <Td>{a.power_w}</Td>
                    <Td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openEdit(a)}
                      >
                        Edit
                      </Button>{" "}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => remove(a.id)}
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </PageSection>

      <Modal
        variant={ModalVariant.small}
        title={editing ? "Edit Appliance" : "Add Appliance"}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        actions={[
          <Button key="save" variant="primary" onClick={save}>
            Save
          </Button>,
          <Button
            key="cancel"
            variant="link"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>,
        ]}
      >
        <Form>
          <FormGroup label="Name" isRequired fieldId="name">
            <TextInput
              id="name"
              value={form.name}
              onChange={(_e, v) => setForm({ ...form, name: v })}
            />
          </FormGroup>
          <FormGroup label="Location" isRequired fieldId="location">
            <TextInput
              id="location"
              value={form.location}
              onChange={(_e, v) => setForm({ ...form, location: v })}
            />
          </FormGroup>
          <FormGroup label="Power (W)" fieldId="power">
            <TextInput
              id="power"
              type="number"
              value={form.power_w}
              onChange={(_e, v) =>
                setForm({ ...form, power_w: parseInt(v) || 0 })
              }
            />
          </FormGroup>
        </Form>
      </Modal>
    </>
  );
}

export default AppliancesPage;
