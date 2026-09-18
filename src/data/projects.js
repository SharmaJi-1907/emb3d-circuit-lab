/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Sample projects for the Dashboard and the Projects screen
   Part of window.CircuitLabData (see data/index.js)
═══════════════════════════════════════════════════════════════════ */

export const projects = [
  {
    id: 'weather-station',
    name: 'IoT Weather Station',
    description: 'ESP32-based weather station with BME280 sensor, OLED display, and cloud data logging via MQTT.',
    icon: '🌤',
    color: 'cyan', // the card's accent: a design token name (--cyan)
    tags: ['IoT', 'ESP32', 'MQTT', 'Sensors'],
    components: ['esp32-wroom']
  },
  {
    id: 'robot-arm',
    name: 'Servo Robot Arm',
    description: '6-DOF robot arm controlled by an Arduino Uno (ATmega328P) with inverse kinematics and PS2 controller input.',
    icon: '🦾',
    color: 'purple',
    tags: ['Robotics', 'Servo', 'Arduino', 'IK'],
    components: ['atmega328p', 'l298n']
  },
  {
    id: 'audio-viz',
    name: 'Audio Visualizer',
    description: 'Real-time audio spectrum analyzer using STM32 with FFT processing and LED matrix display.',
    icon: '🎵',
    color: 'orange',
    tags: ['Audio', 'FFT', 'STM32', 'LED'],
    components: ['stm32f103', 'lm358']
  },
  {
    id: 'drone-fc',
    name: 'Drone Flight Controller',
    description: 'Custom flight controller with MPU-6050 IMU, PID control loops, and nRF24L01 radio link.',
    icon: '🚁',
    color: 'green',
    tags: ['Drone', 'PID', 'IMU', 'RF'],
    components: ['mpu6050', 'nrf24l01', 'atmega328p']
  },
  {
    id: 'smart-lock',
    name: 'Smart Door Lock',
    description: 'RFID + fingerprint door lock with ESP32, relay control, and mobile app via BLE.',
    icon: '🔐',
    color: 'pink',
    tags: ['Security', 'RFID', 'BLE', 'ESP32'],
    components: ['esp32-wroom']
  },
  {
    id: 'oscilloscope',
    name: 'DIY Oscilloscope',
    description: '2-channel oscilloscope using STM32 ADC at 1 Msps with TFT display and USB data export.',
    icon: '📊',
    color: 'gold',
    tags: ['Test Equipment', 'ADC', 'STM32', 'TFT'],
    components: ['stm32f103', 'lm358']
  },
];
