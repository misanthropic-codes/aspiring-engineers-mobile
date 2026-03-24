/**
 * Utility to detect if a string contains LaTeX content.
 * Looks for:
 * - TipTap math-block divs (data-latex)
 * - Standard LaTeX delimiters ($...$ for inline, $$...$$ for display)
 */
export const hasLatex = (text: string | null | undefined): boolean => {
  if (!text) return false;
  return /<div[^>]*data-latex/i.test(text) || /\$[\s\S]+?\$/.test(text);
};
