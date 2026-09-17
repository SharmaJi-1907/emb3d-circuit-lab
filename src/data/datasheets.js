/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Datasheets: the sections shown in the Datasheet Viewer
   Part of window.CircuitLabData (see data/index.js)
═══════════════════════════════════════════════════════════════════ */

export const datasheets = [
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
