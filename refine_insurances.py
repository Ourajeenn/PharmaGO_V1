import json
import os

# Original list from the first pass
raw_list = [
  "4. Mutuelles d'entreprise", "6. MUGEF-CI", "7. Assurances privées", "ACTIVA ASSURANCE", "ADCI", "AITEK SA", "AMAT-CI",
  "AMSA ASSURANCES CÔTE D'IVOIRE", "ASCOMA", "ASCOMA CÔTE D'IVOIRE", "ASSOCIATION SUSU", "ASSURANCES INTERNATIONALES",
  "ATLANTA ASSURANCES", "ATLANTIQUE ASSURANCES", "ATLAS ASSURANCES", "AXA COTE D'IVOIRE", "AXA CÔTE D'IVOIRE",
  "AXA Côte d'Ivoire", "Agbaou Gold Operations SA", "Agence de Gestion Foncière", "Agents de Santé", "Assistance santé",
  "Association mutualiste", "Assurance IARD", "Assurance Maladie / Mutuelle", "Assurance Maladie des Retraités",
  "Assurance Maladie à la Retraite", "Assurance internationale", "Assurance locale", "Assurance santé",
  "Assurance santé (Prévoyance Santé AXA)", "Assurance santé groupe et individuelle", "Assurance santé internationale",
  "Assurance santé internationale expatriés", "Assurance santé pour la diaspora (startup française)", "Assurance santé vie",
  "Assurance voyage et expatriés", "Assurances et Mutuelles internationales", "Assurances et Mutuelles locales",
  "Assurances internationales", "BANQUE ATLANTIQUE ASSURANCE CI", "BHCI", "BIL ASSURANCE", "BRMCI (Banque Régionale de Marché)",
  "C.I.M.E.F ASSURANCE", "CI-ENERGIES", "CI-ENGINEERING", "CI-PME", "CIDT", "CIGNA", "CIPREL", "CMU + Assurance privée",
  "CNAM (Caisse Nationale d'Assurance Maladie)", "CNPS (Caisse Nationale de Prévoyance Sociale)", "COMAR ASSURANCES",
  "COMMISSAIRE BANCAIRE", "COMPAGNIES D'ASSURANCE LOCALES", "Caisse Nationale d'Assurance Maladie - Institution qui gère la CMU",
  "Caisse Nationale de Prévoyance Sociale", "Compagnie Ivoirienne d'Électricité", "Compagnie Ivoirienne de Production d'Electricité",
  "Compagnies d'assurance locales", "DIASS LES FORCES FRANCAISES EN CI", "DTPCI", "EC VITALIS ASSURANCES", "EDIPRESSE SARL",
  "EIFFAGE GENIE CIVIL", "EIFFAGE INFRASTRUCTURE CI", "GESTOCI", "GGA ASSURANCES", "GLOBAL ENERGY VENTURES SARL",
  "GNA ASSURANCES (Génération Nouvelle d'Assurances)", "GUCE-CI", "HENNER SANTE", "HENNER SANTÉ", "HUAWEI TECHNOLOGIE CI",
  "Henner Santé", "IMA (Inter Mutuelles Assistance)", "IMMSA", "INTER MUTUELLES ASSISTANCE GIE (IMA)", "IVOIRE SANTE PLUS",
  "IVOIRE SANTÉ PLUS", "L'AFRICAINE DES ASSURANCES (2ACI)", "LA LOYALE ASSURANCES", "LAFARGE HOLCIM CI", "LEADWAY ASSURANCES",
  "LONACI", "MADGI (Mutuelle des Agents de la Direction Générale des Impôts)", "MCI CARE", "MCI Care", "MEDECINS SANS FRONTIERES",
  "MENET SANTÉ", "MSPCI", "MU2SCIE-SODECI", "MUDCI", "MUGASCI", "MUGASCI (Mutuelle Générale des Agents de Santé)",
  "MUGEF-CI", "MUGEF-CI (Mutuelle Générale des Fonctionnaires et Agents de l'État)", "MUSACNRA", "MUSAPALM",
  "MUSAPALM (Mutuelle Santé des Agents de PALMAFRIQUE)", "MUSCOP-CI (Mutuelle du Corps Préfectoral)", "MUTUELLE SOCIALE SANTÉ CIE",
  "MUTUELLE SOCIALE TRANSVIE", "MUTUELLES", "Mutuelle CIE", "Mutuelle Générale des Agents de Santé de Côte d'Ivoire",
  "Mutuelle Générale des Fonctionnaires et agents de l'État", "Mutuelle SODECI", "Mutuelle Santé des Agents de PALMAFRIQUE",
  "Mutuelle Santé des professionnels des médias", "Mutuelle Sociale Santé CIE", "Mutuelle Sociale Santé SODECI",
  "Mutuelle agricole", "Mutuelle corps préfectoral", "Mutuelle d'assurance", "Mutuelle d'entreprise", "Mutuelle des Agents de CNPS",
  "Mutuelle des Agents de l'Eau et de l'Électricité", "Mutuelle des Agents de la Direction Générale des Impôts",
  "Mutuelle des Douanes de CI", "Mutuelle des Personnels du Ministère de l'Education", "Mutuelle des personnels du Ministère de l'Éducation Nationale",
  "Mutuelle des professionnels des médias", "Mutuelle fonctionnaires", "Mutuelle impôts", "Mutuelle maritime", "Mutuelle militaire",
  "Mutuelle médias", "Mutuelle police", "Mutuelle professionnelle", "Mutuelle santé", "Mutuelle sectorielle", "Mutuelle éducation",
  "Mutuelle épargne/crédit", "Mutuelles", "MÉDECINS SANS FRONTIÈRES", "NOUVELLE SOCIETE INTERAFRICAINE ASSURANCES DE COTE D'IVOIRE (NSIA-CI)",
  "NOVELIA ASSURANCES", "NOVELIA Assurances", "NSIA Assurances", "NSIA BANQUE", "NSIA CÔTE D'IVOIRE", "Nouvelle Société Interafricaine d'Assurances",
  "O.M.S (Organisation Mondiale de la Santé)", "OLEA SANTE", "OLEA SANTÉ", "OLEA Santé", "PETROCI HOLDING", "PMCI",
  "PMCI", "PROGRAMME NATIONAL DE COHÉSION SOCIALE", "Port Autonome de San-Pedro", "Roxgold Sango", "SAAR ASSURANCES",
  "SAIPEM", "SANLAM (ex-SAHAM)", "SCHIBA ASSURANCES", "SERENITY SA", "SIDAM (Société Internationale d'Assurances Multirisques)",
  "SNPECI", "SOCIETE IVOIRIENNE DE RAFFINAGE (SIR)", "SOCITA", "SODECI", "SONAM ASSURANCES", "STANE ASSURANCES",
  "SUNU ASSURANCES", "SUNU ASSURANCES VIE", "SUNU Assurances", "Société Commerciale d'Assurances", "Société Concessionnaire du Pont Riviéra - Marcory",
  "Société International de Transport Africain par RAIL", "Société Ivoirienne d'Abattage et de charcuterie", "Société Ivoirienne de Banque",
  "Société Ivoirienne de Fabrication de Lubrifiant", "Société Ivoirienne de Raffinage", "Société Ivoirienne de Technologie Tropicale",
  "Société Ivoirienne de Télédiffusion", "Société Ivoirienne de gestion du Patrimoine Ferroviaire", "Société Minière de Lafigué",
  "Société Minière de Lobo", "Société Nationale Ivoirienne de Travaux", "Société Nationale de Développement Informatique",
  "Société Nouvelle de Presse et d'Edition", "Société d'Exploitation du Marché de Gros de Bouaké", "Société d'Exploitation et de Développement Aéroportuaire",
  "Société de Développement des Forêts", "Société de Forage Minier", "Société de Garantie des Crédits aux PME", "Société de Gestion des Stocks Pétroliers",
  "Société de Gestion du Grand Marché de Treichville", "Société de gestion et de développement des infrastructures", "Société de transformation Agricole",
  "Société des Mines d'Ity", "Société des Mines de Daapleu", "Société des Mines de Floleu", "Société des Mines de Tongon SA",
  "Société des Transports Abidjanais", "Société nationale de Gestion du patrimoine immobilier", "Société pour le Développement Minier",
  "T.S.P (Terminal de San Pedro)", "TCI AFRICA", "TONGON SA", "TRCI", "VITIB SA", "VIVO ENERGY-CI", "Vitalis Santé",
  "WAFA ASSURANCE", "WILLIS TOWERS WATSON EX GRAS SAVOYE"
]

keywords = ["ASSURANCE", "MUTUELLE", "SANTE", "CAISSE", "NSIA", "AXA", "SUNU", "SANLAM", "ASCOMA", "MCI", "MUGEF", "CNPS", "CNAM", "HENNER", "GNA", "SAHAM"]
exclude_lower_case_only = True

def is_valid_insurance(name):
    u_name = name.upper()
    # If it's too long, it's likely a sentence
    if len(name) > 60: return False
    # If it contains numbers at the start, it's a list item
    if name[0].isdigit(): return False
    # Check if it has any keyword
    if any(k in u_name for k in keywords):
        # Exclude generic descriptors
        if u_name in ["ASSURANCE", "MUTUELLE", "MUTUELLES", "ASSURANCES ET MUTUELLES LOCALES", "ASSURANCES ET MUTUELLES INTERNATIONALES", "ASSURANCES INTERNATIONALES"]:
            return False
        return True
    # If it's mostly uppercase and short, it could be an acronym/name
    if len(name) < 15 and name.isupper():
        return True
    return False

filtered = [n for n in raw_list if is_valid_insurance(n)]

# De-duplicate names that are similar (e.g. AXA COTE D'IVOIRE vs AXA CÔTE D'IVOIRE)
# This is a bit tricky, but let's just do a simple normalize
normalized = {}
for n in filtered:
    key = n.upper().replace("Ô", "O").replace("É", "E").replace("È", "E").replace("-", " ").strip()
    if key not in normalized or len(n) < len(normalized[key]): # Prefer shorter/canonical names if possible or just first found
        normalized[key] = n

final_list = sorted(list(normalized.values()))

# Save to JSON
output_path = r"c:\Users\jenra\Downloads\PHARMA-GO_FINALE\pharma-go-express-main\src\data\insurances.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_list, f, ensure_ascii=False, indent=2)

print(f"Refined to {len(final_list)} insurances")
