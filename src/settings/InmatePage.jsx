import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  FormGroup,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditItemView from "./components/EditItemView";
import SettingsMenu from "./components/SettingsMenu";

const useStyles = makeStyles((theme) => ({
  details: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
}));

const InmatePage = () => {
  const classes = useStyles();

  const [item, setItem] = useState();

  console.log("item", item);

  const validate = () => true;

  return (
    <EditItemView
      endpoint="inmates"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={["settingsTitle", "settingsUser"]}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{"Personal Information"}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.firstName || ""}
                onChange={(e) => setItem({ ...item, firstName: e.target.value })}
                label={'Fisrt Name'}
              />
              <TextField
                value={item.lastName || ""}
                onChange={(e) => setItem({ ...item, lastName: e.target.value })}
                label={'Last Name'}
              />
              <TextField
                value={item.dniIdentification || ""}
                onChange={(e) => setItem({ ...item, dniIdentification: e.target.value })}
                label={'DNI'}
              />
              <TextField
                label="Date of Birth"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={
                  (item.dateOfBirth &&
                    dayjs(item.dateOfBirth)
                      .locale("en")
                      .format("YYYY-MM-DD")) ||
                  "2099-01-01"
                }
                onChange={(e) =>
                  setItem({
                    ...item,
                    dateOfBirth: dayjs(e.target.value, "YYYY-MM-DD")
                      .locale("en")
                      .format(),
                  })
                }
              />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{"Legal Information"}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
            <TextField
                label="Date of Admission"
                type="date"
                InputLabelProps={{
                  shrink: true,
                }}
                value={
                  (item.dateOfAdmission &&
                    dayjs(item.dateOfAdmission)
                      .locale("en")
                      .format("YYYY-MM-DD")) ||
                  "2099-01-01"
                }
                onChange={(e) =>
                  setItem({
                    ...item,
                    dateOfAdmission: dayjs(e.target.value, "YYYY-MM-DD")
                      .locale("en")
                      .format(),
                  })
                }
              />
              <TextField
                value={item.reasonForAdmission || ""}
                onChange={(e) => setItem({ ...item, reasonForAdmission: e.target.value })}
                label={'Reason of Admission'}
              />
              <TextField
                value={item.caseNumber || ""}
                onChange={(e) => setItem({ ...item, caseNumber: e.target.value })}
                label={'Case Number'}
              />
              <TextField
                value={item.sentenceDuration || ""}
                onChange={(e) => setItem({ ...item, sentenceDuration: e.target.value })}
                label={'Sentence Duration'}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{"Location"}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.pavilion || ""}
                onChange={(e) => setItem({ ...item, pavilion: e.target.value })}
                label={'Pavilion'}
              />
              <TextField
                value={item.cell || ""}
                onChange={(e) => setItem({ ...item, cell: e.target.value })}
                label={'Cell'}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">{"Special Conditions"}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.highRisk}
                      onChange={(e) =>
                        setItem({ ...item, highRisk: e.target.checked })
                      }
                    />
                  }
                  label={"High Risk"}
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.requireMedicalAttention}
                      onChange={(e) =>
                        setItem({ ...item, requireMedicalAttention: e.target.checked })
                      }
                    />
                  }
                  label={'Require Medical Attention'}
                />
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={item.isolation}
                      onChange={(e) =>
                        setItem({ ...item, isolation: e.target.checked })
                      }
                    />
                  }
                  label={"Isolation"}
                />
              </FormGroup>
              <TextField
                value={item.observations || ""}
                onChange={(e) => setItem({ ...item, observations: e.target.value })}
                label={'Observations'}
                multiline
                minRows={5}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default InmatePage;
