/**
 * Template styling configurations for email rendering
 * Matches the frontend template definitions
 */
const TEMPLATE_STYLES = {
  default: {
    id: 'default',
    name: 'Minimalista Premium',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    headerBg: '#ffffff',
    headerGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    headerBorder: 'none',
    textColor: '#0f172a',
    accentColor: '#64748b',
    cardBg: '#ffffff',
    cardBorder: '1px solid #e2e8f0',
    cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
    lineHeight: '1.8'
  },
  modern: {
    id: 'modern',
    name: 'Vanguardia Digital',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    headerBg: 'rgba(255, 255, 255, 0.98)',
    headerGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    headerBorder: 'none',
    textColor: '#1a202c',
    accentColor: '#667eea',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    cardBorder: '1px solid rgba(102, 126, 234, 0.2)',
    cardShadow: '0 20px 25px -5px rgba(102, 126, 234, 0.1)',
    fontFamily: "'Inter', -apple-system, sans-serif",
    lineHeight: '1.7'
  },
  classic: {
    id: 'classic',
    name: 'Elegancia Atemporal',
    background: 'linear-gradient(180deg, #fdfcfb 0%, #f6f3ed 100%)',
    headerBg: '#fdfcfb',
    headerGradient: 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)',
    headerBorder: '3px solid #d4af37',
    textColor: '#5a4a3a',
    accentColor: '#d4af37',
    cardBg: '#fffaf5',
    cardBorder: '2px solid #e8d5c4',
    cardShadow: '0 8px 16px rgba(139, 115, 85, 0.15)',
    fontFamily: "'Georgia', serif",
    lineHeight: '1.9',
    accentGold: '#d4af37'
  },
  professional: {
    id: 'professional',
    name: 'Corporativo Elite',
    background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
    headerBg: '#ffffff',
    headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
    headerBorder: 'none',
    textColor: '#1e293b',
    accentColor: '#3b82f6',
    cardBg: '#ffffff',
    cardBorder: '1px solid #cbd5e1',
    cardShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontFamily: "'Segoe UI', -apple-system, sans-serif",
    lineHeight: '1.75',
    accentLine: '4px solid #3b82f6'
  }
};

/**
 * Get template styles by ID
 * @param templateId - Template ID (default, modern, classic, professional)
 * @returns Template style configuration object
 */
function getTemplateStyles(templateId) {
  return TEMPLATE_STYLES[templateId] || TEMPLATE_STYLES.default;
}

module.exports = {
  TEMPLATE_STYLES,
  getTemplateStyles
};
