import { Document, Paragraph, TextRun, Packer } from 'docx';
import { saveAs } from 'file-saver';

export async function downloadAsWord(content: string): Promise<void> {
  if (!content.trim()) {
    return;
  }

  // Split content by newlines to preserve line breaks
  const lines = content.split('\n');
  
  // Create paragraphs for each line
  const paragraphs = lines.map((line) => {
    // Handle empty lines
    if (line.trim() === '') {
      return new Paragraph({
        children: [new TextRun('')],
      });
    }
    
    return new Paragraph({
      children: [new TextRun(line)],
    });
  });

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  // Generate the blob and download
  const blob = await Packer.toBlob(doc);
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `note-${timestamp}.docx`;
  
  saveAs(blob, filename);
}

