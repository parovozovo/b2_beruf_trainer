import React from 'react';

interface FormattedTextProps {
  text?: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className = '' }) => {
  const formattedHtml = React.useMemo(() => {
    if (!text) return '';
    let html = text;

    // Convert markdown bold **text** or __text__ -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Convert markdown italic *text* or _text_ -> <em>text</em>
    html = html.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

    // Convert line breaks \r\n or \n -> <br />
    html = html.replace(/\r\n/g, '<br />').replace(/\n/g, '<br />');

    return html;
  }, [text]);

  return (
    <div
      className={`formatted-text-content font-serif leading-relaxed tracking-normal ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedHtml }}
    />
  );
};
