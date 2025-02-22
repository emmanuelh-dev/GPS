import React, { useState } from "react";
import { Box, Button, CircularProgress, Grid, IconButton, ImageList, Modal, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import InmatesImageList from "./InmatesImageList";
import { useEffectAsync } from "../../reactHelper";

// Styles using makeStyles
const useStyles = makeStyles(() => ({
    modalBox: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 280,
        backgroundColor: "white",
        borderRadius: 5,
        boxShadow: 24,
        padding: "32px 16px 0px 16px",
        display: "flex",
        flexDirection: "column",
    },
    cancel: {
        position: "absolute",
        top: 0,
        right: 0,
    },
    actions: {
        display: "flex",
        justifyContent: "space-between",
        padding: 16,
    },
}));

const ImageModal = ({ open, setOpen, item, setItem }) => {
    const classes = useStyles();

    const handleClose = () => setOpen(false);

    const [timestamp, setTimestamp] = useState(Date.now());
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffectAsync(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/inmates/${item.id}/images/`);
            if (response.ok) {
                setItems(await response.json());
            } else {
                throw Error(await response.text());
            }
        } finally {
            setLoading(false);
        }
    }, [timestamp, item]);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const fileName = file.name.substring(0, file.name.lastIndexOf('.'));

        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

        if (!allowedTypes.includes(file.type)) {
            alert("Only JPG, PNG, GIF, WEBP, and SVG files are allowed.");
            return;
        }

        setLoading(true);

        const response = await fetch(`/api/inmates/${item.id}/images/${fileName}`, {
            method: 'POST',
            body: file,
        });

        if (!response.ok) {
            throw Error(await response.text());
        }

        setLoading(false);
        
        setTimestamp(Date.now());
    };

    const handleDelete = async (fileName) => {
        setLoading(true);

        const response = await fetch(`/api/inmates/${item.id}/images/${fileName}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw Error(await response.text());
        }

        setLoading(false);

        setTimestamp(Date.now());
    }

    

    const handleSetProfile = async (fileName) => {
        setLoading(true);

        const response = await fetch(`/api/inmates/${item.id}`, {
            method: 'PUT',
            body: JSON.stringify(item.attributes ? { ...item, attributes: {...item.attributes, profile: fileName} } : { ...item, attributes: {profile: fileName} }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw Error(await response.text());
        }

        setLoading(false);

        setItem(await response.json());

        setTimestamp(Date.now());
    }

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="color-modal-title">
            <Box className={classes.modalBox}>

                <InmatesImageList 
                items={items} 
                inmate={item} 
                onDelete={handleDelete}
                onSetProfile={handleSetProfile}
                />

                {/* Action Buttons */}
                <Box className={classes.actions}>
                    <Button
                        component="label"
                        htmlFor="upload-input"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Upload"}
                    </Button>
                    <Button onClick={handleClose}>Close</Button>
                </Box>

                <input
                    type="file"
                    id="upload-input"
                    accept=".jpg, .jpeg, .png, .gif, .webp, .svg"
                    style={{ display: "none" }}
                    onChange={handleFileUpload}
                />
            </Box>
        </Modal>
    );
};

export default ImageModal;
