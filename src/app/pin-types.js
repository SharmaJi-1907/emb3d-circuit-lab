/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Colours, labels and icons for each pin type
   Split out of app/app.js (#27c)
═══════════════════════════════════════════════════════════════════ */

export const PIN_TYPE_CONFIG = {
  power:   { color: '#ff4444', label: 'Power',   icon: '⚡', bg: 'rgba(255,68,68,0.15)' },
  ground:  { color: '#888888', label: 'Ground',  icon: '⏚', bg: 'rgba(136,136,136,0.15)' },
  digital: { color: '#00d4ff', label: 'Digital', icon: '◻', bg: 'rgba(0,212,255,0.15)' },
  analog:  { color: '#ff9500', label: 'Analog',  icon: '〜', bg: 'rgba(255,149,0,0.15)' },
  pwm:     { color: '#7b2fff', label: 'PWM',     icon: '⊓', bg: 'rgba(123,47,255,0.15)' },
  uart:    { color: '#00ff88', label: 'UART',    icon: '⇄', bg: 'rgba(0,255,136,0.15)' },
  spi:     { color: '#ffd700', label: 'SPI',     icon: '⊕', bg: 'rgba(255,215,0,0.15)' },
  i2c:     { color: '#ff2d78', label: 'I2C',     icon: '⊗', bg: 'rgba(255,45,120,0.15)' },
  can:     { color: '#ff6b2b', label: 'CAN',     icon: '⊞', bg: 'rgba(255,107,43,0.15)' },
  usb:     { color: '#4488ff', label: 'USB',     icon: '⊟', bg: 'rgba(68,136,255,0.15)' },
};
