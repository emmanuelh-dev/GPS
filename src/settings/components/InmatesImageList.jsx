import { makeStyles } from '@mui/styles';
import IconButton from '@mui/material/IconButton';
import { Delete, AccountCircle } from '@mui/icons-material';

const useStyles = makeStyles({
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px',
  },
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    position: 'relative',
    width: '100px',
    height: '100px',
    '&:hover $image': {
      border: '2px solid #1976d2',
    },
    '&:hover $buttonContainer': {
      display: 'flex',
    },
  },
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'contain',
    borderRadius: '5px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'border 0.3s ease-in-out',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    display: 'none',
    justifyContent: 'space-between',
    background: 'rgba(0, 0, 0, 0.5)',
    padding: '5px',
  },
  iconButton: {
    color: 'white',
  },
});

export default function InmatesImageList({ items, inmate, onSetProfile, onDelete }) {
  const classes = useStyles();

  return (
    <div className={classes.gridContainer}>
      {items.map((item) => (
        <div key={item} className={classes.wrapper}>
          <div className={classes.imageWrapper}>
            <img
              src={`/api/images/${inmate.dniIdentification}/${item}`}
              alt={item}
              className={classes.image}
            />
            <div className={classes.buttonContainer}>
              <IconButton onClick={() => onSetProfile(item)} className={classes.iconButton}>
                <AccountCircle />
              </IconButton>
              <IconButton onClick={() => onDelete(item)} className={classes.iconButton}>
                <Delete />
              </IconButton>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
