import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../../contexts/ThemeContext';

interface MathRendererProps {
  content: string;
  baseSize?: number;
  style?: any;
}

/**
 * MathRenderer for Mobile
 * Uses WebView + KaTeX to render complex math and HTML content.
 * Matches web client rendering logic.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ 
  content, 
  baseSize = 15,
  style 
}) => {
  const { isDark, colors } = useTheme();
  const [webViewHeight, setWebViewHeight] = useState(40);

  if (!content) return null;

  // KaTeX CSS and JS CDN links
  const KATEX_CSS = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
  const KATEX_JS = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js';
  const KATEX_AUTO_RENDER = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="${KATEX_CSS}">
        <style>
          body {
            font-family: -apple-system, system-ui;
            font-size: ${baseSize}px;
            color: ${colors.textPrimary};
            margin: 0;
            padding: 0;
            background-color: transparent;
            overflow: hidden;
          }
          .content-wrapper {
            padding: 2px 0;
          }
          p { margin: 0 0 8px 0; }
          p:last-child { margin-bottom: 0; }
          strong { font-weight: 600; }
          img { max-width: 100%; height: auto; }
          
          /* KaTeX styling */
          .katex-display { margin: 8px 0; overflow-x: auto; overflow-y: hidden; }
          .katex { font-size: 1.1em; }
        </style>
      </head>
      <body>
        <div id="content" class="content-wrapper">${content}</div>
        <script src="${KATEX_JS}"></script>
        <script src="${KATEX_AUTO_RENDER}"></script>
        <script>
          function renderMath() {
            const contentDiv = document.getElementById('content');
            
            // Process TipTap math blocks first
            const mathBlocks = contentDiv.querySelectorAll('div[data-type="math-block"]');
            mathBlocks.forEach(block => {
              const latex = block.getAttribute('data-latex');
              if (latex) {
                try {
                  const span = document.createElement('span');
                  katex.render(latex, span, { displayMode: true, throwOnError: false });
                  block.innerHTML = '';
                  block.appendChild(span);
                } catch (e) { console.error(e); }
              }
            });

            // Auto-render other delimiters like $ and $$
            renderMathInElement(contentDiv, {
              delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
              ],
              throwOnError: false
            });

            // Send height back to React Native
            setTimeout(() => {
              const height = document.documentElement.scrollHeight || document.body.scrollHeight;
              window.ReactNativeWebView.postMessage(JSON.stringify({ height }));
            }, 100);
          }

          window.onload = renderMath;
        </script>
      </body>
    </html>
  `;

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setWebViewHeight(data.height);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  return (
    <View style={[styles.container, { height: webViewHeight }, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        scrollEnabled={false}
        onMessage={onMessage}
        style={styles.webview}
        containerStyle={styles.webviewContainer}
        transparent={true}
        javaScriptEnabled={true}
        scalesPageToFit={Platform.OS === 'android'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  webview: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  webviewContainer: {
    backgroundColor: 'transparent',
  }
});
