// Convert "(1)" or "(1, 2, 3)" style references to clickable footnotes
export const processFootnotes = (text) => {
  // Replace (n) or (n, m, p) with superscript links
  const processedText = text.replace(/\((\d+(?:,\s*\d+)*)\)/g, (match, numbers) => {
    // Split the numbers and create a link for each
    const footnotes = numbers.split(',').map(num => {
      const trimmedNum = num.trim();
      return `<sup><a href="#footnote-${trimmedNum}" class="footnote-link">${trimmedNum}</a></sup>`;
    });
    
    // Join the footnotes with a small space between them
    return footnotes.join('');
  });

  // Wrap in a div to allow HTML rendering
  return processedText;
}; 