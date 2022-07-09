//@ts-check

/**
 * @typedef {Object} CharacteristicPreset 
 * @property {string} name 
 * @property {string} uuid 
 * @property {string} type
 * @property {string} unit 
 * @property {boolean} little_endian 
 */

/**
 * @typedef {Object} ServicePreset
 * @property {string} name
 * @property {string} uuid
 * @property {Array<CharacteristicPreset>} characteristics
 */

/**
 * @type {ServicePreset}
 */
const imu_6_axis = {
    name: "Arduino IMU",
    uuid: "ABF0E000-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(),
    characteristics: [
        { name: "timer", uuid: "ABF0E001-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "uint32", unit: "msec", little_endian: true },
        { name: "acc x", uuid: "ABF0E002-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
        { name: "acc y", uuid: "ABF0E003-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
        { name: "acc z", uuid: "ABF0E004-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "g", little_endian: true },
        { name: "gyro x", uuid: "ABF0E005-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
        { name: "gyro y", uuid: "ABF0E006-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
        { name: "gyro z", uuid: "ABF0E007-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "deg/s", little_endian: true },
        { name: "temperature", uuid: "ABF0E008-B597-4BE0-B869-6054B7ED0CE3".toLowerCase(), type: "float32", unit: "°C", little_endian: true },
    ]
}

/**
 * @type {ServicePreset}
 */
const heart_rate = {
    name: "heart_rate",
    uuid: "180d",
    characteristics: [
        { name: "heart rate measurement", uuid: "2a37", type: "uint16", unit: "bpm", little_endian: true },
        { name: "heart rate control point", uuid: "2a39", type: "int16", unit: "", little_endian: true }
    ]
}

/**
 * 
 * @returns {Array<ServicePreset>}
 */
function ServicePreset() {
    return [imu_6_axis, heart_rate];
}

export default ServicePreset;