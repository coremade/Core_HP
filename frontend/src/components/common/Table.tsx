import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface Column<T = any> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
  renderCell?: (row: T, ...args: any[]) => React.ReactNode;
}

interface TableProps<T = any> {
  columns: Column<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  renderCell?: (column: Column<T>, row: T) => React.ReactNode;
}

const StyledTableContainer = styled(TableContainer)({
  maxHeight: 440,
  '& .MuiTableCell-head': {
    backgroundColor: '#f5f5f5',
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: 600,
  },
  '& .MuiTableRow-root': {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
});

export const Table = <T extends Record<string, any>>({ columns, rows, onRowClick, renderCell }: TableProps<T>) => {
  return (

    <Paper>
      <StyledTableContainer>
        <MuiTable stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                hover
                key={index}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => {
                  const customCell = renderCell && renderCell(column, row);
                  if (customCell !== undefined) {
                    return (
                      <TableCell key={column.id} align={column.align}>
                        {customCell}
                      </TableCell>
                    );
                  }

                  const value = row[column.id];
                  return (
                    <TableCell key={column.id} align={column.align}>
                      {column.format ? column.format(value) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>
    </Paper>
  );
}; 