describe('PharmaGo Navigation and Core Flows', () => {
    beforeEach(() => {
        // Visit the base URL defined in cypress.config.ts
        cy.visit('/')
    })

    it('verifies the homepage loads correctly', () => {
        // Check main branding
        cy.contains('h1', 'PharmaGo').should('be.visible')
        cy.contains('Votre pharmacie à portée de clic').should('be.visible')
    })

    it('can trigger the BMAD Emergency flow', () => {
        cy.get('button').contains('URGENCE').click()
        cy.contains('Mode Urgence Vitale Activé').should('be.visible')
    })

    it('can access the AI Prescription Scanner', () => {
        cy.get('button').contains('Scanner une ordonnance').click()
        cy.contains("Analyse d'Ordonnance IA").should('be.visible')
    })

    it('can open Leslie Virtual Pharmacist', () => {
        // Assuming the floating assistant button has a recognizable aria-label or image
        cy.get('button[aria-label="Ouvrir le chat Leslie"], img[alt="Leslie - Assistant IA"]').click()
        cy.contains('Leslie').should('be.visible')
    })
})
