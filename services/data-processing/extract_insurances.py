import openpyxl
import json
import os

files = [
    r"DOSSIER_TECH_pharma\Assurances_Partenaires_Polyclinique_Farah.xlsx",
    r"DOSSIER_TECH_pharma\assurances_sante_entreprises_publiques_ci.xlsx",
    r"DOSSIER_TECH_pharma\Assurances_Sante_Cote_Ivoire_Complet.xlsx"
]

insurances = set()

for file_path in files:
    full_path = os.path.join(r"c:\Users\jenra\Downloads\PHARMA-GO_FINALE", file_path)
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        continue
    
    try:
        wb = openpyxl.load_workbook(full_path, data_only=True)
        for sheet in wb.worksheets:
            for row in sheet.iter_rows(values_only=True):
                for cell in row:
                    if cell and isinstance(cell, str) and len(cell.strip()) > 3:
                        # This is a very broad search, we might need to refine based on column headers
                        # But for now let's just collect strings that look like company names
                        val = cell.strip()
                        if any(keyword in val.upper() for keyword in ["ASSURANCE", "SA", "CI", "MUTUELLE", "GROUP", "ASCOMA", "NSIA", "SAHAM", "SUNU", "AXA", "GNA", "MCI"]):
                            insurances.add(val)
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

# Save to JSON
output_path = r"c:\Users\jenra\Downloads\PHARMA-GO_FINALE\pharma-go-express-main\src\data\insurances.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(sorted(list(insurances)), f, ensure_ascii=False, indent=2)

print(f"Extracted {len(insurances)} insurances to {output_path}")
