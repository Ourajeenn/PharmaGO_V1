import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { EnhancedAnalytics } from '../components/analytics/EnhancedAnalytics';
import * as useAnalyticsHook from '../hooks/useAnalytics';

// Mock Recharts or other complex UI components if necessary
// Here we are testing the integration with the hook and rendering of data

describe('EnhancedAnalytics Component', () => {
    it('renders loading state initially or when fetching', () => {
        // Mock hook loading state behavior if applicable
        // Since the component doesn't have a full page loader but button loading state
        // We can test the button disabled state

        vi.spyOn(useAnalyticsHook, 'useAnalytics').mockReturnValue({
            metrics: null,
            loading: true,
            error: null,
            fetchAnalytics: vi.fn()
        });

        render(<EnhancedAnalytics />);

        // Check if refresh button is disabled/loading
        const refreshButton = screen.getByText('Actualiser').closest('button');
        expect(refreshButton).toBeDisabled();
    });

    it('renders metrics data correctly when loaded', () => {
        const mockMetrics = {
            totalOrders: 150,
            revenue: 500,
            newPatients: 45,
            prescriptions: 89,
            deliveries: 120,
            criticalStock: 999,
            topMedications: []
        };

        vi.spyOn(useAnalyticsHook, 'useAnalytics').mockReturnValue({
            metrics: mockMetrics,
            loading: false,
            error: null,
            fetchAnalytics: vi.fn()
        });

        render(<EnhancedAnalytics />);

        // Check for specific values
        expect(screen.getByText('150')).toBeInTheDocument(); // Orders
        expect(screen.getByText('500')).toBeInTheDocument(); // Revenue (no separators)
        expect(screen.getByText('45')).toBeInTheDocument(); // New Patients
        expect(screen.getByText('999')).toBeInTheDocument(); // Critical Stock
    });

    it('calls fetchAnalytics on mount', () => {
        const mockFetch = vi.fn();
        vi.spyOn(useAnalyticsHook, 'useAnalytics').mockReturnValue({
            metrics: null,
            loading: false,
            error: null,
            fetchAnalytics: mockFetch
        });

        render(<EnhancedAnalytics />);

        expect(mockFetch).toHaveBeenCalledWith('7d'); // Default time range
    });
});
