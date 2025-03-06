import React from "react";
import {
  Card,
  Typography,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useSelector } from "react-redux";

const useStyles = makeStyles((theme) => ({
  imageContainer: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  squareImage: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    objectFit: "cover",
    border: `2px solid ${theme.palette.primary.main}`,
  },
  content: {
    padding: theme.spacing(2),
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  dangerLevel: {
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    color: "white",
    display: "inline-block",
    fontWeight: "bold",
  },
  label: {
    fontWeight: "bold",
    color: "#555",
  },
}));

export const PersonCard = ({ device }) => {
  const classes = useStyles();

  const inmateId = device?.attributes?.inmateId;

  const inmates = useSelector((state) => state.inmates.items);

  const inmate = Object.values(inmates)?.find((inmate) => inmate.id === inmateId);

  if (!inmate) return null;

  const getAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const getDangerLevelColor = (isHighRisk) => {
    return isHighRisk ? "#dc3545" : "#28a745";
  };

  const fullName = `${inmate.firstName} ${inmate.lastName}`;
  const age = getAge(inmate.dateOfBirth);
  const dangerLevelColor = getDangerLevelColor(inmate.highRisk);

  return (
    <Card>
      <Box className={classes.content}>
        {/* Contenedor para centrar la imagen */}
        <Box className={classes.imageContainer}>
          <img
            src={`/api/images/${inmate.dniIdentification}/${inmate.attributes?.profile}`}
            alt={fullName}
            className={classes.squareImage}
          />
        </Box>

        <Typography
          variant="h5"
          gutterBottom
          style={{ color: "#2c3e50", fontWeight: "bold" }}
        >
          {fullName}
        </Typography>

        <div className={classes.infoRow}>
          <Typography variant="body1">
            <span className={classes.label}>Edad:</span> {age} años
          </Typography>
          <Typography
            variant="body2"
            style={{
              backgroundColor: dangerLevelColor,
            }}
            className={classes.dangerLevel}
          >
            {inmate.highRisk ? "Alto riesgo" : "Bajo riesgo"}
          </Typography>
        </div>

        <Typography variant="body1" gutterBottom style={{ marginTop: "10px" }}>
          <span className={classes.label}>Ubicación:</span> {inmate.pavilion}
        </Typography>

        <Typography variant="body1" gutterBottom style={{ marginTop: "10px" }}>
          <span className={classes.label}>Tel. Directo:</span> <a href={`tel:${inmate.attributes.HousePhoneNumber}`}>Llamar</a>
        </Typography>

        <Typography variant="body1" style={{ marginTop: "10px" }}>
          <span className={classes.label}>Tel. Contacto:</span> <a href={`tel:${inmate.attributes.phoneNumber}`}>Llamar</a>
        </Typography>
      </Box>
    </Card>
  );
};