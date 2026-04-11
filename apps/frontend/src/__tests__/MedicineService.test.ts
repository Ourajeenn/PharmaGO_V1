import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MedicineService } from '../services/MedicineService';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
                    limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
                    eq: vi.fn(() => ({
                        range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
                    }))
                })),
                or: vi.fn(() => ({
                    order: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
                    }))
                })),
                eq: vi.fn(() => ({
                    order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                }))
            }))
        }))
    }
}));

describe('MedicineService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch medicines with pagination', async () => {
        const mockData = [{ id: '1', name: 'Med A' }, { id: '2', name: 'Med B' }];

        // Setup mock response
        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({ data: mockData, error: null, count: 10 }))
                }))
            }))
        }));

        const { data, count } = await MedicineService.getMedicines(undefined, 1, 2);

        expect(data).toHaveLength(2);
        expect(count).toBe(10);
    });

    it('should search medicines with or filters', async () => {
        const mockData = [{ id: '1', name: 'Aspirine' }];

        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn(() => ({
                or: vi.fn(() => ({
                    order: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
                    }))
                }))
            }))
        }));

        const results = await MedicineService.searchMedicines('Aspi');

        expect(results).toHaveLength(1);
        expect(results[0].name).toBe('Aspirine');
    });

    it('should throw error when supabase fails', async () => {
        (supabase.from as any).mockImplementation(() => ({
            select: vi.fn(() => ({
                order: vi.fn(() => ({
                    range: vi.fn(() => Promise.resolve({ data: null, error: new Error('Network Error'), count: 0 }))
                }))
            }))
        }));

        await expect(MedicineService.getMedicines()).rejects.toThrow('Network Error');
    });
});
