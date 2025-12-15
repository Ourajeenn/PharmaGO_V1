import { useEffect } from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    noindex?: boolean;
}

const SEO = ({
    title = 'PharmaGo - Pharmacie en Ligne Abidjan | Livraison Médicaments 24h',
    description = 'Commandez vos médicaments en ligne à Abidjan avec PharmaGo. Livraison rapide 24h/24, consultation médicale IA gratuite, ordonnances en ligne. Plus de 100 pharmacies partenaires en Côte d\'Ivoire.',
    keywords = 'pharmacie en ligne, médicaments Abidjan, livraison médicaments, pharmacie Côte d\'Ivoire, ordonnance en ligne, téléconsultation, e-santé, parapharmacie, pharmacie de garde',
    image = '/og-image.jpg',
    url = 'https://pharmago.ci',
    type = 'website',
    noindex = false
}: SEOProps) => {
    useEffect(() => {
        const siteName = 'PharmaGo';
        const fullTitle = title.includes('PharmaGo') ? title : `${title} | PharmaGo`;

        // Update document title
        document.title = fullTitle;

        // Helper function to update or create meta tag
        const updateMetaTag = (selector: string, content: string, isProperty = false) => {
            const attribute = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attribute}="${selector}"]`) as HTMLMetaElement;

            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, selector);
                document.head.appendChild(element);
            }
            element.content = content;
        };

        // Primary Meta Tags
        updateMetaTag('title', fullTitle);
        updateMetaTag('description', description);
        updateMetaTag('keywords', keywords);

        // Robots
        updateMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');

        // Open Graph / Facebook
        updateMetaTag('og:type', type, true);
        updateMetaTag('og:url', url, true);
        updateMetaTag('og:title', fullTitle, true);
        updateMetaTag('og:description', description, true);
        updateMetaTag('og:image', image, true);
        updateMetaTag('og:site_name', siteName, true);
        updateMetaTag('og:locale', 'fr_FR', true);

        // Twitter
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:url', url);
        updateMetaTag('twitter:title', fullTitle);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:image', image);

        // Additional SEO
        updateMetaTag('language', 'French');
        updateMetaTag('geo.region', 'CI');
        updateMetaTag('geo.placename', 'Abidjan');

        // Canonical link
        let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
        if (!canonicalLink) {
            canonicalLink = document.createElement('link');
            canonicalLink.rel = 'canonical';
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = url;
    }, [title, description, keywords, image, url, type, noindex]);

    return null; // This component doesn't render anything
};

export default SEO;
