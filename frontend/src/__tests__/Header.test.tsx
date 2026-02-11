import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import Header from '../components/Header';
import { DataSaverProvider } from '../contexts/DataSaverContext';
import * as useAuthHook from '../hooks/useAuth';

// Mock various components and hooks
vi.mock('../components/cart/CartDrawer', () => ({
    CartDrawer: () => <div data-testid="cart-drawer">Cart</div>
}));
vi.mock('../components/NotificationsPopover', () => ({
    NotificationsPopover: () => <div data-testid="notifications">Notifications</div>
}));
vi.mock('../components/ThemeToggle', () => ({
    ThemeToggle: () => <div data-testid="theme-toggle">Theme</div>
}));

// Mock Supabase client
vi.mock('../integrations/supabase/client', () => ({
    supabase: {
        auth: {
            signOut: vi.fn()
        }
    }
}));

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderHeader = () => {
        return render(
            <BrowserRouter>
                <DataSaverProvider>
                    <Header />
                </DataSaverProvider>
            </BrowserRouter>
        );
    };

    it('renders correctly for unauthenticated user', () => {
        // Mock user as null
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null,
            profile: null,
            session: null,
            loading: false,
            signUp: vi.fn(),
            signIn: vi.fn(),
            signOut: vi.fn(),
            fetchProfile: vi.fn(),
            lastError: null
        });

        renderHeader();

        // Check for logo
        expect(screen.getByText('PharmaGo')).toBeInTheDocument();

        // Check for navigation links
        expect(screen.getByText('Accueil')).toBeInTheDocument();
        expect(screen.getByText('Ordonnances')).toBeInTheDocument();

        // Check for "Profils" button when not logged in
        expect(screen.getByText('Profils')).toBeInTheDocument();
    });

    it('renders correctly for authenticated user', () => {
        // Mock authenticated user
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: { id: '123', email: 'test@example.com' } as any,
            profile: {
                id: '123',
                name: 'John Doe',
                role: 'patient',
                email: 'test@example.com',
                created_at: '',
                verified: true
            },
            session: { access_token: 'token' } as any,
            loading: false,
            signUp: vi.fn(),
            signIn: vi.fn(),
            signOut: vi.fn(),
            fetchProfile: vi.fn(),
            lastError: null
        });

        renderHeader();

        // Check for user name and role badge
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Patient')).toBeInTheDocument();
    });

    it('toggles mobile menu', () => {
        vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
            user: null,
            profile: null,
            session: null,
            loading: false,
            signUp: vi.fn(),
            signIn: vi.fn(),
            signOut: vi.fn(),
            fetchProfile: vi.fn(),
            lastError: null
        });

        renderHeader();

        // Find mobile menu button
        const menuButton = screen.getByLabelText('Ouvrir le menu');
        fireEvent.click(menuButton);

        // Check if close icon/label is present (aria-label changes)
        expect(screen.getByLabelText('Fermer le menu')).toBeInTheDocument();

        // Check if mobile specific links are visible (might need to check visibility specifically if hidden via CSS)
        // In JSDOM, we rely on presence in document for conditional rendering
        const mobileLinks = screen.getAllByText('Accueil');
        expect(mobileLinks.length).toBeGreaterThan(0);
    });
});
