import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PharmacyService } from '../services/PharmacyService';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                gt: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
                })),
                eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
                limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
                order: vi.fn(() => Promise.resolve({ data: [], error: null })),
                ilike: vi.fn(() => Promise.resolve({ data: [], error: null })),
            }))
        }))
    }
}));

describe('PharmacyService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return recommendations when data is present', async () => {
        const mockData = [
            {
                price: 1500,
                medicine: { id: 'med1', name: 'Doliprane', category: 'Douleur' }
            },
            {
                price: 2500,
                medicine: { id: 'med2', name: 'Spasfon', category: 'Digestif' }
            }
        ];

        // Setup mock response
        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn(() => ({
                gt: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
                }))
            }))
        }));

        const results = await PharmacyService.getRecommendations('user123');

        expect(results).toHaveLength(2);
        const names = results.map(r => r.name);
        expect(names).toContain('Doliprane');
        expect(names).toContain('Spasfon');
    });

    it('should return empty array when supabase errors', async () => {
        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn(() => ({
                gt: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: null, error: new Error('DB Error') }))
                }))
            }))
        }));

        const results = await PharmacyService.getRecommendations('user123');
        expect(results).toEqual([]);
    });

    it('should prioritize preferred categories', async () => {
        const mockData = [
            {
                price: 1000,
                medicine: { id: 'med1', name: 'Med1', category: 'A' }
            },
            {
                price: 2000,
                medicine: { id: 'med2', name: 'Med2', category: 'B' }
            }
        ];

        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn(() => ({
                gt: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
                }))
            }))
        }));

        // B is preferred, so Med2 should be first
        const results = await PharmacyService.getRecommendations('user123', ['B']);

        expect(results[0].name).toBe('Med2');
        expect(results[1].name).toBe('Med1');
    });
});
