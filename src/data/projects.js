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
