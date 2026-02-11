import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Medicine {
  id: number
  name: string
  category: string
  price: number
  rating: number
  inStock: boolean
  prescription: boolean
  image: string
  images?: string[]
  description?: string
  composition?: string
  dosage?: string
  sideEffects?: string[]
  manufacturer?: string
}

export const exportComparisonToPDF = (medicines: Medicine[]) => {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(20)
  doc.setTextColor(34, 197, 94) // Green color
  doc.text('Comparaison de Médicaments', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, 105, 28, { align: 'center' })
  doc.text(`Nombre de médicaments: ${medicines.length}`, 105, 34, { align: 'center' })
  
  let yPosition = 45

  // General Information Table
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('Informations Générales', 14, yPosition)
  yPosition += 5

  const generalData = medicines.map(med => [
    med.name,
    med.category,
    `${med.price.toLocaleString()} FCFA`,
    med.inStock ? 'En stock' : 'Rupture',
    med.prescription ? 'Oui' : 'Non',
    med.rating.toString()
  ])

  autoTable(doc, {
    startY: yPosition,
    head: [['Nom', 'Catégorie', 'Prix', 'Stock', 'Ordonnance', 'Note']],
    body: generalData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 35 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 20 }
    }
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // Description Section
  if (medicines.some(med => med.description)) {
    doc.setFontSize(14)
    doc.text('Descriptions', 14, yPosition)
    yPosition += 5

    const descriptionData = medicines.map(med => [
      med.name,
      med.description || 'Non spécifié'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Médicament', 'Description']],
      body: descriptionData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Composition Section
  if (medicines.some(med => med.composition)) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.text('Compositions', 14, yPosition)
    yPosition += 5

    const compositionData = medicines.map(med => [
      med.name,
      med.composition || 'Non spécifié'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Médicament', 'Composition']],
      body: compositionData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Dosage Section
  if (medicines.some(med => med.dosage)) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.text('Posologies', 14, yPosition)
    yPosition += 5

    const dosageData = medicines.map(med => [
      med.name,
      med.dosage || 'Non spécifié'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Médicament', 'Posologie']],
      body: dosageData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Side Effects Section
  if (medicines.some(med => med.sideEffects && med.sideEffects.length > 0)) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(217, 119, 6) // Amber color
    doc.text('Effets Secondaires Possibles', 14, yPosition)
    doc.setTextColor(0, 0, 0)
    yPosition += 5

    const sideEffectsData = medicines.map(med => [
      med.name,
      med.sideEffects && med.sideEffects.length > 0
        ? med.sideEffects.map((effect, idx) => `${idx + 1}. ${effect}`).join('\n')
        : 'Non spécifié'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Médicament', 'Effets Secondaires']],
      body: sideEffectsData,
      theme: 'grid',
      headStyles: { fillColor: [217, 119, 6], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    })

    yPosition = (doc as any).lastAutoTable.finalY + 10
  }

  // Manufacturer Section
  if (medicines.some(med => med.manufacturer)) {
    // Check if we need a new page
    if (yPosition > 250) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.text('Fabricants', 14, yPosition)
    yPosition += 5

    const manufacturerData = medicines.map(med => [
      med.name,
      med.manufacturer || 'Non spécifié'
    ])

    autoTable(doc, {
      startY: yPosition,
      head: [['Médicament', 'Fabricant']],
      body: manufacturerData,
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 130 }
      }
    })
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Comparaison générée le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      105,
      285,
      { align: 'center' }
    )
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      290,
      { align: 'center' }
    )
    doc.text(
      'Document informatif - Consultez toujours votre médecin ou pharmacien',
      105,
      280,
      { align: 'center' }
    )
  }

  // Save the PDF
  const fileName = `comparaison-medicaments-${new Date().getTime()}.pdf`
  doc.save(fileName)
}
