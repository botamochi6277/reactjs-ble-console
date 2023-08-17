
const utf8_decoder = new TextDecoder('utf-8')
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/DataView
export const ble_data_formats: BleType[] = [
  { name: 'int8', hex: 0x0C, decoder: (v: DataView, offset: number) => v.getInt8(offset) },
  { name: 'uint8', hex: 0x04, decoder: (v: DataView, offset: number) => v.getUint8(offset) },
  { name: 'int16', hex: 0x0E, decoder: (v: DataView, offset: number) => v.getInt16(offset, true) },
  { name: 'uint16', hex: 0x06, decoder: (v: DataView, offset: number) => v.getUint16(offset, true) },
  { name: 'int32', hex: 0x10, decoder: (v: DataView, offset: number) => v.getInt32(offset, true) },
  { name: 'uint32', hex: 0x08, decoder: (v: DataView, offset: number) => v.getUint32(offset, true) },
  { name: 'uint64', hex: 0x0a, decoder: (v: DataView, offset: number) => v.getUint32(offset, true) },
  { name: 'float32', hex: 0x14, decoder: (v: DataView, offset: number) => `${v.getFloat32(offset, true).toFixed(4)}` },
  { name: 'float64', hex: 0x15, decoder: (v: DataView, offset: number) => `${v.getFloat64(offset, true).toFixed(4)}` },
  { name: 'string', hex: 0x00, decoder: (v: DataView, offset: number) => { offset; return utf8_decoder.decode(v); } },
];

export const ble_units = [
  { name: 'unitless', unit: "", hex: 0x2700 },
  { name: 'acc', unit: "m/ss", hex: 0x2713 },
  { name: 'gyro', unit: 'rad/s', hex: 0x2743 },
  { name: 'time', unit: 'sec', hex: 0x2703 },
  { name: 'angle', unit: 'deg', hex: 0x2763 },
  { name: 'temperature', unit: '°C', hex: 0x272F }
];

const si_prefixes = [
  { exp: -6, prefix: 'μ' },
  { exp: -3, prefix: 'm' },
  { exp: 0, prefix: '' },
  { exp: 3, prefix: 'k' },
  { exp: 6, prefix: 'M' }
]

// https://developer.mozilla.org/en-US/docs/Web/API/BluetoothRemoteGATTCharacteristic
export async function readValue(ch: CharacteristicWrapper) {
  console.debug(`reading value of ${ch.characteristic.uuid}`);
  const dv = await ch.characteristic.readValue();//dataview
  const v = ch.decoder(dv, 0);
  console.debug(`value = ${v}, byte_length = ${dv.buffer.byteLength}`);
  return v;
}


export async function readDescriptors(ch: BluetoothRemoteGATTCharacteristic) {
  // https://googlechrome.github.io/samples/web-bluetooth/read-descriptors-async-await.html

  let txt_decoder = new TextDecoder('utf-8')
  const descriptors = await ch.getDescriptors();
  // name, properties, 
  //   {
  //     type: format_item.name,
  //     decoder: format_item.decoder,
  //     unit: <>{prefix_item.prefix}{unit_item.unit}</>,
  //     icon: unit_item.icon
  // }
  let dscp = [];
  let characteristic_name = "";
  let characteristic_config = "";
  let fmt = "";
  let unit = "";
  let data_decoder = ble_data_formats[ble_data_formats.length - 1].decoder;
  let ns = 0;
  console.debug(`#descriptors: ${descriptors.length}`);
  for (let index = 0; index < descriptors.length; index++) {
    const descriptor = descriptors[index];
    console.debug(`descriptor uuid: ${descriptor.uuid}`);
    switch (descriptor.uuid) {
      case "00002901-0000-1000-8000-00805f9b34fb":
        // Characteristic User Descriptor
        const data_v = await descriptor.readValue();
        dscp.push(txt_decoder.decode(data_v));
        characteristic_name = txt_decoder.decode(data_v);
        console.debug(characteristic_name);
        break;
      case "00002902-0000-1000-8000-00805f9b34fb":
        // Client Characteristic Configuration descriptor.
        const v2 = await descriptor.readValue();
        characteristic_config = txt_decoder.decode(v2);
        console.debug(characteristic_config);
        break;
      case "00002904-0000-1000-8000-00805f9b34fb":
        // Characteristic Presentation Format
        const p_view = await descriptor.readValue();
        // p_view: dataview
        // format | exponent |unit|namespace|description
        // 1      | 1        | 2  | 1       | 2
        // console.log(`Presentation view: ${p_view.byteLength} bytes`)
        // for (let index = 0; index < p_view.byteLength; index++) {
        //     const element = p_view.getUint8(index, true);
        //     console.log(`[${index}]: 0x${element.toString(16)}`)
        // }
        // console.log(`Presentation view: 0x${p_view.getUint32(0).toString(16)}`)
        // const len = p_view.byteLength;
        const fmt_hex = p_view.getUint8(0);
        const exp_hex = p_view.getInt8(1);
        const unit_hex = p_view.getUint16(2, true);
        ns = p_view.getUint8(4);

        console.debug(`fmt: 0x${fmt_hex.toString(16)}, exp: ${exp_hex.toString(16)}, unit: 0x${unit_hex.toString(16)}, ns: 0x${ns.toString(16)}`);

        const format_item = ble_data_formats.find((b) => b.hex === fmt_hex);
        const unit_item = ble_units.find((b) => b.hex === unit_hex);
        const prefix_item = si_prefixes.find(s => s.exp === exp_hex);

        fmt = format_item ? format_item.name : "unitless";
        unit = `${prefix_item?.prefix}${unit_item?.unit}`;
        data_decoder = format_item ? format_item.decoder : ble_data_formats[ble_data_formats.length - 1].decoder;
        // const n = p_view.getUint8(0, true);
        // dscp.push(n);
        break;
      default:
        console.log(`Unprepared Descriptor: ${descriptor.uuid}`);
        console.log(`type: ${typeof (descriptor.uuid)}`);
        break;
    }
  }

  return {
    name: characteristic_name,
    config: characteristic_config,
    fmt: fmt,
    unit: unit,
    decoder: data_decoder
  }
}

export async function searchDevice(
  uuid: string,
  is_search_all_device: boolean,
  srv_preset: ServicePreset,
  setLogMessage: (s: string) => void,
  setDevice: (d: BluetoothDevice) => void,
  setCharacteristics: (c: CharacteristicWrapper[]) => void
) {
  let filters = [];
  let filter_service = uuid;
  if (filter_service.startsWith('0x')) {
    const i = parseInt(filter_service);
    if (i) {
      filters.push({ services: [i] });
    }
  }
  else if (filter_service) {
    filters.push({ services: [filter_service] });
  }

  let options: any = {};
  if (is_search_all_device) {
    options.acceptAllDevices = true;
  } else {
    options.filters = filters;
  }

  const msg = `searching for service having uuid: ${srv_preset.uuid}`;
  console.log(msg);
  setLogMessage(msg);

  try {
    const ble_device = await navigator.bluetooth.requestDevice(options);

    if (!ble_device || (typeof (ble_device) === "undefined")) {
      const un_found_msg = `Available device is not found`
      setLogMessage(un_found_msg);
      return;
    }

    // https://ja.reactjs.org/docs/state-and-lifecycle.html#using-state-correctly
    setDevice(ble_device);// this process may be still async
    setLogMessage(`connecting ${ble_device.name}`);
    console.log(`device name: ${ble_device.name}`);

    console.log('Connecting to GATT Server...');
    if (!ble_device.gatt) {
      const msg = `NO GATT Server`
      setLogMessage(msg);
      return;
    }
    const server = await ble_device.gatt.connect();
    const target_srv_uuid = srv_preset.uuid.startsWith('0x') ? parseInt(srv_preset.uuid) : srv_preset.uuid;

    console.log('Getting Service...');
    const service = await server.getPrimaryService(target_srv_uuid);

    // get the all characteristic uuids
    console.log('Getting Characteristics...');
    // let preset_characteristic_uuids = srv_preset.characteristics.map((c) => c.uuid);

    const all_characteristics = await service.getCharacteristics();

    let characteristics: CharacteristicWrapper[] = [];

    for (let index = 0; index < all_characteristics.length; index++) {
      // const ch_uuid = preset_characteristic_uuids[index].startsWith('0x') ? parseInt(preset_characteristic_uuids[index]) : preset_characteristic_uuids[index];
      const characteristic = all_characteristics[index];
      console.log(`Characteristic UUID:  ${characteristic.uuid}`);
      // read descriptor
      const profile = await readDescriptors(characteristic);
      const w: CharacteristicWrapper = {
        characteristic: characteristic,
        name: profile.name,
        config: profile.config,
        format: profile.fmt,
        unit: profile.unit,
        decoder: profile.decoder,
        value: 0
      }
      characteristics.push(w);
    }

    setCharacteristics(characteristics);

  } catch (error) {
    console.log(`Argh! ${error}`);
    setLogMessage(`Argh! ${error}`);
  }
}