import React from "react";
import {
  Card,
  CardMedia,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import PhoneIcon from "@mui/icons-material/Phone";
import { useSelector } from "react-redux";

// Estilos
const useStyles = makeStyles((theme) => ({
  media: {
    height: 280,
    backgroundSize: "cover",
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

  // Obtener inmateId del dispositivo
  const inmateId = device?.attributes?.inmateId;

  // Obtener inmates desde Redux
  const inmates = useSelector((state) => state.inmates.items);

  // Buscar el inmate por ID
  const inmate = Object.values(inmates)?.find((inmate) => inmate.id === inmateId);

  // Si no hay inmate, no renderizar nada
  if (!inmate) return null;

  // Función para calcular la edad
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

  // Función para determinar el color según el nivel de peligro
  const getDangerLevelColor = (isHighRisk) => {
    return isHighRisk ? "#dc3545" : "#28a745"; // Rojo si es de alto riesgo, verde si no
  };

  console.log(inmate);

  // Obtener nombre completo
  const fullName = `${inmate.firstName} ${inmate.lastName}`;
  const age = getAge(inmate.dateOfBirth);
  const dangerLevelColor = getDangerLevelColor(inmate.highRisk);

  return (
    <Card>
      <Box className={classes.content}>
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

        {/* Ubicación, no disponible en el objeto, puedes mostrar un texto por defecto */}
        <Typography variant="body1" gutterBottom style={{ marginTop: "10px" }}>
          <span className={classes.label}>Ubicación:</span>{inmate.pavilion}
        </Typography>

        {/* No hay teléfonos en el objeto, puedes agregar algo por defecto */}
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
