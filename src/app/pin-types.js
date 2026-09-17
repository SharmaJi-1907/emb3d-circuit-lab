/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Colours, labels and icons for each pin type
═══════════════════════════════════════════════════════════════════ */

// Colours are design tokens (--pin-* in styles/base/tokens.css), so they
// follow the theme (F12). `bg` is a light tint of the same colour.
// A canvas cannot read var(); it uses cssColor() from utils/css.js.
const pin = (type, label, icon) => ({
  color: `var(--pin-${type})`,
  bg: `color-mix(in srgb, var(--pin-${type}) 15%, transparent)`,
  label,
  icon,
});

export const PIN_TYPE_CONFIG = {
  power:   pin('power',   'Power',   '⚡'),
  ground:  pin('ground',  'Ground',  '⏚'),
  digital: pin('digital', 'Digital', '◻'),
  analog:  pin('analog',  'Analog',  '〜'),
  pwm:     pin('pwm',     'PWM',     '⊓'),
  uart:    pin('uart',    'UART',    '⇄'),
  spi:     pin('spi',     'SPI',     '⊕'),
  i2c:     pin('i2c',     'I2C',     '⊗'),
  can:     pin('can',     'CAN',     '⊞'),
  usb:     pin('usb',     'USB',     '⊟'),
};
