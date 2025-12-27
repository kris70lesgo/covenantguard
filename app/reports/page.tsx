'use client';

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Download as DownloadIcon,
  VerifiedUser as VerifiedIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { mockLoans, mockComplianceEvents } from '@/lib/mock-data';
import { usePortfolio } from '@/lib/hooks/usePortfolio';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate, truncateHash } from '@/lib/utils';

export default function ReportsPage() {
  const { loans, stats, loading, refresh } = usePortfolio();

  // Generate CSV content
  const generateCSV = () => {
    const headers = [
      'Loan ID',
      'Borrower',
      'Facility Amount',
      'Outstanding',
      'Maturity Date',
      'Debt/EBITDA',
      'Max Allowed',
      'Interest Coverage',
      'Min Required',
      'Current Ratio',
      'Min Required',
      'Status',
      'Last Tx Hash',
      'Blockchain Verified',
    ];

    const rows = loans.map((loan) => [
      loan.id,
      loan.borrowerName,
      loan.facilityAmount,
      loan.outstandingAmount,
      loan.maturityDate,
      loan.debtToEbitda.toFixed(2),
      loan.covenantLimits.maxDebtToEbitda.toFixed(1),
      loan.interestCoverage.toFixed(2),
      loan.covenantLimits.minInterestCoverage.toFixed(1),
      loan.currentRatio.toFixed(2),
      loan.covenantLimits.minCurrentRatio.toFixed(1),
      loan.status,
      loan.lastTxHash || '',
      loan.isSealed ? 'Yes' : 'No',
    ]);

    const csv = [
      '# CovenantGuard Portfolio Export',
      `# Generated: ${new Date().toISOString()}`,
      `# Blockchain Verified Report`,
      '',
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  };

  const handleExportCSV = () => {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `covenantguard-portfolio-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // For demo purposes, create a simple printable HTML page
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>CovenantGuard Compliance Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1976d2; }
            .watermark { color: #4caf50; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1976d2; color: white; }
            .green { color: #4caf50; font-weight: bold; }
            .amber { color: #ff9800; font-weight: bold; }
            .red { color: #f44336; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
            .verified { display: flex; align-items: center; gap: 8px; color: #4caf50; }
          </style>
        </head>
        <body>
          <h1>🛡️ CovenantGuard</h1>
          <h2>Portfolio Compliance Report</h2>
          <div class="watermark">✓ BLOCKCHAIN VERIFIED - Polygon Amoy Network</div>
          
          <h3>Summary</h3>
          <p>Total Loans: ${stats.totalLoans} | 
             Exposure: ${formatCurrency(stats.totalExposure)} | 
             Compliance Rate: ${stats.complianceRate.toFixed(0)}%</p>
          <p>
            <span class="green">${stats.greenCount} Compliant</span> | 
            <span class="amber">${stats.amberCount} Warning</span> | 
            <span class="red">${stats.redCount} Breach</span>
          </p>
          
          <h3>Loan Portfolio</h3>
          <table>
            <tr>
              <th>Borrower</th>
              <th>Facility</th>
              <th>Debt/EBITDA</th>
              <th>Limit</th>
              <th>Status</th>
              <th>Verified</th>
            </tr>
            ${loans.map((loan) => `
              <tr>
                <td>${loan.borrowerName}</td>
                <td>${formatCurrency(loan.facilityAmount)}</td>
                <td>${loan.debtToEbitda.toFixed(2)}x</td>
                <td>${loan.covenantLimits.maxDebtToEbitda.toFixed(1)}x</td>
                <td class="${loan.status.toLowerCase()}">${loan.status}</td>
                <td>${loan.isSealed ? '✓ Verified' : '-'}</td>
              </tr>
            `).join('')}
          </table>
          
          <div class="footer">
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Report verified on Polygon Amoy blockchain. Transaction hashes available in CSV export.</p>
            <p>© ${new Date().getFullYear()} CovenantGuard - AI-Driven Loan Covenant Monitoring</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Reports & Export
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate compliance reports and export portfolio data
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={refresh} disabled={loading} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Export Options */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <PdfIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Compliance Report (PDF)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Generate a comprehensive PDF report with blockchain verification
                watermarks for all covenant compliance events.
              </Typography>
              <Chip
                icon={<VerifiedIcon />}
                label="Blockchain Verified"
                color="success"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportPDF}
                >
                  Export PDF Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <ExcelIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Portfolio Data (CSV/Excel)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Export raw portfolio data including all loan metrics, covenant
                calculations, and blockchain transaction hashes.
              </Typography>
              <Chip
                label="Full Data Export"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportCSV}
                >
                  Export CSV
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Portfolio Summary */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Portfolio Summary
          </Typography>
          
          {loading ? (
            <Skeleton variant="rounded" height={80} />
          ) : (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Loans
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stats.totalLoans}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Exposure
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatCurrency(stats.totalExposure)}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Compliant
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {stats.greenCount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Warning
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {stats.amberCount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Breach
                </Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {stats.redCount}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Compliance Rate
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stats.complianceRate.toFixed(0)}%
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Compliance Events Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Compliance Events
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Borrower</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Covenant</TableCell>
                  <TableCell align="center">Ratio</TableCell>
                  <TableCell align="center">Limit</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Tx Hash</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockComplianceEvents.map((event) => {
                  const loan = loans.find((l) => l.id === event.loanId) || mockLoans.find((l) => l.id === event.loanId);
                  return (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {loan?.borrowerName || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatDate(event.timestamp)}</TableCell>
                      <TableCell>
                        <Chip label="Debt/EBITDA" size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={600}>
                          {event.ratio.toFixed(2)}x
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography color="text.secondary">
                          {loan?.covenantLimit.toFixed(1)}x
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge status={event.status} size="small" />
                      </TableCell>
                      <TableCell>
                        {event.txHash ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VerifiedIcon fontSize="small" color="success" />
                            <Typography variant="body2" fontFamily="monospace">
                              {truncateHash(event.txHash, 6)}
                            </Typography>
                          </Box>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
