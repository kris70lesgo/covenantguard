'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  OpenInNew as ExternalLinkIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { Loan } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate, truncateHash, getExplorerUrl } from '@/lib/utils';

interface LoanTableProps {
  loans: Loan[];
  title?: string;
}

export default function LoanTable({ loans, title = 'Loan Portfolio' }: LoanTableProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {loans.length} loans
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Borrower</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell>Covenant</TableCell>
                <TableCell align="center">Ratio</TableCell>
                <TableCell align="center">Limit</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Last Test</TableCell>
                <TableCell align="center">Blockchain</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loans.map((loan) => (
                <TableRow
                  key={loan.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {loan.borrowerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loan.id}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(loan.outstandingAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      of {formatCurrency(loan.facilityAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={loan.covenantType}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color={
                        loan.status === 'GREEN'
                          ? 'success.main'
                          : loan.status === 'AMBER'
                          ? 'warning.main'
                          : 'error.main'
                      }
                    >
                      {loan.currentRatio != null ? `${loan.currentRatio.toFixed(2)}x` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" color="text.secondary">
                      {loan.covenantLimit != null ? `${loan.covenantLimit.toFixed(1)}x` : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <StatusBadge status={loan.status} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(loan.lastTestDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {loan.isSealed && loan.lastTxHash ? (
                      <Tooltip title={`View on blockchain: ${truncateHash(loan.lastTxHash)}`}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(getExplorerUrl(loan.lastTxHash!), '_blank');
                          }}
                        >
                          <VerifiedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Pending
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        component={Link}
                        href={`/loans/${loan.id}`}
                        size="small"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}
