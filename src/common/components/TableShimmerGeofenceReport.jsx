import React from 'react';
import { Skeleton, TableCell, Table, TableBody, TableRow, Typography } from '@mui/material';

const TableShimmerGeofenceReport = ({ columns, startAction, endAction }) => [...Array(3)].map((_, i) => (
  <>
    <Typography m={2} variant="h6"><Skeleton /></Typography>
    <Table>
      <TableBody>
        <TableRow key={-i}>
          {[...Array(columns)].map((_, j) => {
            const action = (startAction && j === 0) || (endAction && j === columns - 1);
            return (
              <TableCell key={-j} padding={action ? 'none' : 'normal'}>
                {!action && <Skeleton />}
              </TableCell>
            );
          })}
        </TableRow>
      </TableBody>
    </Table>
  </>
));

export default TableShimmerGeofenceReport;