/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Complete Data Layer
   Components, boards, datasheets, projects, AI responses
═══════════════════════════════════════════════════════════════════ */

window.CircuitLabData = (function () {
  'use strict';

  /* ── Components ─────────────────────────────────────────────── */
  const components = [
    {
      id: 'atmega328p',
      name: 'ATmega328P',
      manufacturer: 'Microchip',
      category: 'mcu',
      icon: '🔲',
      package: 'DIP-28 / TQFP-32',
      voltage: '1.8–5.5V',
      pins: 28,
      frequency: '20 MHz',
      flash: '32 KB',
      ram: '2 KB',
      eeprom: '1 KB',
      temperature: '-40°C to +85°C',
      power: '0.2–200 mA',
      protocols: ['SPI', 'I2C', 'UART', 'PWM', 'ADC'],
      tags: ['arduino', 'avr', '8-bit', 'microcontroller', 'atmega'],
      description: 'The ATmega328P is an 8-bit AVR RISC-based microcontroller combining 32KB ISP flash memory with read-while-write capabilities, 1024B EEPROM, 2KB SRAM, 23 general purpose I/O lines, 32 general purpose working registers, three flexible timer/counters with compare modes, internal and external interrupts, serial programmable USART, a byte-oriented 2-wire serial interface, SPI serial port, a 6-channel 10-bit A/D converter, programmable watchdog timer with internal oscillator, and five software selectable power saving modes.',
      pinout: [
        { num: 1,  name: 'PC6',  altName: 'RESET',  type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'RESET' },
        { num: 2,  name: 'PD0',  altName: 'RXD',    type: 'uart',    voltage: '5V',   current: '40mA', protocol: 'UART',  altFunctions: 'INT0' },
        { num: 3,  name: 'PD1',  altName: 'TXD',    type: 'uart',    voltage: '5V',   current: '40mA', protocol: 'UART',  altFunctions: 'INT1' },
        { num: 4,  name: 'PD2',  altName: 'INT0',   type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'INT0, PCINT18' },
        { num: 5,  name: 'PD3',  altName: 'INT1',   type: 'pwm',     voltage: '5V',   current: '40mA', protocol: 'PWM',   altFunctions: 'OC2B, INT1' },
        { num: 6,  name: 'PD4',  altName: 'T0',     type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'XCK, T0' },
        { num: 7,  name: 'VCC',  altName: 'VCC',    type: 'power',   voltage: '5V',   current: '200mA',protocol: 'PWR',   warning: 'Connect 100nF decoupling cap' },
        { num: 8,  name: 'GND',  altName: 'GND',    type: 'ground',  voltage: '0V',   current: '200mA',protocol: 'GND' },
        { num: 9,  name: 'PB6',  altName: 'XTAL1',  type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'XTAL1, TOSC1' },
        { num: 10, name: 'PB7',  altName: 'XTAL2',  type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'XTAL2, TOSC2' },
        { num: 11, name: 'PD5',  altName: 'T1',     type: 'pwm',     voltage: '5V',   current: '40mA', protocol: 'PWM',   altFunctions: 'OC0B, T1' },
        { num: 12, name: 'PD6',  altName: 'AIN0',   type: 'pwm',     voltage: '5V',   current: '40mA', protocol: 'PWM',   altFunctions: 'OC0A, AIN0' },
        { num: 13, name: 'PD7',  altName: 'AIN1',   type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'AIN1' },
        { num: 14, name: 'PB0',  altName: 'ICP1',   type: 'digital', voltage: '5V',   current: '40mA', protocol: 'GPIO',  altFunctions: 'ICP1, CLKO' },
        { num: 15, name: 'PB1',  altName: 'OC1A',   type: 'pwm',     voltage: '5V',   current: '40mA', protocol: 'PWM',   altFunctions: 'OC1A' },
        { num: 16, name: 'PB2',  altName: 'SS',     type: 'spi',     voltage: '5V',   current: '40mA', protocol: 'SPI',   altFunctions: 'OC1B, SS' },
        { num: 17, name: 'PB3',  altName: 'MOSI',   type: 'spi',     voltage: '5V',   current: '40mA', protocol: 'SPI',   altFunctions: 'MOSI, OC2A' },
        { num: 18, name: 'PB4',  altName: 'MISO',   type: 'spi',     voltage: '5V',   current: '40mA', protocol: 'SPI',   altFunctions: 'MISO' },
        { num: 19, name: 'PB5',  altName: 'SCK',    type: 'spi',     voltage: '5V',   current: '40mA', protocol: 'SPI',   altFunctions: 'SCK' },
        { num: 20, name: 'AVCC', altName: 'AVCC',   type: 'power',   voltage: '5V',   current: '50mA', protocol: 'PWR',   warning: 'Connect 100nF + 10µF to GND' },
        { num: 21, name: 'AREF', altName: 'AREF',   type: 'analog',  voltage: '0–5V', current: '1mA',  protocol: 'ADC',   altFunctions: 'Analog reference' },
        { num: 22, name: 'GND',  altName: 'GND',    type: 'ground',  voltage: '0V',   current: '200mA',protocol: 'GND' },
        { num: 23, name: 'PC0',  altName: 'ADC0',   type: 'analog',  voltage: '5V',   current: '40mA', protocol: 'ADC',   altFunctions: 'ADC0' },
        { num: 24, name: 'PC1',  altName: 'ADC1',   type: 'analog',  voltage: '5V',   current: '40mA', protocol: 'ADC',   altFunctions: 'ADC1' },
        { num: 25, name: 'PC2',  altName: 'ADC2',   type: 'analog',  voltage: '5V',   current: '40mA', protocol: 'ADC',   altFunctions: 'ADC2' },
        { num: 26, name: 'PC3',  altName: 'ADC3',   type: 'analog',  voltage: '5V',   current: '40mA', protocol: 'ADC',   altFunctions: 'ADC3' },
        { num: 27, name: 'PC4',  altName: 'SDA',    type: 'i2c',     voltage: '5V',   current: '40mA', protocol: 'I2C',   altFunctions: 'ADC4, SDA' },
        { num: 28, name: 'PC5',  altName: 'SCL',    type: 'i2c',     voltage: '5V',   current: '40mA', protocol: 'I2C',   altFunctions: 'ADC5, SCL' },
      ]
    },
    {
      id: 'esp32-wroom',
      name: 'ESP32-WROOM-32',
      manufacturer: 'Espressif',
      category: 'mcu',
      icon: '📡',
      package: 'SMD-38',
      voltage: '3.0–3.6V',
      pins: 38,
      frequency: '240 MHz',
      flash: '4 MB',
      ram: '520 KB',
      temperature: '-40°C to +85°C',
      power: '0.01–500 mA',
      protocols: ['WiFi', 'Bluetooth', 'SPI', 'I2C', 'UART', 'I2S', 'CAN', 'PWM', 'ADC', 'DAC', 'Touch'],
      tags: ['esp32', 'wifi', 'bluetooth', 'iot', 'espressif', 'wireless'],
      description: 'ESP32-WROOM-32 is a powerful, generic Wi-Fi+BT+BLE MCU module that targets a wide variety of applications, ranging from low-power sensor networks to the most demanding tasks, such as voice encoding, music streaming and MP3 decoding. At the core of this module is the ESP32-D0WDQ6 chip. The chip embedded is designed to be scalable and adaptive.',
      pinout: [
        { num: 1,  name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 2,  name: '3V3',    altName: 'VCC',    type: 'power',   voltage: '3.3V', protocol: 'PWR',  warning: 'Max 500mA, use LDO regulator' },
        { num: 3,  name: 'EN',     altName: 'CHIP_EN',type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'Chip enable, active high' },
        { num: 4,  name: 'GPIO36', altName: 'SVP',    type: 'analog',  voltage: '3.3V', protocol: 'ADC',  altFunctions: 'ADC1_CH0, input only' },
        { num: 5,  name: 'GPIO39', altName: 'SVN',    type: 'analog',  voltage: '3.3V', protocol: 'ADC',  altFunctions: 'ADC1_CH3, input only' },
        { num: 6,  name: 'GPIO34', altName: 'GPIO34', type: 'analog',  voltage: '3.3V', protocol: 'ADC',  altFunctions: 'ADC1_CH6, input only' },
        { num: 7,  name: 'GPIO35', altName: 'GPIO35', type: 'analog',  voltage: '3.3V', protocol: 'ADC',  altFunctions: 'ADC1_CH7, input only' },
        { num: 8,  name: 'GPIO32', altName: 'GPIO32', type: 'analog',  voltage: '3.3V', protocol: 'ADC',  altFunctions: 'ADC1_CH4, Touch9, XTAL_32K_P' },
        { num: 9,  name: 'GPIO33', altName: 'GPIO33', type: 'analog',  voltage: '3.3V', protocol: 'ADC',  altFunctions: 'ADC1_CH5, Touch8, XTAL_32K_N' },
        { num: 10, name: 'GPIO25', altName: 'DAC1',   type: 'analog',  voltage: '3.3V', protocol: 'DAC',  altFunctions: 'ADC2_CH8, DAC1' },
        { num: 11, name: 'GPIO26', altName: 'DAC2',   type: 'analog',  voltage: '3.3V', protocol: 'DAC',  altFunctions: 'ADC2_CH9, DAC2' },
        { num: 12, name: 'GPIO27', altName: 'GPIO27', type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'ADC2_CH7, Touch7, I2S0_WS' },
        { num: 13, name: 'GPIO14', altName: 'MTMS',   type: 'pwm',     voltage: '3.3V', protocol: 'PWM',  altFunctions: 'ADC2_CH6, Touch6, HSPI_CLK' },
        { num: 14, name: 'GPIO12', altName: 'MTDI',   type: 'pwm',     voltage: '3.3V', protocol: 'PWM',  altFunctions: 'ADC2_CH5, Touch5, HSPI_MISO', warning: 'Boot fail if HIGH at reset' },
        { num: 15, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 16, name: 'GPIO13', altName: 'MTCK',   type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'ADC2_CH4, Touch4, HSPI_MOSI' },
        { num: 17, name: 'GPIO9',  altName: 'SD2',    type: 'digital', voltage: '3.3V', protocol: 'GPIO', warning: 'Connected to flash, avoid use' },
        { num: 18, name: 'GPIO10', altName: 'SD3',    type: 'digital', voltage: '3.3V', protocol: 'GPIO', warning: 'Connected to flash, avoid use' },
        { num: 19, name: 'GPIO11', altName: 'CMD',    type: 'digital', voltage: '3.3V', protocol: 'GPIO', warning: 'Connected to flash, avoid use' },
        { num: 20, name: 'VDD',    altName: 'VDD',    type: 'power',   voltage: '3.3V', protocol: 'PWR' },
        { num: 21, name: 'GPIO6',  altName: 'CLK',    type: 'digital', voltage: '3.3V', protocol: 'GPIO', warning: 'Connected to flash, avoid use' },
        { num: 22, name: 'GPIO7',  altName: 'SD0',    type: 'digital', voltage: '3.3V', protocol: 'GPIO', warning: 'Connected to flash, avoid use' },
        { num: 23, name: 'GPIO8',  altName: 'SD1',    type: 'digital', voltage: '3.3V', protocol: 'GPIO', warning: 'Connected to flash, avoid use' },
        { num: 24, name: 'GPIO15', altName: 'MTDO',   type: 'pwm',     voltage: '3.3V', protocol: 'PWM',  altFunctions: 'ADC2_CH3, Touch3, HSPI_SS' },
        { num: 25, name: 'GPIO2',  altName: 'GPIO2',  type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'ADC2_CH2, Touch2, HSPI_WP', warning: 'Must be LOW or floating at boot' },
        { num: 26, name: 'GPIO0',  altName: 'GPIO0',  type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'ADC2_CH1, Touch1, CLK_OUT1', warning: 'Boot mode select, pull HIGH for normal' },
        { num: 27, name: 'GPIO4',  altName: 'GPIO4',  type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'ADC2_CH0, Touch0, RTC_GPIO10' },
        { num: 28, name: 'GPIO16', altName: 'GPIO16', type: 'uart',    voltage: '3.3V', protocol: 'UART', altFunctions: 'UART2_RXD, PSRAM_CS' },
        { num: 29, name: 'GPIO17', altName: 'GPIO17', type: 'uart',    voltage: '3.3V', protocol: 'UART', altFunctions: 'UART2_TXD, PSRAM_CLK' },
        { num: 30, name: 'GPIO5',  altName: 'GPIO5',  type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'VSPI_SS, HS1_DATA6', warning: 'Must be HIGH at boot' },
        { num: 31, name: 'GPIO18', altName: 'GPIO18', type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'VSPI_CLK, HS1_DATA7' },
        { num: 32, name: 'GPIO19', altName: 'GPIO19', type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'VSPI_MISO, U0CTS' },
        { num: 33, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 34, name: 'GPIO21', altName: 'SDA',    type: 'i2c',     voltage: '3.3V', protocol: 'I2C',  altFunctions: 'VSPI_HD, U0RTS, EMAC_TX_EN' },
        { num: 35, name: 'GPIO3',  altName: 'RXD0',   type: 'uart',    voltage: '3.3V', protocol: 'UART', altFunctions: 'U0RXD, CLK_OUT2' },
        { num: 36, name: 'GPIO1',  altName: 'TXD0',   type: 'uart',    voltage: '3.3V', protocol: 'UART', altFunctions: 'U0TXD, CLK_OUT3' },
        { num: 37, name: 'GPIO22', altName: 'SCL',    type: 'i2c',     voltage: '3.3V', protocol: 'I2C',  altFunctions: 'VSPI_WP, U0RTS, EMAC_TXD1' },
        { num: 38, name: 'GPIO23', altName: 'MOSI',   type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'VSPI_MOSI, HS1_STROBE' },
      ]
    },
    {
      id: 'ne555',
      name: 'NE555',
      manufacturer: 'Texas Instruments',
      category: 'passive',
      icon: '⏱',
      package: 'DIP-8 / SOIC-8',
      voltage: '4.5–16V',
      pins: 8,
      frequency: '500 kHz',
      temperature: '0°C to +70°C',
      power: '45–225 mW',
      protocols: ['Timer', 'PWM', 'Oscillator'],
      tags: ['timer', '555', 'oscillator', 'pwm', 'monostable', 'astable'],
      description: 'The NE555 is a highly stable device for generating accurate time delays or oscillation. Additional terminals are provided for triggering or resetting if desired. In the time delay mode of operation, the time is precisely controlled by one external resistor and capacitor. For astable operation as an oscillator, the free running frequency and duty cycle are accurately controlled with two external resistors and one capacitor.',
      pinout: [
        { num: 1, name: 'GND',     altName: 'GND',     type: 'ground',  voltage: '0V',    protocol: 'GND' },
        { num: 2, name: 'TRIG',    altName: 'TRIGGER', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Trigger input, active LOW' },
        { num: 3, name: 'OUT',     altName: 'OUTPUT',  type: 'digital', voltage: '0–VCC', protocol: 'GPIO',   altFunctions: 'Output, can source/sink 200mA' },
        { num: 4, name: 'RESET',   altName: 'RESET',   type: 'digital', voltage: '0–VCC', protocol: 'GPIO',   altFunctions: 'Active LOW reset', warning: 'Connect to VCC if unused' },
        { num: 5, name: 'CTRL',    altName: 'CONTROL', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Control voltage, 2/3 VCC', warning: 'Connect 10nF to GND if unused' },
        { num: 6, name: 'THR',     altName: 'THRESH',  type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Threshold, 2/3 VCC' },
        { num: 7, name: 'DIS',     altName: 'DISCH',   type: 'digital', voltage: '0–VCC', protocol: 'GPIO',   altFunctions: 'Discharge, open collector' },
        { num: 8, name: 'VCC',     altName: 'VCC',     type: 'power',   voltage: '4.5–16V', protocol: 'PWR', warning: 'Add 100nF decoupling cap' },
      ]
    },
    {
      id: 'stm32f103',
      name: 'STM32F103C8T6',
      manufacturer: 'STMicroelectronics',
      category: 'mcu',
      icon: '🔷',
      package: 'LQFP-48',
      voltage: '2.0–3.6V',
      pins: 48,
      frequency: '72 MHz',
      flash: '64 KB',
      ram: '20 KB',
      temperature: '-40°C to +85°C',
      power: '0.5–150 mA',
      protocols: ['SPI', 'I2C', 'UART', 'USB', 'CAN', 'PWM', 'ADC', 'DMA'],
      tags: ['stm32', 'arm', 'cortex-m3', 'bluepill', 'st'],
      description: 'The STM32F103C8T6 is a 32-bit ARM Cortex-M3 microcontroller running at 72 MHz. It features 64KB Flash, 20KB SRAM, USB 2.0 full-speed, CAN 2.0B, 7 timers, 2 ADCs, 9 communication interfaces (SPI, I2C, USART, USB, CAN). Popular as the "Blue Pill" development board.',
      pinout: [
        { num: 1,  name: 'VBAT', altName: 'VBAT',  type: 'power',   voltage: '1.8–3.6V', protocol: 'PWR' },
        { num: 2,  name: 'PC13', altName: 'TAMPER', type: 'digital', voltage: '3.3V',     protocol: 'GPIO', altFunctions: 'TAMPER-RTC, LED on Blue Pill' },
        { num: 3,  name: 'PC14', altName: 'OSC32_IN', type: 'digital', voltage: '3.3V',   protocol: 'GPIO', altFunctions: 'OSC32_IN' },
        { num: 4,  name: 'PC15', altName: 'OSC32_OUT', type: 'digital', voltage: '3.3V',  protocol: 'GPIO', altFunctions: 'OSC32_OUT' },
        { num: 5,  name: 'PD0',  altName: 'OSC_IN',  type: 'digital', voltage: '3.3V',   protocol: 'GPIO', altFunctions: 'OSC_IN' },
        { num: 6,  name: 'PD1',  altName: 'OSC_OUT', type: 'digital', voltage: '3.3V',   protocol: 'GPIO', altFunctions: 'OSC_OUT' },
        { num: 7,  name: 'NRST', altName: 'RESET',   type: 'digital', voltage: '3.3V',   protocol: 'GPIO', altFunctions: 'Active LOW reset' },
        { num: 8,  name: 'VSSA', altName: 'VSSA',    type: 'ground',  voltage: '0V',     protocol: 'GND' },
        { num: 9,  name: 'VDDA', altName: 'VDDA',    type: 'power',   voltage: '3.3V',   protocol: 'PWR',  warning: 'Add 1µF + 10nF decoupling' },
        { num: 10, name: 'PA0',  altName: 'ADC0',    type: 'analog',  voltage: '3.3V',   protocol: 'ADC',  altFunctions: 'ADC12_IN0, TIM2_CH1_ETR, USART2_CTS, WKUP' },
        { num: 11, name: 'PA1',  altName: 'ADC1',    type: 'analog',  voltage: '3.3V',   protocol: 'ADC',  altFunctions: 'ADC12_IN1, TIM2_CH2, USART2_RTS' },
        { num: 12, name: 'PA2',  altName: 'TX2',     type: 'uart',    voltage: '3.3V',   protocol: 'UART', altFunctions: 'ADC12_IN2, TIM2_CH3, USART2_TX' },
        { num: 13, name: 'PA3',  altName: 'RX2',     type: 'uart',    voltage: '3.3V',   protocol: 'UART', altFunctions: 'ADC12_IN3, TIM2_CH4, USART2_RX' },
        { num: 14, name: 'PA4',  altName: 'NSS',     type: 'spi',     voltage: '3.3V',   protocol: 'SPI',  altFunctions: 'ADC12_IN4, SPI1_NSS, USART2_CK, DAC_OUT1' },
        { num: 15, name: 'PA5',  altName: 'SCK',     type: 'spi',     voltage: '3.3V',   protocol: 'SPI',  altFunctions: 'ADC12_IN5, SPI1_SCK, DAC_OUT2' },
        { num: 16, name: 'PA6',  altName: 'MISO',    type: 'spi',     voltage: '3.3V',   protocol: 'SPI',  altFunctions: 'ADC12_IN6, SPI1_MISO, TIM3_CH1' },
        { num: 17, name: 'PA7',  altName: 'MOSI',    type: 'spi',     voltage: '3.3V',   protocol: 'SPI',  altFunctions: 'ADC12_IN7, SPI1_MOSI, TIM3_CH2' },
        { num: 18, name: 'PB0',  altName: 'ADC8',    type: 'analog',  voltage: '3.3V',   protocol: 'ADC',  altFunctions: 'ADC12_IN8, TIM3_CH3' },
        { num: 19, name: 'PB1',  altName: 'ADC9',    type: 'analog',  voltage: '3.3V',   protocol: 'ADC',  altFunctions: 'ADC12_IN9, TIM3_CH4' },
        { num: 20, name: 'PB2',  altName: 'BOOT1',   type: 'digital', voltage: '3.3V',   protocol: 'GPIO', warning: 'Boot configuration pin' },
      ]
    },
    {
      id: 'lm358',
      name: 'LM358',
      manufacturer: 'Texas Instruments',
      category: 'passive',
      icon: '〜',
      package: 'DIP-8 / SOIC-8',
      voltage: '3–32V',
      pins: 8,
      temperature: '0°C to +70°C',
      power: '500 mW',
      protocols: ['Analog', 'Op-Amp'],
      tags: ['opamp', 'amplifier', 'comparator', 'analog', 'lm358'],
      description: 'The LM358 consists of two independent, high-gain, internally frequency-compensated operational amplifiers which were designed specifically to operate from a single power supply over a wide range of voltages. Operation from split power supplies is also possible and the low power supply current drain is independent of the magnitude of the power supply voltage.',
      pinout: [
        { num: 1, name: 'OUT1', altName: 'OUTPUT1', type: 'analog',  voltage: '0–VCC', protocol: 'Analog' },
        { num: 2, name: 'IN1-', altName: 'IN1_NEG', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Inverting input, Op-Amp 1' },
        { num: 3, name: 'IN1+', altName: 'IN1_POS', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Non-inverting input, Op-Amp 1' },
        { num: 4, name: 'GND',  altName: 'GND',     type: 'ground',  voltage: '0V',    protocol: 'GND' },
        { num: 5, name: 'IN2+', altName: 'IN2_POS', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Non-inverting input, Op-Amp 2' },
        { num: 6, name: 'IN2-', altName: 'IN2_NEG', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Inverting input, Op-Amp 2' },
        { num: 7, name: 'OUT2', altName: 'OUTPUT2', type: 'analog',  voltage: '0–VCC', protocol: 'Analog' },
        { num: 8, name: 'VCC',  altName: 'VCC',     type: 'power',   voltage: '3–32V', protocol: 'PWR' },
      ]
    },
    {
      id: 'mpu6050',
      name: 'MPU-6050',
      manufacturer: 'InvenSense',
      category: 'sensor',
      icon: '🔄',
      package: 'QFN-24',
      voltage: '2.375–3.46V',
      pins: 24,
      frequency: '400 kHz I2C',
      temperature: '-40°C to +85°C',
      power: '3.9 mA',
      protocols: ['I2C', 'SPI', 'Interrupt'],
      tags: ['imu', 'gyroscope', 'accelerometer', 'motion', 'mpu6050', '6dof'],
      description: 'The MPU-6050 is the world\'s first integrated 6-axis MotionTracking device that combines a 3-axis gyroscope, 3-axis accelerometer, and a Digital Motion Processor (DMP) all in a small 4x4x0.9mm package. With its dedicated I2C sensor bus, it directly accepts inputs from an external 3-axis compass to provide a complete 9-axis MotionFusion output.',
      pinout: [
        { num: 1,  name: 'CLKIN',  altName: 'CLKIN',  type: 'digital', voltage: '3.3V', protocol: 'GPIO',  altFunctions: 'Optional external clock' },
        { num: 2,  name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 3,  name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 4,  name: 'INT',    altName: 'INT',    type: 'digital', voltage: '3.3V', protocol: 'GPIO',  altFunctions: 'Interrupt output, active HIGH' },
        { num: 5,  name: 'AUX_DA', altName: 'SDA2',   type: 'i2c',     voltage: '3.3V', protocol: 'I2C',   altFunctions: 'Auxiliary I2C SDA' },
        { num: 6,  name: 'AUX_CL', altName: 'SCL2',   type: 'i2c',     voltage: '3.3V', protocol: 'I2C',   altFunctions: 'Auxiliary I2C SCL' },
        { num: 7,  name: 'FSYNC',  altName: 'FSYNC',  type: 'digital', voltage: '3.3V', protocol: 'GPIO',  altFunctions: 'Frame sync, connect to GND if unused' },
        { num: 8,  name: 'INTA',   altName: 'INTA',   type: 'digital', voltage: '3.3V', protocol: 'GPIO' },
        { num: 9,  name: 'VDD',    altName: 'VDD',    type: 'power',   voltage: '3.3V', protocol: 'PWR',   warning: 'Add 100nF decoupling cap' },
        { num: 10, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 11, name: 'REGOUT', altName: 'REGOUT', type: 'power',   voltage: '1.8V', protocol: 'PWR',   warning: 'Add 100nF cap to GND' },
        { num: 12, name: 'VDDIO',  altName: 'VDDIO',  type: 'power',   voltage: '1.8–3.3V', protocol: 'PWR' },
        { num: 13, name: 'AD0',    altName: 'AD0',    type: 'digital', voltage: '3.3V', protocol: 'GPIO',  altFunctions: 'I2C address bit 0 (0x68 or 0x69)' },
        { num: 14, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 15, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 16, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 17, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 18, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 19, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 20, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 21, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 22, name: 'SCL',    altName: 'SCL',    type: 'i2c',     voltage: '3.3V', protocol: 'I2C',   altFunctions: 'I2C clock, 400kHz max' },
        { num: 23, name: 'SDA',    altName: 'SDA',    type: 'i2c',     voltage: '3.3V', protocol: 'I2C',   altFunctions: 'I2C data' },
        { num: 24, name: 'GND',    altName: 'GND',    type: 'ground',  voltage: '0V',   protocol: 'GND' },
      ]
    },
    {
      id: 'l298n',
      name: 'L298N',
      manufacturer: 'STMicroelectronics',
      category: 'power',
      icon: '⚡',
      package: 'Multiwatt-15',
      voltage: '5–46V',
      pins: 15,
      temperature: '-25°C to +130°C',
      power: '25 W',
      protocols: ['PWM', 'H-Bridge', 'Motor Control'],
      tags: ['motor', 'driver', 'h-bridge', 'l298n', 'dc motor', 'stepper'],
      description: 'The L298N is a monolithic integrated circuit in a 15-lead Multiwatt and PowerSO20 packages. It is a high voltage, high current dual full-bridge driver designed to accept standard TTL logic levels and drive inductive loads such as relays, solenoids, DC and stepping motors.',
      pinout: [
        { num: 1,  name: 'SENSE_A', altName: 'SENSE_A', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Current sense A, connect to GND via resistor' },
        { num: 2,  name: 'OUT1',    altName: 'OUT1',    type: 'digital', voltage: '0–46V', protocol: 'GPIO',   altFunctions: 'Motor A output 1' },
        { num: 3,  name: 'OUT2',    altName: 'OUT2',    type: 'digital', voltage: '0–46V', protocol: 'GPIO',   altFunctions: 'Motor A output 2' },
        { num: 4,  name: 'VS',      altName: 'VS',      type: 'power',   voltage: '5–46V', protocol: 'PWR',    warning: 'Motor supply voltage, add 100µF cap' },
        { num: 5,  name: 'IN1',     altName: 'IN1',     type: 'digital', voltage: '5V',    protocol: 'GPIO',   altFunctions: 'Logic input 1 for motor A' },
        { num: 6,  name: 'EN_A',    altName: 'ENABLE_A',type: 'pwm',     voltage: '5V',    protocol: 'PWM',    altFunctions: 'Enable motor A, PWM for speed control' },
        { num: 7,  name: 'IN2',     altName: 'IN2',     type: 'digital', voltage: '5V',    protocol: 'GPIO',   altFunctions: 'Logic input 2 for motor A' },
        { num: 8,  name: 'GND',     altName: 'GND',     type: 'ground',  voltage: '0V',    protocol: 'GND' },
        { num: 9,  name: 'VSS',     altName: 'VSS',     type: 'power',   voltage: '5V',    protocol: 'PWR',    altFunctions: 'Logic supply voltage' },
        { num: 10, name: 'IN3',     altName: 'IN3',     type: 'digital', voltage: '5V',    protocol: 'GPIO',   altFunctions: 'Logic input 3 for motor B' },
        { num: 11, name: 'EN_B',    altName: 'ENABLE_B',type: 'pwm',     voltage: '5V',    protocol: 'PWM',    altFunctions: 'Enable motor B, PWM for speed control' },
        { num: 12, name: 'IN4',     altName: 'IN4',     type: 'digital', voltage: '5V',    protocol: 'GPIO',   altFunctions: 'Logic input 4 for motor B' },
        { num: 13, name: 'OUT3',    altName: 'OUT3',    type: 'digital', voltage: '0–46V', protocol: 'GPIO',   altFunctions: 'Motor B output 3' },
        { num: 14, name: 'OUT4',    altName: 'OUT4',    type: 'digital', voltage: '0–46V', protocol: 'GPIO',   altFunctions: 'Motor B output 4' },
        { num: 15, name: 'SENSE_B', altName: 'SENSE_B', type: 'analog',  voltage: '0–VCC', protocol: 'Analog', altFunctions: 'Current sense B' },
      ]
    },
    {
      id: 'hc-sr04',
      name: 'HC-SR04',
      manufacturer: 'Generic',
      category: 'sensor',
      icon: '📡',
      package: 'Module',
      voltage: '5V',
      pins: 4,
      frequency: '40 kHz',
      temperature: '0°C to +60°C',
      power: '15 mA',
      protocols: ['GPIO', 'Trigger/Echo'],
      tags: ['ultrasonic', 'distance', 'sensor', 'hcsr04', 'sonar'],
      description: 'The HC-SR04 ultrasonic sensor uses sonar to determine distance to an object like bats or dolphins do. It offers excellent non-contact range detection with high accuracy and stable readings in an easy-to-use package. From 2cm to 400cm or 1" to 13 feet. The operation is not affected by sunlight or black material, although acoustically, soft materials like cloth can be difficult to detect.',
      pinout: [
        { num: 1, name: 'VCC',   altName: 'VCC',   type: 'power',   voltage: '5V',   protocol: 'PWR' },
        { num: 2, name: 'TRIG',  altName: 'TRIG',  type: 'digital', voltage: '5V',   protocol: 'GPIO', altFunctions: '10µs HIGH pulse to trigger' },
        { num: 3, name: 'ECHO',  altName: 'ECHO',  type: 'digital', voltage: '5V',   protocol: 'GPIO', altFunctions: 'HIGH pulse proportional to distance', warning: 'Use voltage divider for 3.3V MCUs' },
        { num: 4, name: 'GND',   altName: 'GND',   type: 'ground',  voltage: '0V',   protocol: 'GND' },
      ]
    },
    {
      id: 'ams1117',
      name: 'AMS1117-3.3',
      manufacturer: 'Advanced Monolithic Systems',
      category: 'power',
      icon: '🔋',
      package: 'SOT-223 / TO-252',
      voltage: '4.75–15V in, 3.3V out',
      pins: 3,
      temperature: '-40°C to +125°C',
      power: '1 A',
      protocols: ['LDO', 'Voltage Regulator'],
      tags: ['ldo', 'regulator', '3.3v', 'power', 'ams1117'],
      description: 'The AMS1117 series of adjustable and fixed voltage regulators are designed to provide up to 1A output current and to operate down to 1V input-to-output differential. The dropout voltage of the device is guaranteed maximum 1.3V, decreasing at lower load currents. On-chip trimming adjusts the reference voltage to 1%.',
      pinout: [
        { num: 1, name: 'GND',  altName: 'ADJ',  type: 'ground', voltage: '0V',   protocol: 'GND', altFunctions: 'Ground / Adjust pin' },
        { num: 2, name: 'OUT',  altName: 'OUT',  type: 'power',  voltage: '3.3V', protocol: 'PWR', altFunctions: 'Regulated output, add 10µF cap' },
        { num: 3, name: 'IN',   altName: 'IN',   type: 'power',  voltage: '4.75–15V', protocol: 'PWR', warning: 'Min 1V above output, add 10µF cap' },
      ]
    },
    {
      id: 'nrf24l01',
      name: 'nRF24L01+',
      manufacturer: 'Nordic Semiconductor',
      category: 'mcu',
      icon: '📶',
      package: 'QFN-20',
      voltage: '1.9–3.6V',
      pins: 8,
      frequency: '2.4 GHz',
      temperature: '-40°C to +85°C',
      power: '11.3 mA TX',
      protocols: ['SPI', '2.4GHz RF', 'ShockBurst'],
      tags: ['rf', 'wireless', '2.4ghz', 'nrf24', 'radio', 'nordic'],
      description: 'The nRF24L01+ is a single chip 2.4GHz transceiver with an embedded baseband protocol engine (Enhanced ShockBurst™), suitable for ultra low power wireless applications. The nRF24L01+ is designed for operation in the world wide ISM frequency band at 2.400 - 2.4835GHz.',
      pinout: [
        { num: 1, name: 'GND',  altName: 'GND',  type: 'ground',  voltage: '0V',   protocol: 'GND' },
        { num: 2, name: 'VCC',  altName: 'VCC',  type: 'power',   voltage: '3.3V', protocol: 'PWR', warning: 'Max 3.6V! Use 3.3V only' },
        { num: 3, name: 'CE',   altName: 'CE',   type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'Chip Enable, RX/TX mode' },
        { num: 4, name: 'CSN',  altName: 'CSN',  type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'SPI Chip Select, active LOW' },
        { num: 5, name: 'SCK',  altName: 'SCK',  type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'SPI Clock' },
        { num: 6, name: 'MOSI', altName: 'MOSI', type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'SPI Master Out' },
        { num: 7, name: 'MISO', altName: 'MISO', type: 'spi',     voltage: '3.3V', protocol: 'SPI',  altFunctions: 'SPI Master In' },
        { num: 8, name: 'IRQ',  altName: 'IRQ',  type: 'digital', voltage: '3.3V', protocol: 'GPIO', altFunctions: 'Interrupt, active LOW' },
      ]
    },
  ];

  /* ── Development Boards ─────────────────────────────────────── */
  const boards = {
    'arduino-uno': {
      name: 'Arduino Uno R3',
      mcu: 'ATmega328P',
      voltage: '5V / 3.3V',
      frequency: '16 MHz',
      flash: '32 KB',
      ram: '2 KB',
      digitalPins: '14 (6 PWM)',
      analogPins: '6',
      pwmPins: '6',
      usbInterface: 'USB-B',
      dimensions: '68.6 × 53.4 mm',
      color: '#1a4a1a',
      pins: [
        { num: 1,  name: 'D0/RX',  label: 'D0',  type: 'uart',    x: 0.05, y: 0.10 },
        { num: 2,  name: 'D1/TX',  label: 'D1',  type: 'uart',    x: 0.05, y: 0.17 },
        { num: 3,  name: 'D2',     label: 'D2',  type: 'digital', x: 0.05, y: 0.24 },
        { num: 4,  name: 'D3~',    label: 'D3~', type: 'pwm',     x: 0.05, y: 0.31 },
        { num: 5,  name: 'D4',     label: 'D4',  type: 'digital', x: 0.05, y: 0.38 },
        { num: 6,  name: 'D5~',    label: 'D5~', type: 'pwm',     x: 0.05, y: 0.45 },
        { num: 7,  name: 'D6~',    label: 'D6~', type: 'pwm',     x: 0.05, y: 0.52 },
        { num: 8,  name: 'D7',     label: 'D7',  type: 'digital', x: 0.05, y: 0.59 },
        { num: 9,  name: 'D8',     label: 'D8',  type: 'digital', x: 0.05, y: 0.66 },
        { num: 10, name: 'D9~',    label: 'D9~', type: 'pwm',     x: 0.05, y: 0.73 },
        { num: 11, name: 'D10~',   label: 'D10', type: 'spi',     x: 0.05, y: 0.80 },
        { num: 12, name: 'D11~',   label: 'D11', type: 'spi',     x: 0.05, y: 0.87 },
        { num: 13, name: '5V',     label: '5V',  type: 'power',   x: 0.95, y: 0.10 },
        { num: 14, name: '3.3V',   label: '3V3', type: 'power',   x: 0.95, y: 0.17 },
        { num: 15, name: 'GND',    label: 'GND', type: 'ground',  x: 0.95, y: 0.24 },
        { num: 16, name: 'A0',     label: 'A0',  type: 'analog',  x: 0.95, y: 0.38 },
        { num: 17, name: 'A1',     label: 'A1',  type: 'analog',  x: 0.95, y: 0.45 },
        { num: 18, name: 'A2',     label: 'A2',  type: 'analog',  x: 0.95, y: 0.52 },
        { num: 19, name: 'A3',     label: 'A3',  type: 'analog',  x: 0.95, y: 0.59 },
        { num: 20, name: 'SDA',    label: 'SDA', type: 'i2c',     x: 0.95, y: 0.66 },
        { num: 21, name: 'SCL',    label: 'SCL', type: 'i2c',     x: 0.95, y: 0.73 },
        { num: 22, name: 'D12',    label: 'D12', type: 'spi',     x: 0.05, y: 0.94 },
        { num: 23, name: 'D13',    label: 'D13', type: 'spi',     x: 0.95, y: 0.80 },
      ]
    },
    'esp32-devkit': {
      name: 'ESP32 DevKit V1',
      mcu: 'ESP32-WROOM-32',
      voltage: '3.3V',
      frequency: '240 MHz',
      flash: '4 MB',
      ram: '520 KB',
      digitalPins: '34',
      analogPins: '18',
      pwmPins: '16',
      usbInterface: 'Micro-USB',
      dimensions: '55 × 28 mm',
      color: '#1a1a4a',
      pins: [
        { num: 1,  name: 'GPIO23', label: 'D23', type: 'spi',     x: 0.05, y: 0.08 },
        { num: 2,  name: 'GPIO22', label: 'D22', type: 'i2c',     x: 0.05, y: 0.15 },
        { num: 3,  name: 'GPIO1',  label: 'TX0', type: 'uart',    x: 0.05, y: 0.22 },
        { num: 4,  name: 'GPIO3',  label: 'RX0', type: 'uart',    x: 0.05, y: 0.29 },
        { num: 5,  name: 'GPIO21', label: 'D21', type: 'i2c',     x: 0.05, y: 0.36 },
        { num: 6,  name: 'GPIO19', label: 'D19', type: 'spi',     x: 0.05, y: 0.43 },
        { num: 7,  name: 'GPIO18', label: 'D18', type: 'spi',     x: 0.05, y: 0.50 },
        { num: 8,  name: 'GPIO5',  label: 'D5',  type: 'spi',     x: 0.05, y: 0.57 },
        { num: 9,  name: 'GPIO17', label: 'D17', type: 'uart',    x: 0.05, y: 0.64 },
        { num: 10, name: 'GPIO16', label: 'D16', type: 'uart',    x: 0.05, y: 0.71 },
        { num: 11, name: 'GPIO4',  label: 'D4',  type: 'digital', x: 0.05, y: 0.78 },
        { num: 12, name: 'GPIO2',  label: 'D2',  type: 'digital', x: 0.05, y: 0.85 },
        { num: 13, name: '3V3',    label: '3V3', type: 'power',   x: 0.95, y: 0.08 },
        { num: 14, name: 'GND',    label: 'GND', type: 'ground',  x: 0.95, y: 0.15 },
        { num: 15, name: 'GPIO15', label: 'D15', type: 'digital', x: 0.95, y: 0.22 },
        { num: 16, name: 'GPIO13', label: 'D13', type: 'digital', x: 0.95, y: 0.29 },
        { num: 17, name: 'GPIO12', label: 'D12', type: 'digital', x: 0.95, y: 0.36 },
        { num: 18, name: 'GPIO14', label: 'D14', type: 'digital', x: 0.95, y: 0.43 },
        { num: 19, name: 'GPIO27', label: 'D27', type: 'digital', x: 0.95, y: 0.50 },
        { num: 20, name: 'GPIO26', label: 'D26', type: 'analog',  x: 0.95, y: 0.57 },
        { num: 21, name: 'GPIO25', label: 'D25', type: 'analog',  x: 0.95, y: 0.64 },
        { num: 22, name: 'GPIO33', label: 'D33', type: 'analog',  x: 0.95, y: 0.71 },
        { num: 23, name: 'GPIO32', label: 'D32', type: 'analog',  x: 0.95, y: 0.78 },
        { num: 24, name: 'GPIO35', label: 'D35', type: 'analog',  x: 0.95, y: 0.85 },
      ]
    },
    'raspberry-pi-4': {
      name: 'Raspberry Pi 4B',
      mcu: 'BCM2711 (ARM Cortex-A72)',
      voltage: '3.3V / 5V',
      frequency: '1.8 GHz',
      flash: 'MicroSD',
      ram: '1–8 GB',
      digitalPins: '26 GPIO',
      analogPins: '0 (use ADC)',
      pwmPins: '2 hardware',
      usbInterface: 'USB-C Power',
      dimensions: '85 × 56 mm',
      color: '#4a1a1a',
      pins: [
        { num: 1,  name: '3.3V',   label: '3V3', type: 'power',   x: 0.05, y: 0.06 },
        { num: 2,  name: '5V',     label: '5V',  type: 'power',   x: 0.95, y: 0.06 },
        { num: 3,  name: 'GPIO2',  label: 'SDA', type: 'i2c',     x: 0.05, y: 0.12 },
        { num: 4,  name: '5V',     label: '5V',  type: 'power',   x: 0.95, y: 0.12 },
        { num: 5,  name: 'GPIO3',  label: 'SCL', type: 'i2c',     x: 0.05, y: 0.18 },
        { num: 6,  name: 'GND',    label: 'GND', type: 'ground',  x: 0.95, y: 0.18 },
        { num: 7,  name: 'GPIO4',  label: 'D4',  type: 'digital', x: 0.05, y: 0.24 },
        { num: 8,  name: 'GPIO14', label: 'TX',  type: 'uart',    x: 0.95, y: 0.24 },
        { num: 9,  name: 'GND',    label: 'GND', type: 'ground',  x: 0.05, y: 0.30 },
        { num: 10, name: 'GPIO15', label: 'RX',  type: 'uart',    x: 0.95, y: 0.30 },
        { num: 11, name: 'GPIO17', label: 'D17', type: 'digital', x: 0.05, y: 0.36 },
        { num: 12, name: 'GPIO18', label: 'PWM', type: 'pwm',     x: 0.95, y: 0.36 },
        { num: 13, name: 'GPIO27', label: 'D27', type: 'digital', x: 0.05, y: 0.42 },
        { num: 14, name: 'GND',    label: 'GND', type: 'ground',  x: 0.95, y: 0.42 },
        { num: 15, name: 'GPIO22', label: 'D22', type: 'digital', x: 0.05, y: 0.48 },
        { num: 16, name: 'GPIO23', label: 'D23', type: 'digital', x: 0.95, y: 0.48 },
        { num: 17, name: '3.3V',   label: '3V3', type: 'power',   x: 0.05, y: 0.54 },
        { num: 18, name: 'GPIO24', label: 'D24', type: 'digital', x: 0.95, y: 0.54 },
        { num: 19, name: 'GPIO10', label: 'MOSI',type: 'spi',     x: 0.05, y: 0.60 },
        { num: 20, name: 'GND',    label: 'GND', type: 'ground',  x: 0.95, y: 0.60 },
        { num: 21, name: 'GPIO9',  label: 'MISO',type: 'spi',     x: 0.05, y: 0.66 },
        { num: 22, name: 'GPIO25', label: 'D25', type: 'digital', x: 0.95, y: 0.66 },
        { num: 23, name: 'GPIO11', label: 'SCK', type: 'spi',     x: 0.05, y: 0.72 },
        { num: 24, name: 'GPIO8',  label: 'CE0', type: 'spi',     x: 0.95, y: 0.72 },
        { num: 25, name: 'GND',    label: 'GND', type: 'ground',  x: 0.05, y: 0.78 },
        { num: 26, name: 'GPIO7',  label: 'CE1', type: 'spi',     x: 0.95, y: 0.78 },
      ]
    },
    'stm32-bluepill': {
      name: 'STM32 Blue Pill',
      mcu: 'STM32F103C8T6',
      voltage: '3.3V',
      frequency: '72 MHz',
      flash: '64 KB',
      ram: '20 KB',
      digitalPins: '37',
      analogPins: '10',
      pwmPins: '15',
      usbInterface: 'Micro-USB',
      dimensions: '53 × 23 mm',
      color: '#1a1a6a',
      pins: [
        { num: 1,  name: 'GND',   label: 'GND', type: 'ground',  x: 0.05, y: 0.08 },
        { num: 2,  name: 'GND',   label: 'GND', type: 'ground',  x: 0.05, y: 0.16 },
        { num: 3,  name: '3.3V',  label: '3V3', type: 'power',   x: 0.05, y: 0.24 },
        { num: 4,  name: 'NRST',  label: 'RST', type: 'digital', x: 0.05, y: 0.32 },
        { num: 5,  name: 'PA0',   label: 'A0',  type: 'analog',  x: 0.05, y: 0.40 },
        { num: 6,  name: 'PA1',   label: 'A1',  type: 'analog',  x: 0.05, y: 0.48 },
        { num: 7,  name: 'PA2',   label: 'TX2', type: 'uart',    x: 0.05, y: 0.56 },
        { num: 8,  name: 'PA3',   label: 'RX2', type: 'uart',    x: 0.05, y: 0.64 },
        { num: 9,  name: 'PA4',   label: 'NSS', type: 'spi',     x: 0.05, y: 0.72 },
        { num: 10, name: 'PA5',   label: 'SCK', type: 'spi',     x: 0.05, y: 0.80 },
        { num: 11, name: 'PA6',   label: 'MISO',type: 'spi',     x: 0.05, y: 0.88 },
        { num: 12, name: 'PA7',   label: 'MOSI',type: 'spi',     x: 0.05, y: 0.96 },
        { num: 13, name: 'VCC',   label: 'VCC', type: 'power',   x: 0.95, y: 0.08 },
        { num: 14, name: 'GND',   label: 'GND', type: 'ground',  x: 0.95, y: 0.16 },
        { num: 15, name: 'PB11',  label: 'SDA', type: 'i2c',     x: 0.95, y: 0.24 },
        { num: 16, name: 'PB10',  label: 'SCL', type: 'i2c',     x: 0.95, y: 0.32 },
        { num: 17, name: 'PB1',   label: 'B1',  type: 'pwm',     x: 0.95, y: 0.40 },
        { num: 18, name: 'PB0',   label: 'B0',  type: 'pwm',     x: 0.95, y: 0.48 },
        { num: 19, name: 'PA10',  label: 'RX1', type: 'uart',    x: 0.95, y: 0.56 },
        { num: 20, name: 'PA9',   label: 'TX1', type: 'uart',    x: 0.95, y: 0.64 },
        { num: 21, name: 'PA8',   label: 'D8',  type: 'digital', x: 0.95, y: 0.72 },
        { num: 22, name: 'PB15',  label: 'MOSI',type: 'spi',     x: 0.95, y: 0.80 },
        { num: 23, name: 'PB14',  label: 'MISO',type: 'spi',     x: 0.95, y: 0.88 },
        { num: 24, name: 'PB13',  label: 'SCK', type: 'spi',     x: 0.95, y: 0.96 },
      ]
    },
    // Arduino Mega 2560 Rev3. Sources: Arduino full pinout (docs.arduino.cc/resources/pinouts/A000067-full-pinout.pdf),
    // ArduinoCore-avr variants/mega/pins_arduino.h and boards.txt. Drawn with the USB end on the left.
    'arduino-mega': {
      name: 'Arduino Mega 2560 Rev3',
      mcu: 'ATmega2560',
      voltage: '5V',
      frequency: '16 MHz',
      flash: '256 KB',
      ram: '8 KB',
      digitalPins: '54 (15 PWM)',
      analogPins: '16',
      pwmPins: '15',
      usbInterface: 'USB-B',
      color: '#0a4a52',
      pins: [
        { num: 1, name: 'SCL', label: 'SCL', type: 'i2c', x: 0.16, y: 0.05 },
        { num: 2, name: 'SDA', label: 'SDA', type: 'i2c', x: 0.185, y: 0.05 },
        { num: 3, name: 'AREF', label: 'AREF', type: 'analog', x: 0.21, y: 0.05 },
        { num: 4, name: 'GND', label: 'GND', type: 'ground', x: 0.236, y: 0.05 },
        { num: 5, name: 'D13~', label: 'D13', type: 'pwm', x: 0.261, y: 0.05 },
        { num: 6, name: 'D12~', label: 'D12', type: 'pwm', x: 0.286, y: 0.05 },
        { num: 7, name: 'D11~', label: 'D11', type: 'pwm', x: 0.311, y: 0.05 },
        { num: 8, name: 'D10~', label: 'D10', type: 'pwm', x: 0.336, y: 0.05 },
        { num: 9, name: 'D9~', label: 'D9', type: 'pwm', x: 0.361, y: 0.05 },
        { num: 10, name: 'D8~', label: 'D8', type: 'pwm', x: 0.387, y: 0.05 },
        { num: 11, name: 'D7~', label: 'D7', type: 'pwm', x: 0.437, y: 0.05 },
        { num: 12, name: 'D6~', label: 'D6', type: 'pwm', x: 0.462, y: 0.05 },
        { num: 13, name: 'D5~', label: 'D5', type: 'pwm', x: 0.487, y: 0.05 },
        { num: 14, name: 'D4~', label: 'D4', type: 'pwm', x: 0.513, y: 0.05 },
        { num: 15, name: 'D3~', label: 'D3', type: 'pwm', x: 0.538, y: 0.05 },
        { num: 16, name: 'D2~', label: 'D2', type: 'pwm', x: 0.563, y: 0.05 },
        { num: 17, name: 'D1/TX0', label: 'TX0', type: 'uart', x: 0.588, y: 0.05 },
        { num: 18, name: 'D0/RX0', label: 'RX0', type: 'uart', x: 0.613, y: 0.05 },
        { num: 19, name: 'D14/TX3', label: 'TX3', type: 'uart', x: 0.664, y: 0.05 },
        { num: 20, name: 'D15/RX3', label: 'RX3', type: 'uart', x: 0.689, y: 0.05 },
        { num: 21, name: 'D16/TX2', label: 'TX2', type: 'uart', x: 0.714, y: 0.05 },
        { num: 22, name: 'D17/RX2', label: 'RX2', type: 'uart', x: 0.739, y: 0.05 },
        { num: 23, name: 'D18/TX1', label: 'TX1', type: 'uart', x: 0.764, y: 0.05 },
        { num: 24, name: 'D19/RX1', label: 'RX1', type: 'uart', x: 0.79, y: 0.05 },
        { num: 25, name: 'D20/SDA', label: 'SDA', type: 'i2c', x: 0.815, y: 0.05 },
        { num: 26, name: 'D21/SCL', label: 'SCL', type: 'i2c', x: 0.84, y: 0.05 },
        { num: 27, name: '5V', label: '5V', type: 'power', x: 0.89, y: 0.08 },
        { num: 28, name: 'D22', label: 'D22', type: 'digital', x: 0.89, y: 0.129 },
        { num: 29, name: 'D24', label: 'D24', type: 'digital', x: 0.89, y: 0.179 },
        { num: 30, name: 'D26', label: 'D26', type: 'digital', x: 0.89, y: 0.228 },
        { num: 31, name: 'D28', label: 'D28', type: 'digital', x: 0.89, y: 0.278 },
        { num: 32, name: 'D30', label: 'D30', type: 'digital', x: 0.89, y: 0.327 },
        { num: 33, name: 'D32', label: 'D32', type: 'digital', x: 0.89, y: 0.376 },
        { num: 34, name: 'D34', label: 'D34', type: 'digital', x: 0.89, y: 0.426 },
        { num: 35, name: 'D36', label: 'D36', type: 'digital', x: 0.89, y: 0.475 },
        { num: 36, name: 'D38', label: 'D38', type: 'digital', x: 0.89, y: 0.525 },
        { num: 37, name: 'D40', label: 'D40', type: 'digital', x: 0.89, y: 0.574 },
        { num: 38, name: 'D42', label: 'D42', type: 'digital', x: 0.89, y: 0.624 },
        { num: 39, name: 'D44~', label: 'D44', type: 'pwm', x: 0.89, y: 0.673 },
        { num: 40, name: 'D46~', label: 'D46', type: 'pwm', x: 0.89, y: 0.722 },
        { num: 41, name: 'D48', label: 'D48', type: 'digital', x: 0.89, y: 0.772 },
        { num: 42, name: 'D50/MISO', label: 'MISO', type: 'spi', x: 0.89, y: 0.821 },
        { num: 43, name: 'D52/SCK', label: 'SCK', type: 'spi', x: 0.89, y: 0.871 },
        { num: 44, name: 'GND', label: 'GND', type: 'ground', x: 0.89, y: 0.92 },
        { num: 45, name: '5V', label: '5V', type: 'power', x: 0.94, y: 0.08 },
        { num: 46, name: 'D23', label: 'D23', type: 'digital', x: 0.94, y: 0.129 },
        { num: 47, name: 'D25', label: 'D25', type: 'digital', x: 0.94, y: 0.179 },
        { num: 48, name: 'D27', label: 'D27', type: 'digital', x: 0.94, y: 0.228 },
        { num: 49, name: 'D29', label: 'D29', type: 'digital', x: 0.94, y: 0.278 },
        { num: 50, name: 'D31', label: 'D31', type: 'digital', x: 0.94, y: 0.327 },
        { num: 51, name: 'D33', label: 'D33', type: 'digital', x: 0.94, y: 0.376 },
        { num: 52, name: 'D35', label: 'D35', type: 'digital', x: 0.94, y: 0.426 },
        { num: 53, name: 'D37', label: 'D37', type: 'digital', x: 0.94, y: 0.475 },
        { num: 54, name: 'D39', label: 'D39', type: 'digital', x: 0.94, y: 0.525 },
        { num: 55, name: 'D41', label: 'D41', type: 'digital', x: 0.94, y: 0.574 },
        { num: 56, name: 'D43', label: 'D43', type: 'digital', x: 0.94, y: 0.624 },
        { num: 57, name: 'D45~', label: 'D45', type: 'pwm', x: 0.94, y: 0.673 },
        { num: 58, name: 'D47', label: 'D47', type: 'digital', x: 0.94, y: 0.722 },
        { num: 59, name: 'D49', label: 'D49', type: 'digital', x: 0.94, y: 0.772 },
        { num: 60, name: 'D51/MOSI', label: 'MOSI', type: 'spi', x: 0.94, y: 0.821 },
        { num: 61, name: 'D53/SS', label: 'SS', type: 'spi', x: 0.94, y: 0.871 },
        { num: 62, name: 'GND', label: 'GND', type: 'ground', x: 0.94, y: 0.92 },
        { num: 63, name: 'IOREF', label: 'IOREF', type: 'power', x: 0.22, y: 0.95 },
        { num: 64, name: 'RESET', label: 'RST', type: 'digital', x: 0.245, y: 0.95 },
        { num: 65, name: '3.3V', label: '3V3', type: 'power', x: 0.27, y: 0.95 },
        { num: 66, name: '5V', label: '5V', type: 'power', x: 0.295, y: 0.95 },
        { num: 67, name: 'GND', label: 'GND', type: 'ground', x: 0.32, y: 0.95 },
        { num: 68, name: 'GND', label: 'GND', type: 'ground', x: 0.345, y: 0.95 },
        { num: 69, name: 'VIN', label: 'VIN', type: 'power', x: 0.37, y: 0.95 },
        { num: 70, name: 'A0', label: 'A0', type: 'analog', x: 0.42, y: 0.95 },
        { num: 71, name: 'A1', label: 'A1', type: 'analog', x: 0.445, y: 0.95 },
        { num: 72, name: 'A2', label: 'A2', type: 'analog', x: 0.47, y: 0.95 },
        { num: 73, name: 'A3', label: 'A3', type: 'analog', x: 0.495, y: 0.95 },
        { num: 74, name: 'A4', label: 'A4', type: 'analog', x: 0.52, y: 0.95 },
        { num: 75, name: 'A5', label: 'A5', type: 'analog', x: 0.545, y: 0.95 },
        { num: 76, name: 'A6', label: 'A6', type: 'analog', x: 0.57, y: 0.95 },
        { num: 77, name: 'A7', label: 'A7', type: 'analog', x: 0.595, y: 0.95 },
        { num: 78, name: 'A8', label: 'A8', type: 'analog', x: 0.645, y: 0.95 },
        { num: 79, name: 'A9', label: 'A9', type: 'analog', x: 0.67, y: 0.95 },
        { num: 80, name: 'A10', label: 'A10', type: 'analog', x: 0.695, y: 0.95 },
        { num: 81, name: 'A11', label: 'A11', type: 'analog', x: 0.72, y: 0.95 },
        { num: 82, name: 'A12', label: 'A12', type: 'analog', x: 0.745, y: 0.95 },
        { num: 83, name: 'A13', label: 'A13', type: 'analog', x: 0.77, y: 0.95 },
        { num: 84, name: 'A14', label: 'A14', type: 'analog', x: 0.795, y: 0.95 },
        { num: 85, name: 'A15', label: 'A15', type: 'analog', x: 0.82, y: 0.95 },
      ]
    },
    // NodeMCU 1.0 (ESP-12E). Sources: github.com/nodemcu/nodemcu-devkit-v1.0 pin map image,
    // nodemcu.readthedocs.io GPIO table, esp8266/Arduino variants/nodemcu/pins_arduino.h, generic/common.h and boards.txt.
    // D1 = GPIO5 and D2 = GPIO4 (the repo's pin-list text says the opposite; the image, firmware docs and core agree).
    'esp8266-nodemcu': {
      name: 'NodeMCU 1.0 (ESP8266)',
      mcu: 'ESP8266 (ESP-12E)',
      voltage: '3.3V',
      frequency: '80 / 160 MHz',
      flash: '4 MB',
      ram: '80 KB',
      digitalPins: '11 (D0–D10)',
      analogPins: '1 (A0)',
      pwmPins: '10 (not D0)',
      usbInterface: 'Micro-USB',
      color: '#1a2a4a',
      pins: [
        { num: 1, name: 'A0', label: 'A0', type: 'analog', x: 0.06, y: 0.05 },
        { num: 2, name: 'SD3 (flash)', label: 'SD3', type: 'spi', x: 0.06, y: 0.243 },
        { num: 3, name: 'SD2 (flash)', label: 'SD2', type: 'spi', x: 0.06, y: 0.307 },
        { num: 4, name: 'SD1 (flash)', label: 'SD1', type: 'spi', x: 0.06, y: 0.371 },
        { num: 5, name: 'CMD (flash)', label: 'CMD', type: 'spi', x: 0.06, y: 0.436 },
        { num: 6, name: 'SD0 (flash)', label: 'SD0', type: 'spi', x: 0.06, y: 0.5 },
        { num: 7, name: 'CLK (flash)', label: 'CLK', type: 'spi', x: 0.06, y: 0.564 },
        { num: 8, name: 'GND', label: 'GND', type: 'ground', x: 0.06, y: 0.629 },
        { num: 9, name: '3V3', label: '3V3', type: 'power', x: 0.06, y: 0.693 },
        { num: 10, name: 'EN', label: 'EN', type: 'digital', x: 0.06, y: 0.757 },
        { num: 11, name: 'RST', label: 'RST', type: 'digital', x: 0.06, y: 0.821 },
        { num: 12, name: 'GND', label: 'GND', type: 'ground', x: 0.06, y: 0.886 },
        { num: 13, name: 'VIN', label: 'VIN', type: 'power', x: 0.06, y: 0.95 },
        { num: 14, name: 'D0/GPIO16', label: 'D0', type: 'digital', x: 0.94, y: 0.05 },
        { num: 15, name: 'D1/GPIO5 SCL', label: 'D1', type: 'i2c', x: 0.94, y: 0.114 },
        { num: 16, name: 'D2/GPIO4 SDA', label: 'D2', type: 'i2c', x: 0.94, y: 0.179 },
        { num: 17, name: 'D3/GPIO0', label: 'D3', type: 'digital', x: 0.94, y: 0.243 },
        { num: 18, name: 'D4/GPIO2', label: 'D4', type: 'digital', x: 0.94, y: 0.307 },
        { num: 19, name: '3V3', label: '3V3', type: 'power', x: 0.94, y: 0.371 },
        { num: 20, name: 'GND', label: 'GND', type: 'ground', x: 0.94, y: 0.436 },
        { num: 21, name: 'D5/GPIO14 SCK', label: 'D5', type: 'spi', x: 0.94, y: 0.5 },
        { num: 22, name: 'D6/GPIO12 MISO', label: 'D6', type: 'spi', x: 0.94, y: 0.564 },
        { num: 23, name: 'D7/GPIO13 MOSI', label: 'D7', type: 'spi', x: 0.94, y: 0.629 },
        { num: 24, name: 'D8/GPIO15 CS', label: 'D8', type: 'spi', x: 0.94, y: 0.693 },
        { num: 25, name: 'D9/GPIO3 RX', label: 'RX', type: 'uart', x: 0.94, y: 0.757 },
        { num: 26, name: 'D10/GPIO1 TX', label: 'TX', type: 'uart', x: 0.94, y: 0.821 },
        { num: 27, name: 'GND', label: 'GND', type: 'ground', x: 0.94, y: 0.886 },
        { num: 28, name: '3V3', label: '3V3', type: 'power', x: 0.94, y: 0.95 },
      ]
    },
    // Raspberry Pi Pico (RP2040). Sources: Raspberry Pi Pico pinout (datasheets.raspberrypi.com/pico/Pico-R3-A4-Pinout.pdf),
    // raspberrypi/documentation about_pico.adoc (pins 30–40), pico-sdk boards/pico.h (default UART0/I2C0/SPI0 pins).
    // num = the physical pin number (1–20 down the left side, 21–40 up the right side).
    'rpi-pico': {
      name: 'Raspberry Pi Pico',
      mcu: 'RP2040',
      voltage: '3.3V',
      frequency: '133 MHz',
      flash: '2 MB',
      ram: '264 KB',
      digitalPins: '26',
      analogPins: '3',
      pwmPins: '16 channels',
      usbInterface: 'Micro-USB',
      color: '#1a4a2a',
      pins: [
        { num: 1, name: 'GP0', label: 'GP0', type: 'uart', x: 0.06, y: 0.05 },
        { num: 2, name: 'GP1', label: 'GP1', type: 'uart', x: 0.06, y: 0.097 },
        { num: 3, name: 'GND', label: 'GND', type: 'ground', x: 0.06, y: 0.145 },
        { num: 4, name: 'GP2', label: 'GP2', type: 'digital', x: 0.06, y: 0.192 },
        { num: 5, name: 'GP3', label: 'GP3', type: 'digital', x: 0.06, y: 0.239 },
        { num: 6, name: 'GP4', label: 'GP4', type: 'i2c', x: 0.06, y: 0.287 },
        { num: 7, name: 'GP5', label: 'GP5', type: 'i2c', x: 0.06, y: 0.334 },
        { num: 8, name: 'GND', label: 'GND', type: 'ground', x: 0.06, y: 0.382 },
        { num: 9, name: 'GP6', label: 'GP6', type: 'digital', x: 0.06, y: 0.429 },
        { num: 10, name: 'GP7', label: 'GP7', type: 'digital', x: 0.06, y: 0.476 },
        { num: 11, name: 'GP8', label: 'GP8', type: 'digital', x: 0.06, y: 0.524 },
        { num: 12, name: 'GP9', label: 'GP9', type: 'digital', x: 0.06, y: 0.571 },
        { num: 13, name: 'GND', label: 'GND', type: 'ground', x: 0.06, y: 0.618 },
        { num: 14, name: 'GP10', label: 'GP10', type: 'digital', x: 0.06, y: 0.666 },
        { num: 15, name: 'GP11', label: 'GP11', type: 'digital', x: 0.06, y: 0.713 },
        { num: 16, name: 'GP12', label: 'GP12', type: 'digital', x: 0.06, y: 0.761 },
        { num: 17, name: 'GP13', label: 'GP13', type: 'digital', x: 0.06, y: 0.808 },
        { num: 18, name: 'GND', label: 'GND', type: 'ground', x: 0.06, y: 0.855 },
        { num: 19, name: 'GP14', label: 'GP14', type: 'digital', x: 0.06, y: 0.903 },
        { num: 20, name: 'GP15', label: 'GP15', type: 'digital', x: 0.06, y: 0.95 },
        { num: 40, name: 'VBUS', label: 'VBUS', type: 'power', x: 0.94, y: 0.05 },
        { num: 39, name: 'VSYS', label: 'VSYS', type: 'power', x: 0.94, y: 0.097 },
        { num: 38, name: 'GND', label: 'GND', type: 'ground', x: 0.94, y: 0.145 },
        { num: 37, name: '3V3_EN', label: '3V3_EN', type: 'digital', x: 0.94, y: 0.192 },
        { num: 36, name: '3V3(OUT)', label: '3V3', type: 'power', x: 0.94, y: 0.239 },
        { num: 35, name: 'ADC_VREF', label: 'ADC_VREF', type: 'analog', x: 0.94, y: 0.287 },
        { num: 34, name: 'GP28/ADC2', label: 'GP28', type: 'analog', x: 0.94, y: 0.334 },
        { num: 33, name: 'AGND', label: 'AGND', type: 'ground', x: 0.94, y: 0.382 },
        { num: 32, name: 'GP27/ADC1', label: 'GP27', type: 'analog', x: 0.94, y: 0.429 },
        { num: 31, name: 'GP26/ADC0', label: 'GP26', type: 'analog', x: 0.94, y: 0.476 },
        { num: 30, name: 'RUN', label: 'RUN', type: 'digital', x: 0.94, y: 0.524 },
        { num: 29, name: 'GP22', label: 'GP22', type: 'digital', x: 0.94, y: 0.571 },
        { num: 28, name: 'GND', label: 'GND', type: 'ground', x: 0.94, y: 0.618 },
        { num: 27, name: 'GP21', label: 'GP21', type: 'digital', x: 0.94, y: 0.666 },
        { num: 26, name: 'GP20', label: 'GP20', type: 'digital', x: 0.94, y: 0.713 },
        { num: 25, name: 'GP19', label: 'GP19', type: 'spi', x: 0.94, y: 0.761 },
        { num: 24, name: 'GP18', label: 'GP18', type: 'spi', x: 0.94, y: 0.808 },
        { num: 23, name: 'GND', label: 'GND', type: 'ground', x: 0.94, y: 0.855 },
        { num: 22, name: 'GP17', label: 'GP17', type: 'spi', x: 0.94, y: 0.903 },
        { num: 21, name: 'GP16', label: 'GP16', type: 'spi', x: 0.94, y: 0.95 },
      ]
    },
    // STM32 Nucleo-F401RE, ST morpho headers CN7 (left) and CN10 (right); NC pins left out. Sources: ST Nucleo-F401RE
    // morpho and Arduino header pinouts (as published in zephyr boards/st/nucleo_f401re/doc/img), stm32duino
    // variants/STM32F4xx/F401R(B-C-D-E)T/variant_NUCLEO_F401RE.h and boards.txt.
    'nucleo-f401re': {
      name: 'STM32 Nucleo-F401RE',
      mcu: 'STM32F401RE',
      voltage: '3.3V',
      frequency: '84 MHz',
      flash: '512 KB',
      ram: '96 KB',
      digitalPins: '50',
      analogPins: '16',
      pwmPins: '—',
      usbInterface: 'Mini-USB (ST-LINK)',
      color: '#2a2a3a',
      pins: [
        { num: 1, name: 'PC10', label: 'PC10', type: 'spi', x: 0.04, y: 0.05 },
        { num: 2, name: 'PC12', label: 'PC12', type: 'spi', x: 0.04, y: 0.1 },
        { num: 3, name: '3V3 (VDD)', label: 'VDD', type: 'power', x: 0.04, y: 0.15 },
        { num: 4, name: 'BOOT0', label: 'BOOT0', type: 'digital', x: 0.04, y: 0.2 },
        { num: 5, name: 'PA13 SWDIO', label: 'PA13', type: 'digital', x: 0.04, y: 0.35 },
        { num: 6, name: 'PA14 SWCLK', label: 'PA14', type: 'digital', x: 0.04, y: 0.4 },
        { num: 7, name: 'PA15', label: 'PA15', type: 'pwm', x: 0.04, y: 0.45 },
        { num: 8, name: 'GND', label: 'GND', type: 'ground', x: 0.04, y: 0.5 },
        { num: 9, name: 'PB7', label: 'PB7', type: 'i2c', x: 0.04, y: 0.55 },
        { num: 10, name: 'PC13', label: 'PC13', type: 'digital', x: 0.04, y: 0.6 },
        { num: 11, name: 'PC14', label: 'PC14', type: 'digital', x: 0.04, y: 0.65 },
        { num: 12, name: 'PC15', label: 'PC15', type: 'digital', x: 0.04, y: 0.7 },
        { num: 13, name: 'PH0', label: 'PH0', type: 'digital', x: 0.04, y: 0.75 },
        { num: 14, name: 'PH1', label: 'PH1', type: 'digital', x: 0.04, y: 0.8 },
        { num: 15, name: 'VBAT', label: 'VBAT', type: 'power', x: 0.04, y: 0.85 },
        { num: 16, name: 'PC2', label: 'PC2', type: 'analog', x: 0.04, y: 0.9 },
        { num: 17, name: 'PC3', label: 'PC3', type: 'analog', x: 0.04, y: 0.95 },
        { num: 18, name: 'PC11', label: 'PC11', type: 'spi', x: 0.09, y: 0.05 },
        { num: 19, name: 'PD2', label: 'PD2', type: 'digital', x: 0.09, y: 0.1 },
        { num: 20, name: 'E5V', label: 'E5V', type: 'power', x: 0.09, y: 0.15 },
        { num: 21, name: 'GND', label: 'GND', type: 'ground', x: 0.09, y: 0.2 },
        { num: 22, name: 'IOREF', label: 'IOREF', type: 'power', x: 0.09, y: 0.3 },
        { num: 23, name: 'NRST', label: 'NRST', type: 'digital', x: 0.09, y: 0.35 },
        { num: 24, name: '3V3', label: '3V3', type: 'power', x: 0.09, y: 0.4 },
        { num: 25, name: '5V', label: '5V', type: 'power', x: 0.09, y: 0.45 },
        { num: 26, name: 'GND', label: 'GND', type: 'ground', x: 0.09, y: 0.5 },
        { num: 27, name: 'GND', label: 'GND', type: 'ground', x: 0.09, y: 0.55 },
        { num: 28, name: 'VIN', label: 'VIN', type: 'power', x: 0.09, y: 0.6 },
        { num: 29, name: 'PA0/A0', label: 'A0', type: 'analog', x: 0.09, y: 0.7 },
        { num: 30, name: 'PA1/A1', label: 'A1', type: 'analog', x: 0.09, y: 0.75 },
        { num: 31, name: 'PA4/A2', label: 'A2', type: 'analog', x: 0.09, y: 0.8 },
        { num: 32, name: 'PB0/A3', label: 'A3', type: 'analog', x: 0.09, y: 0.85 },
        { num: 33, name: 'PC1/A4', label: 'A4', type: 'analog', x: 0.09, y: 0.9 },
        { num: 34, name: 'PC0/A5', label: 'A5', type: 'analog', x: 0.09, y: 0.95 },
        { num: 35, name: 'PC9', label: 'PC9', type: 'pwm', x: 0.91, y: 0.05 },
        { num: 36, name: 'PB8/D15', label: 'D15', type: 'i2c', x: 0.91, y: 0.1 },
        { num: 37, name: 'PB9/D14', label: 'D14', type: 'i2c', x: 0.91, y: 0.15 },
        { num: 38, name: 'AVDD', label: 'AVDD', type: 'power', x: 0.91, y: 0.2 },
        { num: 39, name: 'GND', label: 'GND', type: 'ground', x: 0.91, y: 0.25 },
        { num: 40, name: 'PA5/D13', label: 'D13', type: 'spi', x: 0.91, y: 0.3 },
        { num: 41, name: 'PA6/D12', label: 'D12', type: 'spi', x: 0.91, y: 0.35 },
        { num: 42, name: 'PA7/D11', label: 'D11', type: 'spi', x: 0.91, y: 0.4 },
        { num: 43, name: 'PB6/D10', label: 'D10', type: 'pwm', x: 0.91, y: 0.45 },
        { num: 44, name: 'PC7/D9', label: 'D9', type: 'pwm', x: 0.91, y: 0.5 },
        { num: 45, name: 'PA9/D8', label: 'D8', type: 'uart', x: 0.91, y: 0.55 },
        { num: 46, name: 'PA8/D7', label: 'D7', type: 'pwm', x: 0.91, y: 0.6 },
        { num: 47, name: 'PB10/D6', label: 'D6', type: 'pwm', x: 0.91, y: 0.65 },
        { num: 48, name: 'PB4/D5', label: 'D5', type: 'pwm', x: 0.91, y: 0.7 },
        { num: 49, name: 'PB5/D4', label: 'D4', type: 'pwm', x: 0.91, y: 0.75 },
        { num: 50, name: 'PB3/D3', label: 'D3', type: 'pwm', x: 0.91, y: 0.8 },
        { num: 51, name: 'PA10/D2', label: 'D2', type: 'uart', x: 0.91, y: 0.85 },
        { num: 52, name: 'PA2/D1', label: 'D1', type: 'uart', x: 0.91, y: 0.9 },
        { num: 53, name: 'PA3/D0', label: 'D0', type: 'uart', x: 0.91, y: 0.95 },
        { num: 54, name: 'PC8', label: 'PC8', type: 'pwm', x: 0.96, y: 0.05 },
        { num: 55, name: 'PC6', label: 'PC6', type: 'uart', x: 0.96, y: 0.1 },
        { num: 56, name: 'PC5', label: 'PC5', type: 'analog', x: 0.96, y: 0.15 },
        { num: 57, name: 'U5V', label: 'U5V', type: 'power', x: 0.96, y: 0.2 },
        { num: 58, name: 'PA12', label: 'PA12', type: 'uart', x: 0.96, y: 0.3 },
        { num: 59, name: 'PA11', label: 'PA11', type: 'uart', x: 0.96, y: 0.35 },
        { num: 60, name: 'PB12', label: 'PB12', type: 'spi', x: 0.96, y: 0.4 },
        { num: 61, name: 'GND', label: 'GND', type: 'ground', x: 0.96, y: 0.5 },
        { num: 62, name: 'PB2', label: 'PB2', type: 'digital', x: 0.96, y: 0.55 },
        { num: 63, name: 'PB1', label: 'PB1', type: 'analog', x: 0.96, y: 0.6 },
        { num: 64, name: 'PB15', label: 'PB15', type: 'spi', x: 0.96, y: 0.65 },
        { num: 65, name: 'PB14', label: 'PB14', type: 'spi', x: 0.96, y: 0.7 },
        { num: 66, name: 'PB13', label: 'PB13', type: 'spi', x: 0.96, y: 0.75 },
        { num: 67, name: 'AGND', label: 'AGND', type: 'ground', x: 0.96, y: 0.8 },
        { num: 68, name: 'PC4', label: 'PC4', type: 'analog', x: 0.96, y: 0.85 },
      ]
    },
  };

  /* ── Datasheets ─────────────────────────────────────────────── */
  const datasheets = [
    {
      componentId: 'atmega328p',
      name: 'ATmega328P',
      manufacturer: 'Microchip Technology',
      revision: 'Rev. DS40002061B',
      pages: 294,
      sections: {
        overview: {
          title: 'Overview',
          content: `The ATmega328P is a low-power CMOS 8-bit microcontroller based on the AVR enhanced RISC architecture. By executing powerful instructions in a single clock cycle, the ATmega328P achieves throughputs approaching 1 MIPS per MHz allowing the system designer to optimize power consumption versus processing speed.

The AVR core combines a rich instruction set with 32 general purpose working registers. All the 32 registers are directly connected to the Arithmetic Logic Unit (ALU), allowing two independent registers to be accessed in one single instruction executed in one clock cycle.

The ATmega328P provides the following features: 32K bytes of In-System Programmable Flash Program memory with Read-While-Write capabilities, 1024 bytes EEPROM, 2K bytes SRAM, 23 general purpose I/O lines, 32 general purpose working registers, three flexible Timer/Counters with compare modes, internal and external interrupts, a serial programmable USART, a byte-oriented 2-wire Serial Interface, a Serial Peripheral Interface (SPI), a 6-channel 10-bit Analog-to-Digital Converter (ADC) with optional differential input stage with programmable gain, a programmable Watchdog Timer with internal Oscillator, an SPI serial port, and five software selectable power saving modes.`,
          highlights: [
            'High Performance, Low Power AVR® 8-Bit Microcontroller',
            '32 Kbytes of In-System Self-Programmable Flash program memory',
            '1024 Bytes EEPROM, 2 Kbytes Internal SRAM',
            '23 Programmable I/O Lines',
            '32 x 8 General Purpose Working Registers',
            'Real Time Counter with Separate Oscillator',
            'Three flexible Timer/Counters with compare modes and PWM',
            'USART, SPI, TWI (I2C) serial interfaces',
            '6-channel 10-bit ADC',
            'Programmable Watchdog Timer',
            'Power-on Reset and Programmable Brown-out Detection',
            'Internal Calibrated Oscillator',
            'Operating Voltage: 1.8–5.5V',
            'Speed Grade: 0–4 MHz @ 1.8–5.5V, 0–10 MHz @ 2.7–5.5V, 0–20 MHz @ 4.5–5.5V',
          ]
        },
        electrical: {
          title: 'Electrical Characteristics',
          specs: [
            { param: 'Supply Voltage',          min: '1.8',  typ: '5.0',  max: '5.5',  unit: 'V' },
            { param: 'Operating Temperature',   min: '-40',  typ: '25',   max: '85',   unit: '°C' },
            { param: 'Max Clock Frequency',     min: '—',    typ: '16',   max: '20',   unit: 'MHz' },
            { param: 'Active Current (4MHz)',    min: '—',    typ: '0.5',  max: '—',    unit: 'mA' },
            { param: 'Active Current (8MHz)',    min: '—',    typ: '0.9',  max: '—',    unit: 'mA' },
            { param: 'Active Current (16MHz)',   min: '—',    typ: '1.8',  max: '—',    unit: 'mA' },
            { param: 'Power-down Mode',          min: '—',    typ: '0.1',  max: '—',    unit: 'µA' },
            { param: 'Power-save Mode',          min: '—',    typ: '0.75', max: '—',    unit: 'µA' },
            { param: 'I/O Pin Source Current',   min: '—',    typ: '—',    max: '40',   unit: 'mA' },
            { param: 'I/O Pin Sink Current',     min: '—',    typ: '—',    max: '40',   unit: 'mA' },
            { param: 'ADC Resolution',           min: '—',    typ: '10',   max: '—',    unit: 'bits' },
            { param: 'ADC Conversion Time',      min: '13',   typ: '—',    max: '260',  unit: 'µs' },
            { param: 'Internal Oscillator',      min: '7.3',  typ: '8.0',  max: '8.8',  unit: 'MHz' },
            { param: 'Flash Write Cycles',       min: '—',    typ: '10000',max: '—',    unit: 'cycles' },
            { param: 'EEPROM Write Cycles',      min: '—',    typ: '100000',max: '—',   unit: 'cycles' },
          ]
        },
        examples: {
          title: 'Code Examples',
          examples: [
            {
              title: 'Blink LED on Pin 13 (Arduino)',
              code: `void setup() {
  pinMode(13, OUTPUT);
}

void loop() {
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`
            },
            {
              title: 'Read Analog Value (ADC)',
              code: `void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(A0);
  float voltage = sensorValue * (5.0 / 1023.0);
  Serial.print("ADC: ");
  Serial.print(sensorValue);
  Serial.print("  Voltage: ");
  Serial.println(voltage);
  delay(500);
}`
            },
            {
              title: 'I2C Communication',
              code: `#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
}

void loop() {
  Wire.beginTransmission(0x68); // MPU-6050 address
  Wire.write(0x3B);             // Starting register
  Wire.endTransmission(false);
  Wire.requestFrom(0x68, 6, true);
  
  int16_t ax = Wire.read() << 8 | Wire.read();
  int16_t ay = Wire.read() << 8 | Wire.read();
  int16_t az = Wire.read() << 8 | Wire.read();
  
  Serial.print("X:"); Serial.print(ax);
  Serial.print(" Y:"); Serial.print(ay);
  Serial.print(" Z:"); Serial.println(az);
  delay(100);
}`
            }
          ]
        },
        package: {
          title: 'Package Information',
          packages: [
            { name: 'DIP-28',   width: '7.62 mm', length: '35.56 mm', height: '4.57 mm' },
            { name: 'TQFP-32',  width: '7.0 mm',  length: '7.0 mm',   height: '1.0 mm' },
            { name: 'MLF-32',   width: '5.0 mm',  length: '5.0 mm',   height: '0.9 mm' },
          ]
        },
        timing: {
          title: 'Timing Diagrams',
          description: 'SPI timing: CPOL=0, CPHA=0 (Mode 0). Data sampled on rising edge, shifted on falling edge. Maximum SPI clock: Fosc/4 = 4 MHz at 16 MHz system clock. I2C timing: Standard mode 100 kHz, Fast mode 400 kHz. UART: Asynchronous, 8N1 default, baud rates up to 2 Mbps.'
        },
        memory: {
          title: 'Memory Map',
          description: 'Flash: 0x0000–0x7FFF (32KB program memory). SRAM: 0x0100–0x08FF (2KB data memory). EEPROM: 0x0000–0x03FF (1KB). I/O Registers: 0x0020–0x00FF. Extended I/O: 0x0060–0x00FF. The first 32 locations address the Register File, the next 64 location the standard I/O memory, then 160 locations of Extended I/O memory, and finally the 2048 locations of internal data SRAM.'
        }
      }
    },
    {
      componentId: 'esp32-wroom',
      name: 'ESP32-WROOM-32',
      manufacturer: 'Espressif Systems',
      revision: 'v3.2',
      pages: 42,
      sections: {
        overview: {
          title: 'Overview',
          content: `ESP32-WROOM-32 is a powerful, generic Wi-Fi+BT+BLE MCU module that targets a wide variety of applications, ranging from low-power sensor networks to the most demanding tasks, such as voice encoding, music streaming and MP3 decoding.

At the core of this module is the ESP32-D0WDQ6 chip. The chip embedded is designed to be scalable and adaptive. There are two CPU cores that can be individually controlled, and the CPU clock frequency is adjustable from 80 MHz to 240 MHz. The chip also has a low-power coprocessor that can be used instead of the CPU to save power while performing tasks that do not require much computing power, such as monitoring of peripherals.

ESP32 integrates a rich set of peripherals, ranging from capacitive touch sensors, Hall sensors, SD card interface, Ethernet, high-speed SPI, UART, I2S and I2C.`,
          highlights: [
            'Xtensa® dual-core 32-bit LX6 microprocessor, up to 240 MHz',
            '448 KB ROM, 520 KB SRAM, 16 KB SRAM in RTC',
            '4 MB SPI flash (embedded in module)',
            '802.11 b/g/n Wi-Fi, 2.4 GHz, up to 150 Mbps',
            'Bluetooth v4.2 BR/EDR and BLE',
            '34 × programmable GPIOs',
            '12-bit SAR ADC, up to 18 channels',
            '2 × 8-bit DAC',
            '10 × touch sensors',
            '4 × SPI, 2 × I2S, 2 × I2C, 3 × UART',
            'SD/SDIO/CE-ATA/MMC/eMMC host controller',
            'SDIO/SPI slave controller',
            'Ethernet MAC interface with dedicated DMA',
            'CAN bus 2.0',
            'IR (TX/RX)',
            'Motor PWM, LED PWM up to 16 channels',
            'Hall sensor, temperature sensor',
          ]
        },
        electrical: {
          title: 'Electrical Characteristics',
          specs: [
            { param: 'Operating Voltage',        min: '3.0',  typ: '3.3',  max: '3.6',  unit: 'V' },
            { param: 'Operating Temperature',    min: '-40',  typ: '25',   max: '85',   unit: '°C' },
            { param: 'TX Current (802.11b)',      min: '—',    typ: '380',  max: '—',    unit: 'mA' },
            { param: 'TX Current (802.11n)',      min: '—',    typ: '260',  max: '—',    unit: 'mA' },
            { param: 'RX Current',               min: '—',    typ: '100',  max: '—',    unit: 'mA' },
            { param: 'Modem Sleep',              min: '—',    typ: '15',   max: '—',    unit: 'mA' },
            { param: 'Light Sleep',              min: '—',    typ: '0.8',  max: '—',    unit: 'mA' },
            { param: 'Deep Sleep',               min: '—',    typ: '0.01', max: '—',    unit: 'mA' },
            { param: 'GPIO Output Current',      min: '—',    typ: '—',    max: '40',   unit: 'mA' },
            { param: 'ADC Resolution',           min: '—',    typ: '12',   max: '—',    unit: 'bits' },
            { param: 'ADC Sampling Rate',        min: '—',    typ: '—',    max: '2',    unit: 'Msps' },
            { param: 'Wi-Fi Frequency',          min: '2.412',typ: '—',    max: '2.484',unit: 'GHz' },
            { param: 'Wi-Fi TX Power',           min: '—',    typ: '—',    max: '21',   unit: 'dBm' },
            { param: 'BLE TX Power',             min: '-12',  typ: '—',    max: '9',    unit: 'dBm' },
          ]
        },
        examples: {
          title: 'Code Examples',
          examples: [
            {
              title: 'WiFi Connection',
              code: `#include <WiFi.h>

const char* ssid = "YourSSID";
const char* password = "YourPassword";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\\nConnected!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}`
            },
            {
              title: 'Deep Sleep with Timer Wakeup',
              code: `#define uS_TO_S_FACTOR 1000000ULL
#define TIME_TO_SLEEP  5  // seconds

void setup() {
  Serial.begin(115200);
  Serial.println("Waking up...");
  
  // Do work here
  
  esp_sleep_enable_timer_wakeup(
    TIME_TO_SLEEP * uS_TO_S_FACTOR
  );
  Serial.println("Going to sleep...");
  esp_deep_sleep_start();
}`
            }
          ]
        },
        package: {
          title: 'Package Information',
          packages: [
            { name: 'SMD-38', width: '18.0 mm', length: '25.5 mm', height: '3.1 mm' },
          ]
        },
        timing: {
          title: 'RF Timing',
          description: 'Wi-Fi: 802.11 b/g/n, 2.4 GHz band, channels 1-13. DTIM interval: 1-10 beacon intervals. Beacon interval: 100 ms default. BLE: Advertising interval 20ms-10.24s. Connection interval 7.5ms-4s. Slave latency 0-499. Supervision timeout 100ms-32s.'
        },
        memory: {
          title: 'Memory Map',
          description: 'Internal ROM: 448 KB (program). Internal SRAM: 520 KB (data + instructions). RTC SRAM: 16 KB (fast) + 8 KB (slow). External Flash: 4 MB (via SPI). External PSRAM: optional 4/8 MB. DMA: all major peripherals support DMA. Cache: 32 KB instruction cache, 32 KB data cache per core.'
        }
      }
    }
  ];

  /* ── Sample Projects ────────────────────────────────────────── */
  const projects = [
    {
      id: 'weather-station',
      name: 'IoT Weather Station',
      description: 'ESP32-based weather station with BME280 sensor, OLED display, and cloud data logging via MQTT.',
      icon: '🌤',
      color: '#00d4ff',
      tags: ['IoT', 'ESP32', 'MQTT', 'Sensors'],
      components: ['esp32-wroom', 'mpu6050'],
      lastModified: '2 days ago'
    },
    {
      id: 'robot-arm',
      name: 'Servo Robot Arm',
      description: '6-DOF robot arm controlled by Arduino Mega with inverse kinematics and PS2 controller input.',
      icon: '🦾',
      color: '#7b2fff',
      tags: ['Robotics', 'Servo', 'Arduino', 'IK'],
      components: ['atmega328p', 'l298n'],
      lastModified: '1 week ago'
    },
    {
      id: 'audio-viz',
      name: 'Audio Visualizer',
      description: 'Real-time audio spectrum analyzer using STM32 with FFT processing and LED matrix display.',
      icon: '🎵',
      color: '#ff9500',
      tags: ['Audio', 'FFT', 'STM32', 'LED'],
      components: ['stm32f103', 'lm358'],
      lastModified: '3 days ago'
    },
    {
      id: 'drone-fc',
      name: 'Drone Flight Controller',
      description: 'Custom flight controller with MPU-6050 IMU, PID control loops, and nRF24L01 radio link.',
      icon: '🚁',
      color: '#00ff88',
      tags: ['Drone', 'PID', 'IMU', 'RF'],
      components: ['mpu6050', 'nrf24l01', 'atmega328p'],
      lastModified: '5 days ago'
    },
    {
      id: 'smart-lock',
      name: 'Smart Door Lock',
      description: 'RFID + fingerprint door lock with ESP32, relay control, and mobile app via BLE.',
      icon: '🔐',
      color: '#ff2d78',
      tags: ['Security', 'RFID', 'BLE', 'ESP32'],
      components: ['esp32-wroom'],
      lastModified: '1 day ago'
    },
    {
      id: 'oscilloscope',
      name: 'DIY Oscilloscope',
      description: '2-channel oscilloscope using STM32 ADC at 1 Msps with TFT display and USB data export.',
      icon: '📊',
      color: '#ffd700',
      tags: ['Test Equipment', 'ADC', 'STM32', 'TFT'],
      components: ['stm32f103', 'lm358'],
      lastModified: '2 weeks ago'
    },
  ];

  /* ── AI Responses ───────────────────────────────────────────── */
  const aiResponses = {
    'What resistor do I need for an LED at 5V?': `**LED Resistor Calculator**

For a standard red LED at 5V:

**Formula:** R = (Vsupply - Vled) / Iled

**Typical values:**
- Red LED: Vf = 2.0V, If = 20mA
- Green LED: Vf = 2.2V, If = 20mA  
- Blue/White LED: Vf = 3.2V, If = 20mA

**Calculation for Red LED at 5V:**
\`\`\`
R = (5V - 2.0V) / 0.020A
R = 3.0V / 0.020A
R = 150Ω
\`\`\`

Use **150Ω** (or 220Ω for slightly dimmer, safer operation).

**Standard resistor values:** 150Ω, 220Ω, 330Ω

⚠️ Always use a current-limiting resistor — never connect an LED directly to power!`,

    'How do I wire an I2C sensor to Arduino?': `**I2C Wiring Guide for Arduino**

**Connections:**
| Sensor | Arduino Uno |
|--------|-------------|
| VCC    | 3.3V or 5V  |
| GND    | GND         |
| SDA    | A4 (Pin 27) |
| SCL    | A5 (Pin 28) |

**Pull-up Resistors:**
Add 4.7kΩ resistors from SDA→VCC and SCL→VCC (often built into modules).

**Arduino Code:**
\`\`\`cpp
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  
  // Scan for I2C devices
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("Found device at 0x");
      Serial.println(addr, HEX);
    }
  }
}
\`\`\`

**Common I2C Addresses:**
- MPU-6050: 0x68 or 0x69
- SSD1306 OLED: 0x3C or 0x3D
- BMP280: 0x76 or 0x77
- PCF8574: 0x20–0x27`,

    'Generate Arduino blink code': `**Arduino Blink — Multiple Variations**

**Basic Blink:**
\`\`\`cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
\`\`\`

**Non-blocking Blink (millis):**
\`\`\`cpp
const int LED_PIN = 13;
const long INTERVAL = 500;

unsigned long previousMillis = 0;
bool ledState = false;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= INTERVAL) {
    previousMillis = currentMillis;
    ledState = !ledState;
    digitalWrite(LED_PIN, ledState);
  }
  // Other code can run here without blocking!
}
\`\`\`

**PWM Fade:**
\`\`\`cpp
void loop() {
  for (int i = 0; i <= 255; i++) {
    analogWrite(9, i);
    delay(5);
  }
  for (int i = 255; i >= 0; i--) {
    analogWrite(9, i);
    delay(5);
  }
}
\`\`\``,

    'Explain how an ESP32 works': `**ESP32 Architecture Overview**

The ESP32 is a dual-core 32-bit microcontroller with integrated Wi-Fi and Bluetooth.

**CPU Cores:**
- **PRO_CPU** (Core 0): Handles Wi-Fi/BT stack
- **APP_CPU** (Core 1): Your application code
- Both run at up to **240 MHz** (Xtensa LX6)

**Memory:**
- 520 KB SRAM (data)
- 448 KB ROM (bootloader + libraries)
- 4 MB Flash (your code + data)
- 16 KB RTC SRAM (survives deep sleep)

**Wireless:**
- **Wi-Fi:** 802.11 b/g/n, 2.4 GHz, up to 150 Mbps
- **Bluetooth:** Classic 4.2 + BLE 4.2

**Power Modes:**
| Mode | Current | Wake Source |
|------|---------|-------------|
| Active | ~240 mA | — |
| Modem Sleep | ~15 mA | Timer |
| Light Sleep | ~0.8 mA | GPIO, Timer |
| Deep Sleep | ~10 µA | Timer, GPIO, Touch |

**Key Peripherals:**
- 34 GPIO pins (some input-only)
- 18-channel 12-bit ADC
- 2-channel 8-bit DAC
- 10 capacitive touch inputs
- Hardware crypto (AES, SHA, RSA)`,

    'SPI vs I2C': `**SPI vs I2C Comparison**

| Feature | SPI | I2C |
|---------|-----|-----|
| Wires | 4 (MOSI, MISO, SCK, CS) | 2 (SDA, SCL) |
| Speed | Up to 80 MHz | 100k–3.4M bps |
| Devices | One CS per device | Up to 127 addresses |
| Duplex | Full duplex | Half duplex |
| Distance | Short (<1m) | Short (<1m) |
| Complexity | Simple | Moderate |

**Use SPI when:**
- High speed needed (displays, SD cards, ADCs)
- Full-duplex communication required
- Only a few devices on the bus

**Use I2C when:**
- Many devices on same bus
- Fewer wires is important
- Speed < 400 kHz is acceptable
- Sensors, EEPROMs, RTCs

**SPI Wiring (Arduino):**
- MOSI → Pin 11
- MISO → Pin 12  
- SCK  → Pin 13
- CS   → Any digital pin

**I2C Wiring (Arduino):**
- SDA → A4
- SCL → A5`,

    'PWM frequency': `**PWM on Microcontrollers**

**What is PWM?**
Pulse Width Modulation varies the duty cycle of a digital signal to simulate analog output.

**Key Parameters:**
- **Frequency:** How fast the signal cycles (Hz)
- **Duty Cycle:** % of time signal is HIGH (0–100%)
- **Resolution:** Number of steps (8-bit = 256 steps)

**Arduino PWM:**
\`\`\`cpp
// analogWrite: 8-bit, ~490 Hz (pins 5,6: ~980 Hz)
analogWrite(9, 128);  // 50% duty cycle

// Change frequency with Timer registers:
// Timer 1 (pins 9, 10) - 16-bit
TCCR1B = TCCR1B & 0b11111000 | 0x01; // 31372 Hz
TCCR1B = TCCR1B & 0b11111000 | 0x04; // 490 Hz (default)
\`\`\`

**ESP32 LEDC PWM:**
\`\`\`cpp
const int freq = 5000;    // 5 kHz
const int channel = 0;
const int resolution = 8; // 8-bit

ledcSetup(channel, freq, resolution);
ledcAttachPin(LED_PIN, channel);
ledcWrite(channel, 128);  // 50% duty
\`\`\`

**Common Applications:**
- LED dimming: 1–10 kHz
- Motor control: 20–50 kHz
- Audio: 44.1 kHz+
- Servo: 50 Hz, 1–2ms pulse`,
  };

  /* ── Public API ─────────────────────────────────────────────── */
  return {
    components,
    boards,
    datasheets,
    projects,
    aiResponses,
  };
})();
