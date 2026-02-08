import { Pharmacy } from "@/types/pharmacy";

export const ABIDJAN_PHARMACIES: Pharmacy[] = [
    // ========== COCODY (21 pharmacies) ==========
    { id: '1', name: 'Pharmacie Marie Esther', address: 'Cocody Riviéra Palmeraie Programme 4, route du Lycée St Viateur', commune: 'Cocody', latitude: 5.3580, longitude: -3.9420, phone: '+225 27 22 49 53 23', isOpen: true, isOnDuty: true, rating: 4.8 },
    { id: '2', name: 'Grande Pharmacie des Arts', address: 'Cocody Les Arts, Boulevard des Arts', commune: 'Cocody', latitude: 5.3550, longitude: -3.9880, phone: '+225 22 44 42 35', isOpen: true, isOnDuty: false, rating: 4.6 },
    { id: '3', name: 'Pharmacie St François de Danga', address: 'Cocody Danga, près de l\'église', commune: 'Cocody', latitude: 5.3700, longitude: -3.9750, phone: '+225 22 48 54 08', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '4', name: 'Pharmacie du Golf', address: 'Cocody Riviera Golf, près du Golf Hôtel', commune: 'Cocody', latitude: 5.3520, longitude: -3.9600, phone: '+225 22 43 14 33', isOpen: true, isOnDuty: true, rating: 4.9 },
    { id: '5', name: 'Pharmacie Arc en Ciel', address: 'Cocody Vallons, quartier résidentiel', commune: 'Cocody', latitude: 5.3620, longitude: -3.9820, phone: '+225 22 41 33 90', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '6', name: 'Pharmacie Angré', address: 'Cocody Angré, carrefour principal', commune: 'Cocody', latitude: 5.3750, longitude: -3.9680, phone: '+225 22 42 11 06', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '7', name: 'Pharmacie Ste Agathe', address: 'Cocody Riviera, boulevard principal', commune: 'Cocody', latitude: 5.3480, longitude: -3.9550, phone: '+225 22 47 48 19', isOpen: false, isOnDuty: false, rating: 4.3 },
    { id: '8', name: 'Pharmacie Saint Jean', address: 'Cocody II Plateaux, près station Shell', commune: 'Cocody', latitude: 5.3590, longitude: -3.9900, phone: '+225 22 44 62 49', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '9', name: 'Pharmacie de l\'Ivoire', address: 'Cocody Ambassades, rue des ambassades', commune: 'Cocody', latitude: 5.3450, longitude: -3.9700, phone: '+225 22 00 42 27', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '10', name: 'Pharmacie Philadelphie', address: 'Cocody Riviera II, après le carrefour Palmeraie', commune: 'Cocody', latitude: 5.3650, longitude: -3.9480, phone: '+225 44 62 35 42', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '11', name: 'Pharmacie Jules Verne', address: 'Cocody Riviera Bonoumin, quartier Jules Verne', commune: 'Cocody', latitude: 5.3720, longitude: -3.9520, phone: '+225 97 03 83 44', isOpen: false, isOnDuty: false, rating: 4.2 },
    { id: '12', name: 'Pharmacie les Arums', address: 'Cocody II Plateaux Les Arums', commune: 'Cocody', latitude: 5.3560, longitude: -3.9850, phone: '+225 22 50 66 40', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '13', name: 'Pharmacie II Plateaux Agban', address: 'Cocody II Plateaux Agban, près carrefour', commune: 'Cocody', latitude: 5.3610, longitude: -3.9780, phone: '+225 01 45 67 49', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '14', name: 'Pharmacie de Cocody', address: 'Cocody centre, face à la mairie', commune: 'Cocody', latitude: 5.3500, longitude: -3.9750, phone: '+225 22 44 24 95', isOpen: true, isOnDuty: true, rating: 4.8 },
    { id: '15', name: 'Nouvelle Pharmacie du Palm Club', address: 'Cocody Riviera Palmeraie, près du Palm Club', commune: 'Cocody', latitude: 5.3680, longitude: -3.9450, phone: '+225 78 12 57 47', isOpen: true, isOnDuty: false, rating: 4.6 },
    { id: '16', name: 'Pharmacie M\'Pouto', address: 'Cocody M\'Pouto, quartier résidentiel', commune: 'Cocody', latitude: 5.3780, longitude: -3.9580, phone: '+225 07 07 02 43', isOpen: false, isOnDuty: false, rating: 4.3 },
    { id: '17', name: 'Pharmacie Émeraude', address: 'Cocody Riviera Émeraude, après Total', commune: 'Cocody', latitude: 5.3640, longitude: -3.9620, phone: '+225 07 08 57 83', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '18', name: 'Pharmacie Kamon N\'Sio', address: 'Abatta Riviera Ephrata, Immeuble Symphonium', commune: 'Cocody', latitude: 5.3820, longitude: -3.9380, phone: '+225 07 06 84 75 53', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '19', name: 'Pharmacie Les Hortensias', address: 'Riviera Akouedo Extension, face église', commune: 'Cocody', latitude: 5.3850, longitude: -3.9320, phone: '+225 27 22 48 00 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '20', name: 'Pharmacie Sainte Béatrice des Rosiers', address: 'Carrefour Palmeraie/SCI Les Rosiers, face Quick Market', commune: 'Cocody', latitude: 5.3690, longitude: -3.9500, phone: '+225 27 22 49 00 00', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '21', name: 'Pharmacie des Deux Plateaux', address: 'Boulevard Latrille, Centre commercial SICOGI', commune: 'Cocody', latitude: 5.3570, longitude: -3.9920, phone: '+225 27 22 41 32 10', isOpen: true, isOnDuty: true, rating: 4.9 },

    // ========== YOPOUGON (22 pharmacies) ==========
    { id: '22', name: 'Pharmacie Yopougon Anador', address: 'Yopougon carrefour Anador', commune: 'Yopougon', latitude: 5.3380, longitude: -4.0850, phone: '+225 10 13 50 836', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '23', name: 'Pharmacie Bel Air', address: 'Yopougon Zone, en face du marché', commune: 'Yopougon', latitude: 5.3420, longitude: -4.0780, phone: '+225 27 23 45 00 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '24', name: 'Pharmacie Les Phalènes', address: 'Yopougon Les Phalènes, quartier résidentiel', commune: 'Yopougon', latitude: 5.3350, longitude: -4.0720, phone: '+225 23 46 01 83', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '25', name: 'Pharmacie Maty', address: 'Yopougon Wassakara, rue principale', commune: 'Yopougon', latitude: 5.3480, longitude: -4.0900, phone: '+225 23 46 27 80', isOpen: false, isOnDuty: false, rating: 4.3 },
    { id: '26', name: 'Grande Pharmacie Keneya', address: 'Yopougon Keneya, près du marché', commune: 'Yopougon', latitude: 5.3520, longitude: -4.0820, phone: '+225 23 45 44 65', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '27', name: 'Nouvelle Pharmacie Toit Rouge', address: 'Yopougon Toit Rouge, avenue principale', commune: 'Yopougon', latitude: 5.3300, longitude: -4.0680, phone: '+225 23 45 16 93', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '28', name: 'Pharmacie Azito', address: 'Yopougon Azito, près de la centrale', commune: 'Yopougon', latitude: 5.3150, longitude: -4.1050, phone: '+225 07 07 63 02 89', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '29', name: 'Pharmacie Bethesda', address: 'Yopougon Ananeraie, entre COOPEC et Collège Guichanrolain', commune: 'Yopougon', latitude: 5.3450, longitude: -4.0750, phone: '+225 27 23 46 00 00', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '30', name: 'Pharmacie Mariama d\'Allokoi', address: 'Yopougon Autoroute du Nord', commune: 'Yopougon', latitude: 5.3550, longitude: -4.0620, phone: '+225 27 23 47 00 00', isOpen: true, isOnDuty: false, rating: 4.3 },
    { id: '31', name: 'Pharmacie Principale', address: 'Yopougon face Place Ficgayo, près Centre Commercial Cosmos', commune: 'Yopougon', latitude: 5.3400, longitude: -4.0800, phone: '+225 27 21 74 53 40', isOpen: true, isOnDuty: true, rating: 4.8 },
    { id: '32', name: 'Pharmacie Les Ecluses', address: 'Yopougon Andokoi, entre Dépôt Sotra et Collège Minerva', commune: 'Yopougon', latitude: 5.3200, longitude: -4.0580, phone: '+225 27 23 53 23 17', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '33', name: 'Pharmacie Peniel', address: 'Yopougon Ananeraie Rond Point Gesco', commune: 'Yopougon', latitude: 5.3470, longitude: -4.0730, phone: '+225 07 09 75 82 07', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '34', name: 'Pharmacie Cité Verte', address: 'Cité Verte entre Carrefour Chambery et Collège Sebaco', commune: 'Yopougon', latitude: 5.3280, longitude: -4.0650, phone: '+225 27 23 45 62 33', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '35', name: 'Pharmacie Cité Maroc', address: 'Yopougon Maroc Zone de l\'Antenne, près Cash 225', commune: 'Yopougon', latitude: 5.3320, longitude: -4.0700, phone: '+225 27 23 51 87 58', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '36', name: 'Pharmacie Jean Pierre Sarl', address: 'Niangon Sud, Carrefour Jatak, Terminus bus 39', commune: 'Yopougon', latitude: 5.3580, longitude: -4.0950, phone: '+225 27 23 46 30 03', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '37', name: 'Pharmacie Carrefour Boby', address: 'Niangon, face Base CIE, entre Petro-Ivoire et Shell', commune: 'Yopougon', latitude: 5.3600, longitude: -4.0880, phone: '+225 27 23 52 16 39', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '38', name: 'Pharmacie Artemia', address: 'Yopougon Face Palais de Justice', commune: 'Yopougon', latitude: 5.3250, longitude: -4.0600, phone: '+225 27 23 52 38 54', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '39', name: 'Pharmacie Beraca', address: 'Yopougon Petit Toit Rouge, Carrefour Chapouli', commune: 'Yopougon', latitude: 5.3270, longitude: -4.0670, phone: '+225 07 09 26 48 99', isOpen: false, isOnDuty: false, rating: 4.3 },
    { id: '40', name: 'Pharmacie Boissy', address: 'Yopougon Toit Rouge, face Commissariat 19ème', commune: 'Yopougon', latitude: 5.3290, longitude: -4.0690, phone: '+225 27 23 45 65 59', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '41', name: 'Pharmacie Nouveau Quartier', address: 'Près Stade Municipal, Groupe Scolaire Schoelcher', commune: 'Yopougon', latitude: 5.3360, longitude: -4.0760, phone: '+225 27 23 45 03 66', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '42', name: 'Pharmacie Ste Rita de Cascia', address: 'Yopougon Gare (Sable), Trois Caféiers', commune: 'Yopougon', latitude: 5.3180, longitude: -4.0550, phone: '+225 27 23 45 50 79', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '43', name: 'Pharmacie Wassakara', address: 'Yopougon Wassakara (Rue Princesse), près Cité SIB', commune: 'Yopougon', latitude: 5.3500, longitude: -4.0870, phone: '+225 07 57 49 23 01', isOpen: true, isOnDuty: true, rating: 4.6 },

    // ========== ABOBO (10 pharmacies) ==========
    { id: '44', name: 'Nouvelle Pharmacie la Mé', address: 'Abobo La Mé, près du carrefour', commune: 'Abobo', latitude: 5.4250, longitude: -4.0180, phone: '+225 24 39 01 18', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '45', name: 'Pharmacie Azur', address: 'Route du Zoo, Plateau Dokui Azur, carrefour Policier', commune: 'Abobo', latitude: 5.4180, longitude: -4.0250, phone: '+225 27 24 35 00 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '46', name: 'Pharmacie Principale d\'Abobote', address: 'Abobo Abobote, rue principale', commune: 'Abobo', latitude: 5.4200, longitude: -4.0200, phone: '+225 27 24 36 00 00', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '47', name: 'Pharmacie St François Xavier', address: 'Abobo centre, près de l\'église St François', commune: 'Abobo', latitude: 5.4150, longitude: -4.0150, phone: '+225 27 24 37 00 00', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '48', name: 'Pharmacie Abobo Clouetcha', address: 'Abobo Kennedy quartier Clouetcha, carrefour ancienne boulangerie', commune: 'Abobo', latitude: 5.4100, longitude: -4.0100, phone: '+225 27 24 38 00 00', isOpen: true, isOnDuty: false, rating: 4.3 },
    { id: '49', name: 'Pharmacie La Providence', address: 'Abobo Banco, 1er arrêt Sotra, début autoroute Anyama', commune: 'Abobo', latitude: 5.4300, longitude: -4.0350, phone: '+225 27 24 39 00 00', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '50', name: 'Pharmacie du Centre Abobo', address: 'Abobo Avocatier, voie express Anyama, près Hôtel du Centre', commune: 'Abobo', latitude: 5.4220, longitude: -4.0280, phone: '+225 27 24 40 00 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '51', name: 'Pharmacie du Marché Akeikoi', address: 'Abobo Akeikoi, près du grand marché', commune: 'Abobo', latitude: 5.4120, longitude: -4.0120, phone: '+225 27 24 41 00 00', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '52', name: 'Pharmacie du Château', address: 'Abobo Kennedy, quartier du Château', commune: 'Abobo', latitude: 5.4080, longitude: -4.0080, phone: '+225 27 24 42 00 00', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '53', name: 'Pharmacie Plaque Anador', address: 'Abobo Banco sur la voie express, entre Coco Service et Rond Point Banco', commune: 'Abobo', latitude: 5.4280, longitude: -4.0320, phone: '+225 07 12 49 81 38', isOpen: true, isOnDuty: false, rating: 4.5 },

    // ========== MARCORY (9 pharmacies) ==========
    { id: '54', name: 'Pharmacie de La Place Marcory', address: 'Marcory Place, face au marché', commune: 'Marcory', latitude: 5.2980, longitude: -3.9900, phone: '+225 08 65 89 19', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '55', name: 'Nouvelle Pharmacie des Hibiscus', address: 'Marcory Hibiscus, boulevard principal', commune: 'Marcory', latitude: 5.2950, longitude: -3.9880, phone: '+225 21 26 31 66', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '56', name: 'Pharmacie Roma Danoumabo', address: 'Marcory Anoumabo, quartier Roma', commune: 'Marcory', latitude: 5.3020, longitude: -3.9850, phone: '+225 21 28 03 80', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '57', name: 'Pharmacie de la Zone 3', address: 'Marcory Zone 3, avenue principale', commune: 'Marcory', latitude: 5.2900, longitude: -3.9820, phone: '+225 21 35 13 15', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '58', name: 'Pharmacie Marcory PTT', address: 'Marcory PTT, près de la poste', commune: 'Marcory', latitude: 5.3000, longitude: -3.9870, phone: '+225 21 26 98 83', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '59', name: 'Pharmacie TSF', address: 'Marcory TSF, quartier résidentiel', commune: 'Marcory', latitude: 5.2970, longitude: -3.9910, phone: '+225 21 26 78 12', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '60', name: 'Pharmacie Ste Therese', address: 'Marcory Ste Thérèse, près de l\'église', commune: 'Marcory', latitude: 5.2920, longitude: -3.9860, phone: '+225 21 26 77 10', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '61', name: 'Pharmacie du Grand Marché de Marcory', address: 'Marcory Grand Marché, entrée principale', commune: 'Marcory', latitude: 5.2940, longitude: -3.9930, phone: '+225 21 56 90 96', isOpen: false, isOnDuty: false, rating: 4.3 },
    { id: '62', name: 'Pharmacie Dioscoride', address: 'Marcory Zone 4C, rue des commerces', commune: 'Marcory', latitude: 5.2880, longitude: -3.9800, phone: '+225 21 26 00 00', isOpen: true, isOnDuty: true, rating: 4.6 },

    // ========== TREICHVILLE (6 pharmacies) ==========
    { id: '63', name: 'Pharmacie du Rond Point du CHU', address: '40 Bd de Marseille, face BICICI Sud', commune: 'Treichville', latitude: 5.2920, longitude: -4.0100, phone: '+225 21 35 73 03', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '64', name: 'Nouvelle Pharmacie des Quais', address: 'Treichville Quais, près du port', commune: 'Treichville', latitude: 5.2880, longitude: -4.0050, phone: '+225 42 90 00 06', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '65', name: 'Pharmacie du Levant', address: 'Treichville Levant, avenue du marché', commune: 'Treichville', latitude: 5.2900, longitude: -4.0080, phone: '+225 58 45 16 14', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '66', name: 'Pharmacie de l\'Avenue 21', address: 'Carrefour Avenue 21 Rue 21, près bibliothèque Bus 05 et 03', commune: 'Treichville', latitude: 5.2860, longitude: -4.0020, phone: '+225 27 21 24 00 00', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '67', name: 'Pharmacie Nanan Yamousso', address: 'Angle Avenue 13 Rue 38, Treichville centre', commune: 'Treichville', latitude: 5.2940, longitude: -4.0120, phone: '+225 27 21 24 10 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '68', name: 'Pharmacie D\'Arras', address: 'Treichville Arras, quartier historique', commune: 'Treichville', latitude: 5.2850, longitude: -4.0000, phone: '+225 21 24 13 29', isOpen: true, isOnDuty: true, rating: 4.6 },

    // ========== PLATEAU (4 pharmacies) ==========
    { id: '69', name: 'Pharmacie des Finances', address: 'Plateau, Avenue du Trésor, près du Ministère', commune: 'Plateau', latitude: 5.3200, longitude: -4.0200, phone: '+225 20 30 39 50', isOpen: true, isOnDuty: true, rating: 4.8 },
    { id: '70', name: 'Grande Pharmacie du Commerce', address: 'Plateau centre, Avenue du Commerce', commune: 'Plateau', latitude: 5.3180, longitude: -4.0150, phone: '+225 07 01 10 62', isOpen: true, isOnDuty: false, rating: 4.6 },
    { id: '71', name: 'Pharmacie du Plateau', address: 'Plateau, Boulevard de la République, près Cathédrale', commune: 'Plateau', latitude: 5.3220, longitude: -4.0180, phone: '+225 20 21 16 64', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '72', name: 'Pharmacie Saint Lazare', address: 'Plateau, Rue du Commerce, face à la banque', commune: 'Plateau', latitude: 5.3160, longitude: -4.0130, phone: '+225 20 33 12 68', isOpen: false, isOnDuty: false, rating: 4.5 },

    // ========== ADJAMÉ (5 pharmacies) ==========
    { id: '73', name: 'Pharmacie Adjamé Centre', address: 'Adjamé centre, près du grand marché', commune: 'Adjamé', latitude: 5.3550, longitude: -4.0350, phone: '+225 27 20 37 89 01', isOpen: true, isOnDuty: true, rating: 4.5 },
    { id: '74', name: 'Pharmacie Forum d\'Adjamé', address: 'Adjamé Forum des marchés, entrée principale', commune: 'Adjamé', latitude: 5.3500, longitude: -4.0300, phone: '+225 27 20 38 90 12', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '75', name: 'Pharmacie de l\'Indénié', address: 'Adjamé Indénié, avenue principale', commune: 'Adjamé', latitude: 5.3580, longitude: -4.0380, phone: '+225 20 21 17 90', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '76', name: 'Pharmacie Liberté', address: 'Adjamé Liberté, près gare routière', commune: 'Adjamé', latitude: 5.3520, longitude: -4.0320, phone: '+225 27 20 39 00 00', isOpen: false, isOnDuty: false, rating: 4.3 },
    { id: '77', name: 'Pharmacie 220 Logements', address: 'Adjamé 220 Logements, bloc A', commune: 'Adjamé', latitude: 5.3600, longitude: -4.0400, phone: '+225 27 20 40 00 00', isOpen: true, isOnDuty: false, rating: 4.5 },

    // ========== KOUMASSI (4 pharmacies) ==========
    { id: '78', name: 'Pharmacie Koumassi Centre', address: 'Koumassi centre, avenue principale', commune: 'Koumassi', latitude: 5.2950, longitude: -3.9600, phone: '+225 27 21 35 00 00', isOpen: true, isOnDuty: true, rating: 4.6 },
    { id: '79', name: 'Pharmacie Remblais', address: 'Koumassi Remblais, près du marché', commune: 'Koumassi', latitude: 5.2980, longitude: -3.9650, phone: '+225 27 21 36 00 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '80', name: 'Pharmacie Sicogi Koumassi', address: 'Koumassi Sicogi, près de la cité', commune: 'Koumassi', latitude: 5.2920, longitude: -3.9580, phone: '+225 27 21 37 00 00', isOpen: false, isOnDuty: false, rating: 4.4 },
    { id: '81', name: 'Pharmacie Nord Sud Koumassi', address: 'Koumassi Nord-Sud, carrefour principal', commune: 'Koumassi', latitude: 5.3000, longitude: -3.9700, phone: '+225 27 21 38 00 00', isOpen: true, isOnDuty: true, rating: 4.7 },

    // ========== PORT-BOUËT (3 pharmacies) ==========
    { id: '82', name: 'Pharmacie Vridi', address: 'Port-Bouët Vridi, zone industrielle', commune: 'Port-Bouët', latitude: 5.2550, longitude: -4.0050, phone: '+225 27 21 27 00 00', isOpen: true, isOnDuty: true, rating: 4.5 },
    { id: '83', name: 'Pharmacie Gonzagueville', address: 'Port-Bouët Gonzagueville, avenue de la plage', commune: 'Port-Bouët', latitude: 5.2500, longitude: -3.9980, phone: '+225 27 21 28 00 00', isOpen: true, isOnDuty: false, rating: 4.4 },
    { id: '84', name: 'Pharmacie de l\'Aéroport', address: 'Port-Bouët, près de l\'aéroport Félix Houphouët-Boigny', commune: 'Port-Bouët', latitude: 5.2600, longitude: -3.9350, phone: '+225 27 21 29 00 00', isOpen: true, isOnDuty: true, rating: 4.6 },

    // ========== BINGERVILLE (3 pharmacies) ==========
    { id: '85', name: 'Pharmacie Nissi', address: 'Bingerville Cité Feh Kesse, nouvelle voie goudronnée, 300m après école La Prunelle', commune: 'Bingerville', latitude: 5.3580, longitude: -3.8850, phone: '+225 27 22 40 19 04', isOpen: true, isOnDuty: true, rating: 4.7 },
    { id: '86', name: 'Pharmacie de Bingerville', address: 'Bingerville centre, près de la mairie', commune: 'Bingerville', latitude: 5.3550, longitude: -3.8880, phone: '+225 27 22 40 20 00', isOpen: true, isOnDuty: false, rating: 4.5 },
    { id: '87', name: 'Pharmacie Akouedo Attié', address: 'Bingerville Akouedo Attié, route principale', commune: 'Bingerville', latitude: 5.3620, longitude: -3.8920, phone: '+225 27 22 40 30 00', isOpen: false, isOnDuty: false, rating: 4.4 }
]

export const COMMUNES = ['all', 'Cocody', 'Yopougon', 'Abobo', 'Marcory', 'Treichville', 'Plateau', 'Adjamé', 'Koumassi', 'Port-Bouët', 'Bingerville']
