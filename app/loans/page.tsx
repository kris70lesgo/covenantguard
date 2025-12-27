'use client';

import { Box, Typography, Skeleton, Chip, IconButton, Tooltip } from '@mui/material';
import { Refresh as RefreshIcon, Storage as StorageIcon, Code as CodeIcon } from '@mui/icons-material';
import LoanTable from '@/components/LoanTable';
import { usePortfolio } from '@/lib/hooks/usePortfolio';

export default function LoansPage() {
  const { loans, loading, refresh, source } = usePortfolio();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Loan Facilities
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and monitor all loan facilities in your portfolio
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip
            icon={source === 'database' ? <StorageIcon /> : <CodeIcon />}
            label={source === 'database' ? 'Live Data' : source === 'loading' ? 'Loading...' : 'Demo Mode'}
            color={source === 'database' ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
          <Tooltip title="Refresh data">
            <IconButton onClick={refresh} disabled={loading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Loans Table */}
      {loading ? (
        <Skeleton variant="rounded" height={400} />
      ) : (
        <LoanTable loans={loans} title="All Loans" />
      )}
    </Box>
  );
}
