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
    Avatar,
    Box,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditItemView from "./components/EditItemView";
import SettingsMenu from "./components/SettingsMenu";

import ProfileImage from "./components/ProfileImage";
import ImageModal from "./components/ImageModel";

const useStyles = makeStyles((theme) => ({
    details: {
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing(2),
        paddingBottom: theme.spacing(3),
    },
}));

const handleUpdateProfileImage = () => {

}

const InmatePage = () => {
    const classes = useStyles();

    const [item, setItem] = useState();
    const [openImageModal, setOpenImageModal] = useState(false);

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
                            <Typography variant="subtitle1">{"Información Personal"}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            {item.id && (
                                <ProfileImage 
                                item={item} onEditClick={() => setOpenImageModal(() => true)} />
                            )}
                            <TextField
                                value={item.firstName || ""}
                                onChange={(e) => setItem({ ...item, firstName: e.target.value })}
                                label={'Nombre'}
                            />
                            <TextField
                                value={item.lastName || ""}
                                onChange={(e) => setItem({ ...item, lastName: e.target.value })}
                                label={'Apellido'}
                            />
                            <TextField
                                value={item.dniIdentification || ""}
                                onChange={(e) => setItem({ ...item, dniIdentification: e.target.value })}
                                label={'DNI'}
                            />
                            <TextField
                                label="Fecha de Nacimiento"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={
                                    (item.dateOfBirth &&
                                        dayjs(item.dateOfBirth)
                                            .locale("es")
                                            .format("YYYY-MM-DD")) ||
                                    "2099-01-01"
                                }
                                onChange={(e) =>
                                    setItem({
                                        ...item,
                                        dateOfBirth: dayjs(e.target.value, "YYYY-MM-DD")
                                            .locale("es")
                                            .format(),
                                    })
                                }
                            />
                            <TextField
                                value={item.attributes ? item.attributes.phoneNumber : ""}
                                onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, phoneNumber: e.target.value } })}
                                label={'Número de Teléfono'}
                            />
                            <TextField
                                value={item.attributes ? item.attributes.HousePhoneNumber : ""}
                                onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, HousePhoneNumber: e.target.value } })}
                                label={'Teléfono de Casa'}
                            />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">{"Información Legal"}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <TextField
                                label="Fecha de Admisión"
                                type="date"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                value={
                                    (item.dateOfAdmission &&
                                        dayjs(item.dateOfAdmission)
                                            .locale("es")
                                            .format("YYYY-MM-DD")) ||
                                    "2099-01-01"
                                }
                                onChange={(e) =>
                                    setItem({
                                        ...item,
                                        dateOfAdmission: dayjs(e.target.value, "YYYY-MM-DD")
                                            .locale("es")
                                            .format(),
                                    })
                                }
                            />
                            <TextField
                                value={item.reasonForAdmission || ""}
                                onChange={(e) => setItem({ ...item, reasonForAdmission: e.target.value })}
                                label={'Motivo de Admisión'}
                            />
                            <TextField
                                value={item.caseNumber || ""}
                                onChange={(e) => setItem({ ...item, caseNumber: e.target.value })}
                                label={'Número de Caso'}
                            />
                            <TextField
                                value={item.sentenceDuration || ""}
                                onChange={(e) => setItem({ ...item, sentenceDuration: e.target.value })}
                                label={'Duración de la Sentencia'}
                            />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">{"Ubicación"}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classes.details}>
                            <TextField
                                value={item.pavilion || ""}
                                onChange={(e) => setItem({ ...item, pavilion: e.target.value })}
                                label={'Pabellón'}
                            />
                            <TextField
                                value={item.cell || ""}
                                onChange={(e) => setItem({ ...item, cell: e.target.value })}
                                label={'Celda'}
                            />
                        </AccordionDetails>
                    </Accordion>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">{"Condiciones Especiales"}</Typography>
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
                                    label={"Alto Riesgo"}
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={item.requiresMedicalAttention}
                                            onChange={(e) =>
                                                setItem({ ...item, requiresMedicalAttention: e.target.checked })
                                            }
                                        />
                                    }
                                    label={'Requiere Atención Médica'}
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
                                    label={"Aislamiento"}
                                />
                            </FormGroup>
                            <TextField
                                value={item.observations || ""}
                                onChange={(e) => setItem({ ...item, observations: e.target.value })}
                                label={'Observaciones'}
                                multiline
                                minRows={5}
                            />
                        </AccordionDetails>
                    </Accordion>
                    {item && item.id && (
                        <ImageModal
                            open={openImageModal}
                            setOpen={setOpenImageModal}
                            item={item}
                            setItem={setItem}
                        />
                    )}
                </>
            )}
        </EditItemView>
    );
};

export default InmatePage;
