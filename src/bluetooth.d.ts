type CharacteristicPreset = {
  name: string,
  uuid: string,
  type: string,
  unit: string,
  little_endian: boolean
}

type ServicePreset = {
  name: string,
  uuid: string,
  characteristics: CharacteristicPreset[]
}

type BleDataType = {
  name: string,
  hex_code: number,
  decoder: (v: DataView, offset: number) => number | string,
  encoder: (v: any) => BufferSource
}

type NumerationSystemItem = {
  name: string,
  radix: number,
  prefix: string
}

type CharacteristicWrapper = {
  characteristic: BluetoothRemoteGATTCharacteristic,
  name: string,
  config: string,
  data_type: string,
  prefix: string
  unit: string,
  // hex: number,
  decoder: ((v: DataView, offset: number) => number | string),
  encoder: (v: any) => BufferSource
  value: number | string
}