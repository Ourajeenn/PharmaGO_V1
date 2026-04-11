// jsPDF loaded dynamically — see loadJsPDF() below
import type { UserOptions } from 'jspdf-autotable';
import type jsPDF from 'jspdf';
import { Order } from '@/components/ecarnet/OrderHistory';
import { Patient, PatientSummary } from '@/types/ecarnet';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Extend jsPDF with autotable (used as type only)
interface jsPDFWithAutoTable {
    autoTable: (options: UserOptions) => any;
    [key: string]: any;
}

export class PDFService {
    private static brandColor = [16, 185, 129]; // #10B981 (PharmaGo Emerald)

    /** Dynamic loader — jsPDF + autotable only fetched on demand */
    private static async loadJsPDF() {
        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable');
        return jsPDF;
    }

    private static addHeader(doc: any, title: string) {
        const pageWidth = doc.internal.pageSize.getWidth();

        // Brand Bar
        doc.setFillColor(this.brandColor[0], this.brandColor[1], this.brandColor[2]);
        doc.rect(0, 0, pageWidth, 25, 'F');

        // Logo Text (PharmaGo)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('PharmaGo Express', 14, 16);

        // Document Title
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(title.toUpperCase(), pageWidth - 14, 16, { align: 'right' });
    }

    private static addFooter(doc: any) {
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setDrawColor(200, 200, 200);
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Document généré par PharmaGo Express - Votre santé, notre priorité.', 14, pageHeight - 14);
        doc.text(`Page 1`, pageWidth - 14, pageHeight - 14, { align: 'right' });
    }

    /**
     * Generate an official receipt for a pharmacy order
     */
    static async generateOrderReceipt(order: Order, patient?: Patient) {
        const JsPDF = await this.loadJsPDF();
        const doc = new JsPDF() as unknown as jsPDFWithAutoTable;
        this.addHeader(doc, 'REÇU DE COMMANDE');

        // Order Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`N° Commande : ${order.id}`, 14, 40);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date : ${order.date}`, 14, 47);
        doc.text(`Pharmacie : ${order.pharmacy}`, 14, 52);

        // Patient Info
        if (patient) {
            doc.setFont('helvetica', 'bold');
            doc.text('PROFIL PATIENT', 140, 40);
            doc.setFont('helvetica', 'normal');
            doc.text(`${patient.firstName} ${patient.lastName}`, 140, 47);
            doc.text(`${patient.phone || ''}`, 140, 52);
        }

        doc.line(14, 60, 196, 60);

        // Items Table
        const tableData = order.items.map(item => [
            item.name,
            item.quantity.toString(),
            'N/A', // Unit price not available in current Order type
            `${order.total.toLocaleString()} FCFA`
        ]);

        doc.autoTable({
            startY: 70,
            head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: this.brandColor as [number, number, number] },
            styles: { fontSize: 9 },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'center' },
                2: { halign: 'right' },
                3: { halign: 'right', fontStyle: 'bold' }
            }
        });

        // Final Total
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`TOTAL À PAYER : ${order.total.toLocaleString()} FCFA`, 196, finalY, { align: 'right' });

        this.addFooter(doc);
        doc.save(`Recu_${order.id}.pdf`);
    }

    /**
     * Generate a comprehensive medical summary for the patient
     */
    static async generateMedicalReport(summary: PatientSummary) {
        const JsPDF = await this.loadJsPDF();
        const doc = new JsPDF() as unknown as jsPDFWithAutoTable;
        this.addHeader(doc, 'BILAN DE SANTÉ E-CARNET');

        const { patient } = summary;

        // Patient identity
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(`${patient.firstName} ${patient.lastName}`, 14, 40);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Né(e) le : ${format(new Date(patient.dateOfBirth), 'dd MMMM yyyy', { locale: fr })}`, 14, 47);
        doc.text(`Groupe Sanguin : ${patient.bloodGroup}`, 14, 52);
        doc.text(`Lien de parenté : ${patient.relationship || 'Moi'}`, 14, 57);

        // Stats boxes
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(14, 65, 55, 20, 3, 3, 'F');
        doc.roundedRect(77, 65, 55, 20, 3, 3, 'F');
        doc.roundedRect(141, 65, 55, 20, 3, 3, 'F');

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('VACCINS', 17, 72);
        doc.text('VISITES', 80, 72);
        doc.text('ALERTE', 144, 72);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text(summary.totalVaccinations.toString(), 17, 80);
        doc.text(summary.totalVisits.toString(), 80, 80);
        doc.text(summary.activeAlerts.length.toString(), 144, 80);

        // Vaccination Table
        doc.setFontSize(12);
        doc.text('HISTORIQUE DES VACCINATIONS', 14, 100);

        const vaxData = summary.patient.vaccinations?.map(v => [
            v.vaccineName,
            v.disease,
            format(new Date(v.administrationDate), 'dd/MM/yyyy'),
            v.status
        ]) || [];

        doc.autoTable({
            startY: 105,
            head: [['Vaccin', 'Maladie', 'Date', 'Statut']],
            body: vaxData.length > 0 ? vaxData : [['Aucun vaccin enregistré', '', '', '']],
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] } // Blue
        });

        // Alerts Table if any
        if (summary.activeAlerts.length > 0) {
            const nextY = (doc as any).lastAutoTable.finalY + 15;
            doc.text('ALERTES SANTÉ ACTIVES', 14, nextY);

            const alertData = summary.activeAlerts.map(a => [
                a.title,
                a.message,
                a.priority
            ]);

            doc.autoTable({
                startY: nextY + 5,
                head: [['Titre', 'Description', 'Priorité']],
                body: alertData,
                theme: 'striped',
                headStyles: { fillColor: [239, 68, 68] } // Red
            });
        }

        this.addFooter(doc);
        doc.save(`Bilan_Sante_${patient.lastName}_${patient.firstName}.pdf`);
    }
}
