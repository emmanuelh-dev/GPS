import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useTranslation } from "../common/components/LocalizationProvider";

const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
  },
}));

const EditNameDialog = ({ open, onClose, device, onSave }) => {
  const classes = useStyles();
  const t = useTranslation();
  const [name, setName] = useState(device ? device.name : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (device) {
      setName(device.name || "");
    }
  }, [device]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("El nombre no puede estar vacío");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...device, name }),
      });

      if (response.ok) {
        const updatedDevice = await response.json();
        onSave(updatedDevice);
        onClose();
      } else {
        throw Error(await response.text());
      }
    } catch (error) {
      setError("Error al actualizar el dispositivo");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Editar nombre del dispositivo</DialogTitle>
      <DialogContent className={classes.details}>
        <TextField
          autoFocus
          margin="dense"
          label="Nombre"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("sharedCancel")}
        </Button>
        <Button onClick={handleSave} color="primary" disabled={loading}>
          {loading ? "Guardando..." : t("sharedSave")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditNameDialog;