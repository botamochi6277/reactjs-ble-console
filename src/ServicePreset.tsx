const imu_6_axis: ServicePreset = {
    name: "Arduino IMU",
    uuid: "ABF0E000-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(),
    characteristics: [
        { name: "timer", uuid: "ABF0E001-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "uint32", unit: "sec", little_endian: true },
        { name: "acc x", uuid: "ABF0E002-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
        { name: "acc y", uuid: "ABF0E003-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
        { name: "acc z", uuid: "ABF0E004-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
        { name: "gyro x", uuid: "ABF0E005-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
        { name: "gyro y", uuid: "ABF0E006-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
        { name: "gyro z", uuid: "ABF0E007-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
        { name: "temperature", uuid: "ABF0E008-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "°C", little_endian: true },
    ]
}

const heart_rate: ServicePreset = {
    name: "Heart Rate",
    uuid: "0x180d",
    characteristics: [
        { name: "heart rate measurement", uuid: "00002a37-0000-1000-8000-00805f9b34fb", type: "uint16", unit: "bpm", little_endian: true },//"0x2a37"
        { name: "body sensor location", uuid: "00002a38-0000-1000-8000-00805f9b34fb", type: "int16", unit: "", little_endian: true }//0x2a39
    ]
}

const stackchan: ServicePreset = {
    name: "Stack-chan",
    uuid: "671e0000-8cef-46b7-8af3-2eddeb12803e",
    characteristics: []
}
const neopixel: ServicePreset = {
    name: "NeoPixel",
    uuid: "19B10000-E8F2-537E-4F6C-D104768A1214".toLowerCase(),
    characteristics: []
}

const service_preset: ServicePreset[] = [imu_6_axis, neopixel, stackchan, heart_rate];


export default service_preset;