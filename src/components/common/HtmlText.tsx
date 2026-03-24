import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface HtmlTextProps {
  html: string;
  style?: StyleProp<TextStyle>;
  baseSize?: number;
}

/**
 * Lightweight HTML text renderer for React Native.
 * Parses common TipTap HTML tags (<p>, <strong>, <em>, <sub>, <sup>, <br>)
 * and renders them as styled Text components.
 *
 * For complex HTML (tables, images, etc.), consider using react-native-render-html.
 */
export const HtmlText: React.FC<HtmlTextProps> = ({ html, style, baseSize = 15 }) => {
  if (!html) return null;

  // Robust string conversion and trimming
  const trimmed = String(html).trim();

  // If no HTML tags at all, render as plain text
  if (!/<[a-z][\s\S]*>/i.test(trimmed)) {
    return <Text style={style} numberOfLines={0}>{trimmed}</Text>;
  }

  // Parse HTML into segments
  const segments = parseHtml(trimmed);

  if (segments.length === 0) {
    return <Text style={style} numberOfLines={0}>{stripTags(trimmed)}</Text>;
  }

  // Split style into layout and text styles
  const flattenedStyle = StyleSheet.flatten(style) || {};
  const containerStyle: ViewStyle = {};
  const textStyle: TextStyle = {};

  const layoutKeys = [
    'flex', 'flexGrow', 'flexShrink', 'width', 'height', 'margin', 
    'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 
    'marginHorizontal', 'marginVertical', 'alignSelf', 'position',
    'top', 'bottom', 'left', 'right', 'zIndex'
  ];

  Object.keys(flattenedStyle).forEach(key => {
    if (layoutKeys.includes(key)) {
      (containerStyle as any)[key] = (flattenedStyle as any)[key];
    } else {
      (textStyle as any)[key] = (flattenedStyle as any)[key];
    }
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {segments.map((segment, index) => (
        <Text key={index} style={[{ fontSize: baseSize }, textStyle]} numberOfLines={0}>
          {segment.parts.map((part, partIdx) => {
            const partStyle: TextStyle = {};
            if (part.bold) partStyle.fontWeight = 'bold';
            if (part.italic) partStyle.fontStyle = 'italic';
            if (part.superscript) {
              partStyle.fontSize = (textStyle.fontSize || baseSize) * 0.7;
              partStyle.lineHeight = (textStyle.fontSize || baseSize);
            }
            if (part.subscript) {
              partStyle.fontSize = (textStyle.fontSize || baseSize) * 0.7;
              partStyle.lineHeight = (textStyle.fontSize || baseSize) * 1.8;
            }

            return (
              <Text key={partIdx} style={partStyle}>
                {part.text}
              </Text>
            );
          })}
        </Text>
      ))}
    </View>
  );
};

// ---- Internal parsing ----

interface TextPart {
  text: string;
  bold?: boolean;
  italic?: boolean;
  superscript?: boolean;
  subscript?: boolean;
}

interface TextSegment {
  parts: TextPart[];
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function parseHtml(html: string): TextSegment[] {
  const segments: TextSegment[] = [];

  // Split by <p> blocks. If no <p> tags, treat entire content as one segment.
  const pBlocks = html.split(/<\/?p[^>]*>/gi).filter(block => block.trim() !== '');

  if (pBlocks.length === 0) {
    const parts = parseInline(html);
    if (parts.length > 0) {
      segments.push({ parts });
    }
    return segments;
  }

  for (const block of pBlocks) {
    const parts = parseInline(block);
    if (parts.length > 0) {
      segments.push({ parts });
    }
  }

  return segments;
}

function parseInline(html: string): TextPart[] {
  const parts: TextPart[] = [];

  // Replace <br> with newlines first
  let content = html.replace(/<br\s*\/?>/gi, '\n');

  // Regex to match inline tags: <strong>, <b>, <em>, <i>, <sup>, <sub>
  const tagRegex = /<(strong|b|em|i|sup|sub)>([\s\S]*?)<\/\1>/gi;

  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    // Text before this tag
    if (match.index > lastIndex) {
      const before = stripTags(content.slice(lastIndex, match.index));
      if (before) {
        parts.push({ text: before });
      }
    }

    const tag = match[1].toLowerCase();
    const innerText = stripTags(match[2]);

    if (innerText) {
      parts.push({
        text: innerText,
        bold: tag === 'strong' || tag === 'b',
        italic: tag === 'em' || tag === 'i',
        superscript: tag === 'sup',
        subscript: tag === 'sub',
      });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last tag
  if (lastIndex < content.length) {
    const remaining = stripTags(content.slice(lastIndex));
    if (remaining) {
      parts.push({ text: remaining });
    }
  }

  return parts;
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
});
