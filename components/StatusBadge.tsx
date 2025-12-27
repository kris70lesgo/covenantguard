'use client';

import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { CovenantStatus } from '@/lib/types';
import { getStatusColor, getStatusLabel } from '@/lib/utils';

interface StatusBadgeProps {
  status: CovenantStatus;
  size?: 'small' | 'medium';
}

export function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const colors = getStatusColor(status);
  const label = getStatusLabel(status);

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: size === 'small' ? 1.5 : 2,
        py: size === 'small' ? 0.5 : 0.75,
        borderRadius: 2,
        bgcolor: status === 'GREEN' 
          ? 'rgba(34, 197, 94, 0.1)' 
          : status === 'AMBER' 
          ? 'rgba(245, 158, 11, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
      }}
    >
      <Box
        sx={{
          width: size === 'small' ? 6 : 8,
          height: size === 'small' ? 6 : 8,
          borderRadius: '50%',
          bgcolor: status === 'GREEN' 
            ? 'success.main' 
            : status === 'AMBER' 
            ? 'warning.main' 
            : 'error.main',
        }}
      />
      <Typography
        variant={size === 'small' ? 'caption' : 'body2'}
        fontWeight={600}
        sx={{
          color: status === 'GREEN' 
            ? 'success.dark' 
            : status === 'AMBER' 
            ? 'warning.dark' 
            : 'error.dark',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  status?: CovenantStatus;
}

export function StatCard({ title, value, subtitle, icon, trend, status }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: status 
                  ? status === 'GREEN' 
                    ? 'rgba(34, 197, 94, 0.1)' 
                    : status === 'AMBER' 
                    ? 'rgba(245, 158, 11, 0.1)' 
                    : 'rgba(239, 68, 68, 0.1)'
                  : 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: status 
                  ? status === 'GREEN' 
                    ? 'success.main' 
                    : status === 'AMBER' 
                    ? 'warning.main' 
                    : 'error.main'
                  : 'primary.main',
              }}
            >
              {icon}
            </Box>
          )}
        </Box>
        {trend && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="caption"
              color={trend.positive ? 'success.main' : 'error.main'}
              fontWeight={600}
            >
              {trend.positive ? '+' : ''}{trend.value}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              from last quarter
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
