import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface Value {
  content: string;
  id?: string;
  isHighlighted?: boolean;
}

export async function generateValuesPDF(values: Value[], listName: string = 'My Priority List'): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    })

    // Add title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(33, 33, 33)
    pdf.text(listName, 40, 40)

    // Add timestamp
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(128, 128, 128)
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 40, 60)

    // Add values
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(33, 33, 33)
    
    let yOffset = 100
    values.forEach((value, index) => {
      if (yOffset > pdf.internal.pageSize.height - 40) {
        pdf.addPage()
        yOffset = 40
      }
      
      const number = (index + 1).toString().padStart(2, '0')
      pdf.text(`${number}. ${value.content}`, 40, yOffset)
      yOffset += 25
    })

    // Add footer
    const pageCount = (pdf as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.width - 100,
        pdf.internal.pageSize.height - 30
      )
    }

    // Generate a filename based on the list name
    const filename = listName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'priority-list'
    pdf.save(`${filename}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
}

export async function generatePDF(title: string, content: HTMLElement): Promise<void> {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    })

    // Add title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(33, 33, 33)
    pdf.text(title, 40, 40)

    // Add description section
    const description = content.querySelector('p')?.textContent
    if (description) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(75, 75, 75)
      const splitDescription = pdf.splitTextToSize(description, pdf.internal.pageSize.width - 80)
      pdf.text(splitDescription, 40, 70)
    }

    let yOffset = 100

    // Process sections
    const sections = content.querySelectorAll('h3, h4, ul')
    sections.forEach((section) => {
      if (section.tagName === 'H3') {
        // Main section headers
        if (yOffset > pdf.internal.pageSize.height - 60) {
          pdf.addPage()
          yOffset = 40
        }
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(33, 33, 33)
        pdf.text(section.textContent || '', 40, yOffset)
        yOffset += 25
      } else if (section.tagName === 'H4') {
        // Subsection headers
        if (yOffset > pdf.internal.pageSize.height - 60) {
          pdf.addPage()
          yOffset = 40
        }
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(66, 66, 66)
        pdf.text(section.textContent || '', 40, yOffset)
        yOffset += 20
      } else if (section.tagName === 'UL') {
        // List items
        const items = section.querySelectorAll('li')
        items.forEach((item) => {
          if (yOffset > pdf.internal.pageSize.height - 40) {
            pdf.addPage()
            yOffset = 40
          }
          pdf.setFontSize(12)
          pdf.setFont('helvetica', 'normal')
          pdf.setTextColor(75, 75, 75)
          const bulletPoint = '•'
          pdf.text(bulletPoint, 40, yOffset)
          const itemText = item.textContent?.replace('•', '').trim() || ''
          const splitText = pdf.splitTextToSize(itemText, pdf.internal.pageSize.width - 100)
          pdf.text(splitText, 55, yOffset)
          yOffset += (splitText.length * 15) + 5
        })
      }
    })

    // Add footer
    const pageCount = (pdf as any).internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setTextColor(128, 128, 128)
      pdf.text(
        `Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.width - 100,
        pdf.internal.pageSize.height - 30
      )
    }

    pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-guide.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw error
  }
} 