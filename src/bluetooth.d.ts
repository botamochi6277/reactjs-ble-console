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

type BleType = {
  name: string,
  hex: number,
  decoder: (v: DataView, offset: number) => number | string,
  encoder: (v: any) => BufferSource
}


type CharacteristicWrapper = {
  characteristic: BluetoothRemoteGATTCharacteristic,
  name: string,
  config: string,
  format: string,
  prefix: string
  unit: string,
  // hex: number,
  decoder: ((v: DataView, offset: number) => number | string),
  encoder: (v: any) => BufferSource
  value: number | string
}