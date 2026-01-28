@echo off
echo ========================================
echo   Demarrage API Pharmacies de Garde
echo ========================================
echo.

cd "c:\Users\jenra\Downloads\PHARMA-GO_FINALE\DOSSIER_TECH_pharma\doc_pharcie de garde"

echo Verification de Python...
python --version
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe ou pas dans le PATH
    pause
    exit /b 1
)

echo.
echo Installation des dependances...
pip install -q flask flask-cors requests beautifulsoup4 selenium lxml

echo.
echo ========================================
echo   Demarrage de l'API sur le port 5000
echo ========================================
echo.
echo API disponible sur: http://localhost:5000
echo.
echo Endpoints:
echo   - GET  /api/pharmacies
echo   - GET  /api/pharmacies/^<commune^>
echo   - GET  /api/pharmacies/search
echo   - POST /api/pharmacies/nearest
echo   - GET  /api/communes
echo   - POST /api/sync
echo   - GET  /api/stats
echo   - GET  /api/health
echo.
echo Appuyez sur Ctrl+C pour arreter l'API
echo ========================================
echo.

python pharmacie_api.py
