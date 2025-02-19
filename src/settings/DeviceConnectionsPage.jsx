import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LinkField from "../common/components/LinkField";
import { useTranslation } from "../common/components/LocalizationProvider";
import SettingsMenu from "./components/SettingsMenu";
import { formatNotificationTitle } from "../common/util/formatter";
import PageLayout from "../common/components/PageLayout";
import useFeatures from "../common/util/useFeatures";

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

const DeviceConnectionsPage = () => {
  const classes = useStyles();
  const t = useTranslation();
  const { id } = useParams();
  const [inmates, setInmates] = useState([]);
  const [inmateId, setInmateId] = useState("");
  const [device, setDevice] = useState();
  const features = useFeatures();

  const fetchInmates = async () => {
    try {
      const response = await fetch(`/api/inmates`);
      if (response.ok) {
        setInmates(await response.json());
      } else {
        console.error("Error fetching inmates:", await response.text());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  const fetchDevice = async () => {
    try {
      const response = await fetch(`/api/devices/${id}`);
      if (response.ok) {
        setDevice(await response.json());
      } else {
        console.error("Error fetching device:", await response.text());
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };
  useEffect(() => {

    fetchDevice();
    fetchInmates();
  }, [id]);

  const handleInmateChange = async (event) => {
    const newInmateId = event.target.value;
    setInmateId(newInmateId);

    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...device, attributes: { ...device.attributes, inmateId: newInmateId } })
        ,
      });
      // fetchDevice();
      if (!response.ok) {
        console.error("Error posting inmate selection:", await response.text());
      }
    } catch (error) {
      console.error("Post error:", error);
    }
  };

  return (
    <PageLayout
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedDevice", "sharedConnections"]}
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
              <InputLabel>Imputado</InputLabel>
              <Select value={inmateId} onChange={handleInmateChange}>
                {inmates
                  .sort((a, b) => a.lastName.localeCompare(b.lastName))
                  .map((inmate) => (
                    <MenuItem key={inmate.id} value={inmate.id}>
                      {inmate.lastName + " " + inmate.firstName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <LinkField
              endpointAll="/api/geofences"
              endpointLinked={`/api/geofences?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="geofenceId"
              label={t("sharedGeofences")}
            />
            <LinkField
              endpointAll="/api/notifications"
              endpointLinked={`/api/notifications?deviceId=${id}`}
              baseId={id}
              keyBase="deviceId"
              keyLink="notificationId"
              titleGetter={(it) => formatNotificationTitle(t, it)}
              label={t("sharedNotifications")}
            />
          </AccordionDetails>
        </Accordion>
      </Container>
    </PageLayout>
  );
};

export default DeviceConnectionsPage;
