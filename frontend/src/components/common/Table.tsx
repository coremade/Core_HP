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

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
}

interface TableProps {
  columns: Column[];
  rows: any[];
  onRowClick?: (row: any) => void;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: 440,
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    fontWeight: 600,
  },
  '& .MuiTableRow-root': {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export const Table = ({ columns, rows, onRowClick }: TableProps) => {
  return (
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
  );
}; 