import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EWallet } from '../components/wallet/EWallet'

// Mock sonner toast
vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

describe('EWallet Component', () => {
    it('renders wallet title', () => {
        render(<EWallet />)
        expect(screen.getByText('Mon Portefeuille')).toBeInTheDocument()
    })

    it('displays initial balance', () => {
        render(<EWallet />)
        expect(screen.getByText(/25[\s,.]?000/)).toBeInTheDocument()
    })

    it('displays security badge', () => {
        render(<EWallet />)
        expect(screen.getByText('Sécurisé')).toBeInTheDocument()
    })

    it('shows quick action buttons', () => {
        render(<EWallet />)
        expect(screen.getByText('Envoyer')).toBeInTheDocument()
        expect(screen.getByText('Recevoir')).toBeInTheDocument()
        expect(screen.getByText('Historique')).toBeInTheDocument()
    })

    it('displays recent transactions', () => {
        render(<EWallet />)
        expect(screen.getByText('Transactions récentes')).toBeInTheDocument()
        expect(screen.getByText('Recharge Orange Money')).toBeInTheDocument()
    })

    it('shows loyalty bonus banner', () => {
        render(<EWallet />)
        expect(screen.getByText('Bonus fidélité actif')).toBeInTheDocument()
    })

    it('opens top-up dialog when recharge button is clicked', () => {
        render(<EWallet />)
        const rechargeButton = screen.getByText('Recharger')
        fireEvent.click(rechargeButton)
        expect(screen.getByText('Recharger mon portefeuille')).toBeInTheDocument()
    })

    it('shows quick amount buttons in dialog', () => {
        render(<EWallet />)
        const rechargeButton = screen.getByText('Recharger')
        fireEvent.click(rechargeButton)
        expect(screen.getByText('5k')).toBeInTheDocument()
        expect(screen.getByText('10k')).toBeInTheDocument()
        expect(screen.getByText('25k')).toBeInTheDocument()
        expect(screen.getByText('50k')).toBeInTheDocument()
    })

    it('shows payment method tabs', () => {
        render(<EWallet />)
        const rechargeButton = screen.getByText('Recharger')
        fireEvent.click(rechargeButton)
        expect(screen.getByText(/Orange/)).toBeInTheDocument()
        expect(screen.getByText(/MTN/)).toBeInTheDocument()
        expect(screen.getByText(/Wave/)).toBeInTheDocument()
        expect(screen.getByText(/Carte/)).toBeInTheDocument()
    })
})
