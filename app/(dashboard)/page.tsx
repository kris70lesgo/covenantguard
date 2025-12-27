'use client';

import { Box, Grid, Typography, Card, CardContent, LinearProgress } from '@mui/material';
import {
  AccountBalance as LoanIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { mockLoans, getPortfolioStats } from '@/lib/mock-data';
import { StatCard } from '@/components/StatusBadge';
import LoanTable from '@/components/LoanTable';
import { formatCurrency } from '@/lib/utils';

export default function PortfolioDashboard() {
  const stats = getPortfolioStats();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Portfolio Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time covenant compliance monitoring across your loan portfolio
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Loans"
            value={stats.totalLoans}
            subtitle="Active facilities"
            icon={<LoanIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Exposure"
            value={formatCurrency(stats.totalExposure)}
            subtitle="Outstanding balance"
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Compliance Rate"
            value={`${stats.complianceRate.toFixed(0)}%`}
            subtitle={`${stats.greenCount} of ${stats.totalLoans} compliant`}
            icon={<CheckIcon />}
            status="GREEN"
            trend={{ value: 5, positive: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="At Risk"
            value={formatCurrency(stats.atRiskExposure)}
            subtitle={`${stats.amberCount + stats.redCount} loans need attention`}
            icon={<WarningIcon />}
            status="AMBER"
          />
        </Grid>
      </Grid>

      {/* Status Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderLeft: 4, borderColor: 'success.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(34, 197, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CheckIcon sx={{ color: 'success.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight={700} color="success.main">
                    {stats.greenCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compliant Loans
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.greenCount / stats.totalLoans) * 100}
                color="success"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderLeft: 4, borderColor: 'warning.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WarningIcon sx={{ color: 'warning.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight={700} color="warning.main">
                    {stats.amberCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Early Warning
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.amberCount / stats.totalLoans) * 100}
                color="warning"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderLeft: 4, borderColor: 'error.main' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ErrorIcon sx={{ color: 'error.main' }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h3" fontWeight={700} color="error.main">
                    {stats.redCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Breach Detected
                  </Typography>
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.redCount / stats.totalLoans) * 100}
                color="error"
                sx={{ mt: 2, height: 6, borderRadius: 3 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loans Table */}
      <LoanTable loans={mockLoans} />
    </Box>
  );
}
