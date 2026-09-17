/* ═══════════════════════════════════════════════════════════════════
   CIRCUITLAB — Stored AI answers, keyed by the question they answer
   Part of window.CircuitLabData (see data/index.js)
═══════════════════════════════════════════════════════════════════ */

export const aiResponses = {
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

  'How do I connect the RESET pin?': `**Connecting the RESET Pin (ATmega328P / Arduino Uno)**

RESET is **active LOW** — pulling it to GND restarts the chip. Leave it HIGH to run.

**The basics:**
| What | Value |
|------|-------|
| Idle level | HIGH (tied to VCC) |
| Reset level | LOW |
| Threshold (VRST) | 0.2 VCC to 0.9 VCC |
| Minimum LOW pulse | 2.5 µs |
| Internal pull-up | 30–60 kΩ |

**Wiring a reset button:**
\`\`\`
VCC ---[ 10k ]--- RESET ---[ button ]--- GND
\`\`\`

The chip has its own 30–60 kΩ pull-up, but an external **10 kΩ** is standard: it is
stiffer and keeps the pin from picking up noise. Never leave RESET floating, and never
drive it above VCC.

**Auto-reset when uploading:**
Arduino boards join the USB chip's DTR line to RESET through a **100 nF** capacitor, so
opening the serial port gives one short LOW pulse and the bootloader starts.
To stop a board resetting when the Serial Monitor opens, put a **10 µF** capacitor
between RESET and GND (remove it before the next upload).

⚠️ RESET can be turned into a plain I/O pin with the **RSTDISBL** fuse — do not do this
unless you have a high-voltage programmer, because it locks out normal ISP programming.

_Values from the Microchip ATmega328/P datasheet, Electrical Characteristics
("Reset, Brown-out and Internal Voltage Characteristics")._`,

  'What is the timing equation for NE555 Astable Mode?': `**NE555 Astable (Free-Running) Timing**

In astable mode C charges through **RA + RB** and discharges through **RB** only.

**The equations:**
\`\`\`
tH = 0.693 × (RA + RB) × C     (output HIGH)
tL = 0.693 × RB × C            (output LOW)

T  = tH + tL = 0.693 × (RA + 2RB) × C

           1.44
f = 1/T = --------------
          (RA + 2RB) × C

Duty cycle (HIGH) = (RA + RB) / (RA + 2RB)
\`\`\`

**Worked example** — RA = 10 kΩ, RB = 10 kΩ, C = 10 µF:
\`\`\`
f = 1.44 / ((10000 + 20000) × 0.00001) = 4.8 Hz
Duty = (10k + 10k) / (10k + 20k) = 67%
\`\`\`

**Things to know:**
- Duty cycle is always **above 50%**, because the charge path is longer than the
  discharge path. Add a diode across RB to get 50% or less.
- C swings between about **0.33 × VCC** and **0.67 × VCC**, so timing does not change
  with supply voltage.
- Keep it at **100 kHz or below**; above that use a TLC555 (CMOS).
- VCC range: 5 V to 15 V.

_Equations from the Texas Instruments NE555 datasheet (SLFS022), "Astable Operation"._`,

  'Can ESP32 pins tolerate 5V signals?': `**ESP32 and 5 V — the short answer: no.**

ESP32 GPIOs are **not 5 V tolerant**. The absolute maximum on a pin is **3.6 V**.
Anything above that can damage the chip permanently.

**The numbers:**
| Parameter | Value |
|-----------|-------|
| Absolute max input | **3.6 V** |
| Supply (VDD) | 3.0–3.6 V (3.3 V typical) |
| Logic HIGH in (VIH) | 0.75 × VDD ≈ **2.48 V** and up |
| Logic LOW in (VIL) | up to 0.25 × VDD ≈ **0.83 V** |
| Internal pull-up | ≈ 45 kΩ |

**Reading a 5 V output safely** — a resistor divider is enough for slow signals:
\`\`\`
5V signal ---[ 10k ]---+--- ESP32 GPIO (3.3V)
                       |
                     [ 20k ]
                       |
                      GND

Vout = 5V × 20k / (10k + 20k) = 3.33V
\`\`\`
For I2C or anything fast, use a proper **bidirectional level shifter** (for example a
BSS138-based board) instead of a divider.

**Driving a 5 V input from the ESP32:** often it just works, because the ESP32's 3.3 V
HIGH is above most 5 V parts' VIH of 2.0 V (TTL). Check the receiving part's datasheet —
CMOS inputs needing 0.7 × VCC = 3.5 V will **not** see it.

⚠️ The 5 V (VIN) pin on a dev board is only for power. It is not a 5 V tolerant I/O.

_Values from the Espressif ESP32 Series Datasheet, "Absolute Maximum Ratings" and
"DC Characteristics"._`,
};
