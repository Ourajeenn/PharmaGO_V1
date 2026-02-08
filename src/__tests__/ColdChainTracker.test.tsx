import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColdChainTracker } from '../components/delivery/ColdChainTracker'

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        warning: vi.fn(),
    },
}))

describe('ColdChainTracker Component', () => {
    it('renders cold chain title', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('Chaîne du Froid')).toBeInTheDocument()
    })

    it('displays real-time monitoring subtitle', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('Surveillance température en temps réel')).toBeInTheDocument()
    })

    it('shows medication items', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('Insuline Lantus')).toBeInTheDocument()
        expect(screen.getByText('Vaccin Pfizer')).toBeInTheDocument()
        expect(screen.getByText('Sérum physiologique')).toBeInTheDocument()
    })

    it('displays order IDs', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('PG-2486')).toBeInTheDocument()
        expect(screen.getByText('PG-2487')).toBeInTheDocument()
        expect(screen.getByText('PG-2488')).toBeInTheDocument()
    })

    it('shows status summary counts', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('Normal')).toBeInTheDocument()
        expect(screen.getByText('Attention')).toBeInTheDocument()
        expect(screen.getByText('Critique')).toBeInTheDocument()
    })

    it('displays temperature values', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('4.2°C')).toBeInTheDocument()
        expect(screen.getByText('6.8°C')).toBeInTheDocument()
        expect(screen.getByText('22°C')).toBeInTheDocument()
    })

    it('shows location information', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('En transit - Cocody')).toBeInTheDocument()
        expect(screen.getByText('En transit - Plateau')).toBeInTheDocument()
        expect(screen.getByText('En transit - Marcory')).toBeInTheDocument()
    })

    it('has refresh button', () => {
        render(<ColdChainTracker />)
        const refreshButton = screen.getByRole('button')
        expect(refreshButton).toBeInTheDocument()
    })

    it('shows alert badge when there are warnings', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText(/alerte/)).toBeInTheDocument()
    })

    it('shows report button for non-normal items', () => {
        render(<ColdChainTracker />)
        expect(screen.getByText('Signaler le problème')).toBeInTheDocument()
    })
})
