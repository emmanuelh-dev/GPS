import { Box, Avatar, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';

const ProfileImage = ({ item, onEditClick }) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div style={{
                position: 'relative',
                width: 100, height: 100
            }}>
                <Avatar
                    sx={{ width: 100, height: 100 }}
                    variant="rounded"
                    alt={item.firstName}
                    src={`/api/images/${item.dniIdentification}/${item.attributes.profile}`}
                />
                <IconButton
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 30,
                        height: 30,
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "end",
                    }}
                    size="small"
                    onClick={onEditClick}
                >
                    <EditIcon sx={{
                        color: "rgba(0, 0, 0, 0.3)",
                        "&:hover": {
                            color: "rgba(0, 0, 0, 0.8)",
                        },
                    }} fontSize="small" />
                </IconButton>
            </div>

        </Box>
    );
};

export default ProfileImage;
