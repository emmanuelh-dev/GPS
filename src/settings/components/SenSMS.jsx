import React, { useState } from "react";
import { TbSettingsShare } from "react-icons/tb";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import CloseIcon from "@mui/icons-material/Close";
import { sendSMS } from "../../common/util/sms";

const COMMANDS = [
  "apn123456 m2mglobal.telefonica.mx",
  "dns123456 24.199.121.252 5001",
  "angle123456 30",
  "fix060s***n123456",
  "sleep123456 on",
];

const SenSMS = ({ phoneNumber, large = false }) => {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState("");

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleCommandChange = (event) => {
    setCommand(event.target.value);
  };

  const handleSendSMS = () => {
    sendSMS({ phoneNumber, command });
  };

  return (
    <>
      {large ? (
        <Button variant="outlined" onClick={toggleDrawer}>
          Enviar Comando
        </Button>
      ) : (
        <IconButton size="small" onClick={toggleDrawer}>
          <TbSettingsShare fontSize="medium" />
        </IconButton>
      )}

      <Drawer open={open} onClose={toggleDrawer} anchor="right">
        <div style={{ marginLeft: "12px" }}>
          <IconButton size="small" onClick={toggleDrawer}>
            <CloseIcon fontSize="medium" />
          </IconButton>
        </div>
        {/* <Button onClick={() => checkStatus({ phoneNumber })}>Revisar Status</Button> */}
        <Container maxWidth="sm">
          <Typography variant="h4" gutterBottom>
            Enviar comando a
          </Typography>
          <Typography variant="h4" gutterBottom>
            {phoneNumber}
          </Typography>

          {COMMANDS.map((cmd) => (
            <Button key={cmd} onClick={() => setCommand(cmd)}>
              {cmd}
            </Button>
          ))}
          <Box component="form" noValidate autoComplete="off">
            <TextField
              label="Comando"
              variant="filled"
              fullWidth
              value={command}
              onChange={handleCommandChange}
            />
          </Box>
          <Button
            variant="contained"
            onClick={handleSendSMS}
            fullWidth
            sx={{ marginTop: 1 }}
          >
            Enviar
          </Button>
        </Container>
      </Drawer>
    </>
  );
};

export default SenSMS;
