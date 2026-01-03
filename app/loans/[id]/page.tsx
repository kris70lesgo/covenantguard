'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  CloudUpload as UploadIcon,
  OpenInNew as ExternalIcon,
  VerifiedUser as VerifiedIcon,
  TrendingUp as TrendingIcon,
  AccountBalance as LoanIcon,
  Description as DocIcon,
} from '@mui/icons-material';
import { mockDocuments, mockComplianceEvents } from '@/lib/mock-data';
import { useLoan } from '@/lib/hooks/usePortfolio';
import { StatusBadge } from '@/components/StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateHash,
  getExplorerUrl,
} from '@/lib/utils';

interface LoanDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LoanDetailPage({ params }: LoanDetailPageProps) {
  const { id } = use(params);
  const { loan, loading, error } = useLoan(id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !loan) {
    return (
      <Box>
        <Button component={Link} href="/loans" startIcon={<BackIcon />} sx={{ mb: 2 }}>
          Back to Loans
        </Button>
        <Alert severity="error">
          {error || 'Loan not found'}
        </Alert>
      </Box>
    );
  }

  const loanDocuments = mockDocuments.filter((d) => d.loanId === id);
  const loanEvents = mockComplianceEvents.filter((e) => e.loanId === id);

  const utilizationRate = (loan.outstandingAmount / loan.facilityAmount) * 100;

  return (
    <Box>
      {/* Back Button & Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/loans"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Loans
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {loan.borrowerName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                {loan.id}
              </Typography>
              <StatusBadge status={loan.status} />
            </Box>
          </Box>
          <Button
            component={Link}
            href="/upload"
            variant="contained"
            startIcon={<UploadIcon />}
          >
            Upload Document
          </Button>
        </Box>
      </Box>

      {/* Status Alert */}
      {loan.status === 'RED' && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Covenant Breach Detected:</strong> Current Debt/EBITDA ratio of {loan.debtToEbitda.toFixed(2)}x 
          exceeds the limit of {loan.covenantLimits.maxDebtToEbitda.toFixed(1)}x. Immediate action required.
        </Alert>
      )}
      {loan.status === 'AMBER' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Early Warning:</strong> Current Debt/EBITDA ratio of {loan.debtToEbitda.toFixed(2)}x 
          is approaching the limit of {loan.covenantLimits.maxDebtToEbitda.toFixed(1)}x. Monitor closely.
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LoanIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Facility Amount
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={500}>
                {formatCurrency(loan.facilityAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <TrendingIcon fontSize="small" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Outstanding
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight={500}>
                {formatCurrency(loan.outstandingAmount)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {utilizationRate.toFixed(0)}% utilized
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Debt/EBITDA Ratio
              </Typography>
              <Typography
                variant="h5"
                fontWeight={500}
                color={
                  loan.status === 'GREEN'
                    ? 'success.main'
                    : loan.status === 'AMBER'
                    ? 'warning.main'
                    : 'error.main'
                }
              >
                {loan.debtToEbitda.toFixed(2)}x
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Limit: {loan.covenantLimits.maxDebtToEbitda.toFixed(1)}x
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Maturity Date
              </Typography>
              <Typography variant="h5" fontWeight={500}>
                {formatDate(loan.maturityDate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Financial Details */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={500} gutterBottom>
                Covenant Metrics
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Debt/EBITDA Ratio</Typography>
                <Typography fontWeight={500}>{loan.debtToEbitda.toFixed(2)}x</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Max Allowed</Typography>
                <Typography fontWeight={500}>{loan.covenantLimits.maxDebtToEbitda.toFixed(1)}x</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Interest Coverage</Typography>
                <Typography fontWeight={500}>{loan.interestCoverage.toFixed(2)}x</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Min Required</Typography>
                <Typography fontWeight={500}>{loan.covenantLimits.minInterestCoverage.toFixed(1)}x</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography color="text.secondary">Current Ratio</Typography>
                <Typography fontWeight={500}>{loan.currentRatio.toFixed(2)}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Min Required</Typography>
                <Typography fontWeight={500}>{loan.covenantLimits.minCurrentRatio.toFixed(1)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Blockchain Verification
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {loan.isSealed && loan.lastTxHash ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <VerifiedIcon color="success" />
                    <Typography color="success.main" fontWeight={600}>
                      Verified on Blockchain
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary">Network</Typography>
                    <Chip label="Polygon Amoy" size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="text.secondary">Transaction Hash</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {truncateHash(loan.lastTxHash)}
                      </Typography>
                      <Tooltip title="View on Explorer">
                        <IconButton
                          size="small"
                          onClick={() => window.open(getExplorerUrl(loan.lastTxHash!), '_blank')}
                        >
                          <ExternalIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              ) : loanEvents.length > 0 && loanEvents[0].txHash ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <VerifiedIcon color="success" />
                    <Typography color="success.main" fontWeight={600}>
                      Verified on Blockchain
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary">Network</Typography>
                    <Chip label="Polygon Amoy" size="small" />
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography color="text.secondary">Transaction Hash</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontFamily="monospace">
                        {truncateHash(loanEvents[0].txHash || '')}
                      </Typography>
                      <Tooltip title="View on Explorer">
                        <IconButton
                          size="small"
                          onClick={() => window.open(getExplorerUrl(loanEvents[0].txHash || ''), '_blank')}
                        >
                          <ExternalIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No blockchain verification yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Documents */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Uploaded Documents
            </Typography>
            <Button
              component={Link}
              href="/upload"
              size="small"
              startIcon={<UploadIcon />}
            >
              Upload New
            </Button>
          </Box>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>File Name</TableCell>
                  <TableCell>Upload Date</TableCell>
                  <TableCell>OCR Confidence</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loanDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DocIcon fontSize="small" color="primary" />
                        {doc.fileName}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDateTime(doc.uploadDate)}</TableCell>
                    <TableCell>
                      {doc.ocrConfidence 
                        ? `${(doc.ocrConfidence * 100).toFixed(0)}%` 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.status}
                        size="small"
                        color={doc.status === 'sealed' ? 'success' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Compliance History */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Compliance Event History
          </Typography>
          
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Total Debt</TableCell>
                  <TableCell align="right">EBITDA</TableCell>
                  <TableCell align="center">Ratio</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Blockchain</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loanEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{formatDateTime(event.timestamp)}</TableCell>
                    <TableCell align="right">{formatCurrency(event.totalDebt)}</TableCell>
                    <TableCell align="right">{formatCurrency(event.ebitda)}</TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>
                        {event.ratio.toFixed(2)}x
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
                          <IconButton
                            size="small"
                            onClick={() => window.open(getExplorerUrl(event.txHash!), '_blank')}
                          >
                            <ExternalIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
