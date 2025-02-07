import React from 'react';
import { Fab } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';

const useStyles = makeStyles((theme) => ({
  fab: {
    position: 'fixed',
    zIndex: 9999,
    bottom: theme.spacing(2),
    left: theme.spacing(52),
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(2)})`,
      left: theme.spacing(2),
    },
  },
}));

const CollectionFabCustom = ({ editPath, disabled }) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const readonly = useRestriction('readonly');

  if (!readonly && !disabled) {
    return (
      <div className={classes.fab}>
        <Fab size="medium" color="primary" onClick={() => navigate(editPath)}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
  return '';
};

export default CollectionFabCustom;
