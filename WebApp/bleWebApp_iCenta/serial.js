class SerialTerminal {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.keepReading = false;
    this.onDataArrival = null; // Callback for data arrival event
  }

  async connect(baud, dataBits, parity, stopBits, flowControl) {
    if (!this.port) {
      await this.requestPort();
      if (!this.port) {
        throw new Error('No port selected after request.');
      }
    }
    const options = {
      baudRate: baud,
      dataBits: dataBits,
      parity: parity,
      stopBits: stopBits,
      flowControl: flowControl,
    };

    console.log (options)
    try {
      await this.port.open(options);
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.keepReading = true;
      this.readLoop();
      return { success: true, message: 'Connected' };
    } catch (error) {
      throw new Error(`Connection error: ${error}`);
    }
  }

  async disconnect() {
    this.keepReading = false;
    if (this.reader) await this.reader.cancel();
    if (this.writer) await this.writer.close();
    await this.port.close();
    this.port = null;
    return { success: true, message: 'Disconnected' };
  }

async readLoop() {
    while (this.keepReading && this.port?.readable) {
      try {
        const { value, done } = await this.reader.read();
        if (done) {
          this.reader.releaseLock();
          break;
        }
        if (value) {
          const decodedData = new TextDecoder().decode(value);
          // console.log([decodedData]); // Debug output matching your example
          this.inString += decodedData; // Append incoming data to inString
          const lines = this.inString.split('\n');
          // Process all complete lines except the last one (which may be partial)
          for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i] && this.onDataArrival) {
              this.onDataArrival(lines[i]); // Trigger for each complete line
              console.log([lines[i]]); // Debug output          
            }
          }
          // Keep the last line (potential partial line) in inString
          this.inString = lines[lines.length - 1];
        }
      } catch (error) {
        console.error(`Read error: ${error}`);
        break;
      }
    }
    // Process any remaining data when loop ends
    if (this.inString && this.onDataArrival) {
      if (this.inString.trim()) {
        this.onDataArrival(this.inString); // Handle any leftover data
        console.log([this.inString]); // Debug output           
      }
      this.inString = '';
    }
  }
  
  async sendData(data) {
    if (this.writer && this.port?.writable) {
      try {
        await this.writer.write(new TextEncoder().encode(data));
        return { success: true, message: 'Data sent' };
      } catch (error) {
        throw new Error(`Write error: ${error}`);
      }
    }
    throw new Error('No active writer or port.');
  }

  setOnDataArrival(callback) {
    this.onDataArrival = callback;
  }

  async requestPort() {
    try {
      this.port = await navigator.serial.requestPort({});
      console.log('Port selected.');
    } catch (e) {
      if (e && e.name !== 'NotFoundError') {
        throw new Error(`requestPort: ${e.message}`);
      }
    }
  }

  async listPorts() {
    try {
      const ports = await navigator.serial.getPorts();
      if (!ports.length) {
        console.log('No saved ports. Use "Select Port…"');
        return;
      }
      ports.forEach((p, i) => console.log(`Saved port #${i + 1}`));
    } catch (e) {
      throw new Error(`getPorts: ${e.message}`);
    }
  }
}

// Example usage (uncomment to test)
// const terminal = new SerialTerminal();
// (async () => {
//   try {
//     terminal.setOnDataArrival((data) => console.log('Data arrived:', data));
//     await terminal.connect(115200, 8, 'none', 1, 'none');
//     await terminal.sendData('Hello\n');
//     await terminal.listPorts();
//     // ... other operations ...
//     await terminal.disconnect();
//   } catch (error) {
//     console.error(error.message);
//   }
// })();