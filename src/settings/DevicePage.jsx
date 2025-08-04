import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  InputAdornment,
  IconButton,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { DropzoneArea } from "react-mui-dropzone";
import { useDispatch } from "react-redux";
import EditItemView from "./components/EditItemView";
import EditAttributesAccordion from "./components/EditAttributesAccordion";
import SelectField from "../common/components/SelectField";
import deviceCategories from "../common/util/deviceCategories";
import { useTranslation } from "../common/components/LocalizationProvider";
import useDeviceAttributes from "../common/attributes/useDeviceAttributes";
import { useAdministrator } from "../common/util/permissions";
import SettingsMenu from "./components/SettingsMenu";
import useCommonDeviceAttributes from "../common/attributes/useCommonDeviceAttributes";
import { useCatch } from "../reactHelper";
import { devicesActions } from "../store";
import BarcodeScannerDialog from "./components/BarcodeScanner";

const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const DevicePage = () => {
  const classes = useStyles();
  const t = useTranslation();
  const dispatch = useDispatch();

  const admin = useAdministrator();

  const commonDeviceAttributes = useCommonDeviceAttributes(t);
  const deviceAttributes = useDeviceAttributes(t);

  const [item, setItem] = useState();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState('');

  const handleFiles = useCatch(async (files) => {
    if (files.length > 0) {
      const response = await fetch(`/api/devices/${item.id}/image`, {
        method: "POST",
        body: files[0],
      });
      if (response.ok) {
        setItem({
          ...item,
          attributes: {
            ...item.attributes,
            deviceImage: await response.text(),
          },
        });
      } else {
        throw Error(await response.text());
      }
    }
  });
  const toggleSendSms = () => {
    dispatch(devicesActions.selectId(item.id));
    dispatch(devicesActions.toggleSendSms());
  };
  const validate = () => item && item.name && item.uniqueId;

  const handleChangeTermo = (event) => {
    const newTermoValue = event.target.value;
    setItem((prevItem) => ({
      ...prevItem,
      attributes: {
        ...prevItem.attributes,
        termo: newTermoValue,
      },
    }));
  };

  const handleChangePlacas = (event) => {
    const newPlacasValue = event.target.value;
    setItem((prevItem) => ({
      ...prevItem,
      attributes: {
        ...prevItem.attributes,
        placas: newPlacasValue,
      },
    }));
  };

  const handleChangeColor = (event) => {
    const newColorValue = event.target.value;
    setItem((prevItem) => ({
      ...prevItem,
      attributes: {
        ...prevItem.attributes,
        color: newColorValue,
      },
    }));
  };

  const handleOpenScanner = (target) => {
    setScannerTarget(target);
    setScannerOpen(true);
  };

  const handleCloseScanner = () => {
    setScannerOpen(false);
  };

  const handleScanResult = (result) => {
    if (scannerTarget === 'uniqueId') {
      setItem({ ...item, uniqueId: result });
    } else if (scannerTarget === 'phone') {
      setItem({ ...item, phone: result });
    }
  };

  return (
    <EditItemView
      endpoint="devices"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "sharedDevice"]}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("sharedRequired")}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.name || ""}
                onChange={(event) =>
                  setItem({ ...item, name: event.target.value })
                }
                label={t("sharedName")}
              />
              <TextField
                value={item.phone || ""}
                onChange={(event) =>
                  setItem({ ...item, phone: event.target.value })
                }
                label={t("sharedPhone")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleOpenScanner('phone')}
                        edge="end"
                        size="small"
                        title={t("deviceScanBarcode", "Escanear código")}
                      >
                        <QrCodeScannerIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                value={item.contact || ""}
                onChange={(event) =>
                  setItem({ ...item, contact: event.target.value })
                }
                label={t("deviceContact")}
              />
              <SelectField
                value={item.category || "default"}
                emptyValue={null}
                onChange={(event) =>
                  setItem({ ...item, category: event.target.value })
                }
                data={deviceCategories.map((category) => ({
                  id: category,
                  name: t(
                    `category${category.replace(/^\w/, (c) => c.toUpperCase())}`,
                  ),
                }))}
                label={t("deviceCategory")}
              />
              <TextField
                value={item.attributes ? item.attributes.termo : ""}
                onChange={handleChangeTermo}
                label="Termo"
              />
              <TextField
                value={item.attributes ? item.attributes.placas : ""}
                onChange={handleChangePlacas}
                label="Placas"
              />
              <SelectField
                value={item.attributes ? item.attributes.color : ""}
                emptyValue=""
                onChange={handleChangeColor}
                data={[
                  { id: "blanco", name: "Blanco" },
                  { id: "negro", name: "Negro" },
                  { id: "gris", name: "Gris" },
                  { id: "rojo", name: "Rojo" },
                  { id: "azul", name: "Azul" },
                  { id: "verde", name: "Verde" },
                  { id: "amarillo", name: "Amarillo" },
                  { id: "naranja", name: "Naranja" },
                  { id: "cafe", name: "Café" },
                  { id: "plateado", name: "Plateado" },
                ]}
                label="Color"
              />
              <TextField
                value={item.uniqueId || ""}
                onChange={(event) =>
                  setItem({ ...item, uniqueId: event.target.value })
                }
                label={t("deviceIdentifier")}
                helperText={t("deviceIdentifierHelp")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleOpenScanner('uniqueId')}
                        edge="end"
                        size="small"
                        title={t("deviceScanBarcode", "Escanear código")}
                      >
                        <QrCodeScannerIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button variant="outlined" onClick={toggleSendSms}>
                Enviar Comando
              </Button>
            </AccordionDetails>
          </Accordion>
          <EditAttributesAccordion
            attributes={item.attributes}
            setAttributes={(attributes) => setItem({ ...item, attributes })}
            definitions={{ ...commonDeviceAttributes, ...deviceAttributes }}
          />
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{t("sharedExtra")}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.groupId || 0}
                onChange={(event) =>
                  setItem({ ...item, groupId: Number(event.target.value) })
                }
                endpoint="/api/groups"
                label={t("groupParent")}
              />
              <TextField
                value={item.phone || ""}
                onChange={(event) =>
                  setItem({ ...item, phone: event.target.value })
                }
                label={t("sharedPhone")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleOpenScanner('phone')}
                        edge="end"
                        size="small"
                        title={t("deviceScanBarcode", "Escanear código")}
                      >
                        <QrCodeScannerIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                value={item.model || ""}
                onChange={(event) =>
                  setItem({ ...item, model: event.target.value })
                }
                label={t("deviceModel")}
              />
              <TextField
                value={item.contact || ""}
                onChange={(event) =>
                  setItem({ ...item, contact: event.target.value })
                }
                label={t("deviceContact")}
              />
              <SelectField
                value={item.category || "default"}
                emptyValue={null}
                onChange={(event) =>
                  setItem({ ...item, category: event.target.value })
                }
                data={deviceCategories.map((category) => ({
                  id: category,
                  name: t(
                    `category${category.replace(/^\w/, (c) => c.toUpperCase())}`,
                  ),
                }))}
                label={t("deviceCategory")}
              />
              <SelectField
                value={item.calendarId || 0}
                onChange={(event) =>
                  setItem({ ...item, calendarId: Number(event.target.value) })
                }
                endpoint="/api/calendars"
                label={t("sharedCalendar")}
              />
              <TextField
                label={t("userExpirationTime")}
                type="date"
                value={
                  (item.expirationTime &&
                    dayjs(item.expirationTime)
                      .locale("en")
                      .format("YYYY-MM-DD")) ||
                  "2099-01-01"
                }
                onChange={(e) =>
                  setItem({
                    ...item,
                    expirationTime: dayjs(e.target.value, "YYYY-MM-DD")
                      .locale("en")
                      .format(),
                  })
                }
                disabled={!admin}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={item.disabled}
                    onChange={(event) =>
                      setItem({ ...item, disabled: event.target.checked })
                    }
                  />
                }
                label={t("sharedDisabled")}
                disabled={!admin}
              />
            </AccordionDetails>
          </Accordion>
          {item.id && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">
                  {t("attributeDeviceImage")}
                </Typography>
              </AccordionSummary>
              <AccordionDetails className={classes.details}>
                <DropzoneArea
                  dropzoneText={t("sharedDropzoneText")}
                  acceptedFiles={["image/*"]}
                  filesLimit={1}
                  onChange={handleFiles}
                  showAlerts={false}
                />
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}
      <BarcodeScannerDialog
        open={scannerOpen}
        onClose={handleCloseScanner}
        onScan={handleScanResult}
        title={scannerTarget === 'uniqueId' 
          ? t("deviceScanIdentifier", "Escanear identificador") 
          : t("deviceScanPhone", "Escanear teléfono")}
      />
    </EditItemView>
  );
};

export default DevicePage;
