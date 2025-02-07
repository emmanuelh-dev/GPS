import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTranslation } from "../common/components/LocalizationProvider";
import SettingsMenu from "./components/SettingsMenu";
import PageLayout from "../common/components/PageLayout";
import { useCatch, useEffectAsync } from "../reactHelper";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
  },
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const InmateConnectionsPage = () => {
  const classes = useStyles();
  const t = useTranslation();

  const [item, setItem] = useState();
  const [deviceId, setDeviceId] = useState();
  const [devices, setDevices] = useState([]);

  const { id } = useParams();

  useEffectAsync(async () => {
    if (!item) {
      if (id) {
        const response = await fetch(`/api/inmates/${id}`);
        if (response.ok) {
          setItem(await response.json());
        } else {
          throw Error(await response.text());
        }
      } else {
        setItem(defaultItem || {});
      }
    }
  }, [id]);

  useEffectAsync(async () => {
    if (!item) {
      if (id) {
        const response = await fetch(`/api/devices?all=true`);
        if (response.ok) {
          setDevices(await response.json());
        } else {
          throw Error(await response.text());
        }
      }
    }
  }, []);

  const handleSave = useCatch(async () => {
    const response = await fetch(`/api/inmates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...item,
        attributes: {
          ...item.attributes,
          deviceId: deviceId,
        }
      }),
    });

    if (response.ok) {
      navigate(-1);
    } else {
      throw Error(await response.text());
    }
  });

  const navigate = useNavigate();
  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUser", "sharedConnections"]}
    >
      <Container maxWidth="xs" className={classes.container}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">
              {t("sharedConnections")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <FormControl fullWidth>
              <InputLabel>{t("deviceTitle")}</InputLabel>
              <Select
                label={t("deviceTitle")}
                value={deviceId || ""}
                onChange={(e) => setDeviceId(e.target.value)}
              >
                {devices.sort((a, b) => a.name.localeCompare(b.name))
                  .map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

          </AccordionDetails>
        </Accordion>
        <Button
          className="w-full"
          onClick={handleSave}
          variant="contained"
        >
          {t("sharedSave")}
        </Button>
      </Container>
    </PageLayout>
  );
};

export default InmateConnectionsPage;
