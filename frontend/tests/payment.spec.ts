import { test, expect } from '@playwright/test';

test.describe('Flux de commande et paiement', () => {
    test('Devrait permettre à un utilisateur de finaliser une commande urgente', async ({ page }) => {
        // Étape 1 : Accès à la page d'accueil mockée
        await page.goto('http://localhost:8080/');

        // Fermer le preloader si présent ou attendre le chargement de l'app
        await page.waitForSelector('text=PharmaGo', { timeout: 10000 });

        // Mock des requêtes Supabase pour ne pas dépendre du backend en test E2E strict
        await page.route('**/rest/v1/pharmacies*', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify([{ id: '1', name: 'Pharmacie Centrale', is_on_duty: true, commune: 'Cocody' }]),
            });
        });

        // Étape 2 : Clic sur une action d'urgence
        const urgenceButton = page.locator('button:has-text("URGENCE")').first();
        if (await urgenceButton.isVisible()) {
            await urgenceButton.click();
        } else {
            // Fallback navigation vers parapharmacie
            await page.goto('http://localhost:8080/parapharmacie');
        }

        // Étape 3 : Ajouter un item au panier
        const addToCartBtn = page.locator('button:has-text("Ajouter")').first();
        await addToCartBtn.waitFor({ state: 'visible' });
        await addToCartBtn.click();

        // Étape 4 : Ouvrir le panier
        await page.locator('button:has(svg.lucide-shopping-cart)').first().click();

        // Aller au paiement
        await page.getByRole('button', { name: /Commander/i }).click();

        // Étape 5 : Remplissage des informations de livraison
        // La route /paiement devrait être active
        await expect(page).toHaveURL(/.*paiement/);

        await page.fill('input[placeholder="Entrez votre adresse de livraison"]', 'Abidjan, Cocody Centre');
        await page.fill('input[type="tel"]', '0707070707');

        // Étape 6 : Sélection de la méthode de paiement
        await page.getByText('Paiement à la livraison').click();

        // Confirmation
        await page.getByRole('button', { name: /Confirmer le paiement/i }).click();

        // Vérification du succès (Invoice ou Tracking affiché)
        await expect(page.locator('text=Commande confirmée').first()).toBeVisible({ timeout: 10000 });
    });
});
