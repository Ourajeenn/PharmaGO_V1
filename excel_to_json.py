import openpyxl
import json
import os

def excel_to_json(excel_path, json_path):
    print(f"Converting {excel_path} to {json_path}...")
    try:
        wb = openpyxl.load_workbook(excel_path)
        sheet = wb.active
        
        data = []
        headers = [cell.value for cell in sheet[1]]
        
        for row in sheet.iter_rows(min_row=2, values_only=True):
            entry = {}
            for i, value in enumerate(row):
                if i < len(headers):
                    header = headers[i]
                    if header:
                        entry[header] = value
            data.append(entry)
            
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"Successfully converted {len(data)} rows.")
    except Exception as e:
        print(f"Error converting {excel_path}: {e}")

# File mappings
base_dir = "DOSSIER_TECH_pharma"
output_dir = os.path.join("pharma-go-express-main", "src", "data")

mappings = [
    ("Assurances_Partenaires_Polyclinique_Farah.xlsx", "assurances_partenaires.json"),
    ("Assurances_Sante_Cote_Ivoire_Complet.xlsx", "assurances_sante_ci.json"),
    ("assurances_sante_entreprises_publiques_ci.xlsx", "assurances_sante_entreprises.json")
]

for excel_file, json_file in mappings:
    excel_path = os.path.join(base_dir, excel_file)
    json_path = os.path.join(output_dir, json_file)
    excel_to_json(excel_path, json_path)
