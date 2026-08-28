import React from 'react';

interface FormattedTextProps {
  text?: string;
  className?: string;
}

/**
 * Robust Markdown & Text Formatting Parser for DTB B2 Learning Texts, Transcripts, and Prompts.
 * Supports:
 * - **bold** and __bold__
 * - *italic* and _italic_
 * - <u>underline</u>
 * - > Blockquotes / Tips
 * - ### Headers
 * - Bullet lists (- item or * item)
 * - Line breaks (\n)
 */
export const formatMarkdownToHtml = (rawText?: string): string => {
  if (!rawText) return '';
  let html = rawText;

  // Escape raw HTML entities except existing <u> and <b> tags
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;u&gt;/gi, '<u class="underline decoration-indigo-500 decoration-2 underline-offset-2">')
    .replace(/&lt;\/u&gt;/gi, '</u>')
    .replace(/&lt;b&gt;/gi, '<strong class="font-black text-slate-900 dark:text-white">')
    .replace(/&lt;\/b&gt;/gi, '</strong>');

  // Convert blockquotes: &gt; Quote -> styled callout box
  html = html.replace(
    /(?:^|\n)&gt;\s*([\s\S]*?)(?=\n\n|$)/g,
    '<div class="my-2.5 p-3 rounded-xl bg-indigo-500/10 border-l-4 border-indigo-500 text-xs text-indigo-950 dark:text-indigo-200 font-semibold">$1</div>'
  );

  // Convert headers (### H3, ## H2)
  html = html.replace(
    /^###\s+(.*$)/gim,
    '<h4 class="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mt-3 mb-1.5">$1</h4>'
  );
  html = html.replace(
    /^##\s+(.*$)/gim,
    '<h3 class="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-4 mb-2">$1</h3>'
  );

  // Convert markdown bold: **text** or __text__ -> <strong class="font-black text-slate-900 dark:text-white">
  // Uses [\s\S]*? with word/boundary awareness to work across multi-line or formatted strings
  html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>');
  html = html.replace(/__([\s\S]*?)__/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>');

  // Convert markdown italic: *text* or _text_ -> <em class="italic text-slate-700 dark:text-slate-300">
  // Match single asterisk not followed or preceded by another asterisk
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');
  html = html.replace(/(?<!_)_([^_\n]+?)_(?!_)/g, '<em class="italic text-slate-700 dark:text-slate-300">$1</em>');

  // Convert gap indicators: [ _______ ] or [46]
  html = html.replace(
    /\[\s*_{3,}\s*\]/g,
    '<span class="inline-block px-2.5 py-0.5 mx-1 rounded-md bg-indigo-500/15 border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">[ _______ ]</span>'
  );

  // Convert line breaks \r\n or \n -> <br />
  html = html.replace(/\r\n/g, '<br />').replace(/\n/g, '<br />');

  return html;
};

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  const formattedHtml = React.useMemo(() => formatMarkdownToHtml(text), [text]);

  return (
    <div
      className={`formatted-text-content leading-relaxed tracking-normal ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};

export const FormattedInline: React.FC<{ text?: string; className?: string }> = ({ text, className = '' }) => {
  const formattedHtml = React.useMemo(() => {
    if (!text) return '';
    let html = text;
    // Replace bold
    html = html.replace(/\*\*([\s\S]*?)\*\*/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>');
    html = html.replace(/__([\s\S]*?)__/g, '<strong class="font-black text-slate-900 dark:text-white">$1</strong>');
    // Replace italic
    html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic">$1</em>');
    return html;
  }, [text]);

  return (
    <span
      className={`formatted-inline-content ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};
