import dynamic from 'next/dynamic';

export const generateValuesPDF = async (values: { content: string }[], userName?: string) => {
  const { jsPDF } = await import('jspdf');
  
  // Create PDF with slightly larger margins
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Add custom font (using default fonts that look clean)
  pdf.setFont("helvetica", "bold");

  // Add header section with background - make it slightly taller for subtitle
  pdf.setFillColor(17, 24, 39); // bg-gray-900
  pdf.rect(0, 0, 210, 45, 'F');
  
  // Add main title
  pdf.setFontSize(32);
  pdf.setTextColor(255, 255, 255);
  pdf.text('My Top Priorities', 20, 25);

  // Add subtitle
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14);
  pdf.setTextColor(156, 163, 175); // text-gray-400
  pdf.text('What I Value Most in Life', 20, 35);

  // Add date in header
  pdf.setFontSize(12);
  const date = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(date, 20, 42);

  // Add user info if available
  if (userName) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(14);
    pdf.setTextColor(107, 114, 128); // text-gray-500
    pdf.text(`Created by ${userName}`, 20, 60); // Adjusted position to account for taller header
  }

  // Add values with modern styling
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(17, 24, 39); // text-gray-900
  values.forEach((value, index) => {
    const yPosition = 80 + (index * 15); // Adjusted starting position
    
    // Add number circle
    pdf.setFillColor(17, 24, 39);
    pdf.circle(25, yPosition - 2, 3, 'F');
    
    // Add value text
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(17, 24, 39);
    pdf.text(`${value.content}`, 35, yPosition);
  });

  // Add footer
  const footerY = 280;
  
  // Add line above footer
  pdf.setDrawColor(229, 231, 235); // border-gray-200
  pdf.line(20, footerY - 10, 190, footerY - 10);
  
  // Add footer text
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128); // text-gray-500
  pdf.text('Values Prioritization App', 20, footerY);
  
  // Add page number
  pdf.text('Page 1 of 1', 170, footerY);

  // Save the PDF
  pdf.save('my-top-values.pdf');
}; 