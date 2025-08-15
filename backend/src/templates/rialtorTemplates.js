const config = require('../../config/rialtor_config.json');

const dateStamp = () => {
  if (config && config.risk && config.risk.date_stamp) {
    return `Fecha: ${new Date().toISOString().split('T')[0]}`;
  }
  return '';
};

const applyDefaultTemplate = (title, bullets = [], steps = [], notes = []) => {
  const parts = [];
  parts.push(title);
  parts.push('\n• Lo esencial:');
  bullets.slice(0,3).forEach(b => parts.push(`• ${b}`));
  parts.push('\n• Pasos:');
  steps.slice(0,5).forEach(s => parts.push(`- ${s}`));
  parts.push('\n• Notas locales (AMBA):');
  notes.slice(0,3).forEach(n => parts.push(`• ${n}`));
  const ds = dateStamp();
  if (ds) parts.push(`\n${config.risk.legal_disclaimer} ${ds}`);
  return parts.join('\n');
};

const formatTasacion = (data) => {
  const title = `[Tasación: ${data.tipo_propiedad || 'propiedad'} en ${data.barrio || 'zona'}]`;
  const bullets = [`Hipótesis: ${data.supuestos || 'según KB local'}`];
  const steps = [`Metodología: ${data.metodo || 'comparativo'}`, `Rango sugerido: USD ${data.rango_USD ? data.rango_USD[0] + '–' + data.rango_USD[1] : 'N/A'}`];
  const notes = [data.fundamento || 'Fundamento en KB interna'];
  return applyDefaultTemplate(title, bullets, steps, notes);
};

const formatLegal = (data) => {
  const title = `[Marco aplicable (${data.jurisdiccion || 'jurisdiccion'})]`;
  const bullets = data.bullets || ['Consultar normativa local'];
  const steps = data.steps || ['Revisar documentos listados'];
  const notes = data.notes || ['Verificar en organismos locales'];
  const ds = dateStamp();
  return `${title}\n• Qué aplica a tu caso:\n${bullets.map(b => '• '+b).join('\n')}\n• Riesgos/Verificación:\n${steps.map(s => '• '+s).join('\n')}\n• Checklist:\n${notes.map(n => '• '+n).join('\n')}\n${config.risk.legal_disclaimer} ${ds}`;
};

module.exports = {
  formatTasacion,
  formatLegal,
  applyDefaultTemplate
};
