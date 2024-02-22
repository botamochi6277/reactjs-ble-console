# ReactJS BLE Console

[![jobs to build and deploy page](https://github.com/botamochi6277/reactjs-ble-console/actions/workflows/pages.yml/badge.svg)](https://github.com/botamochi6277/reactjs-ble-console/actions/workflows/pages.yml)

A console in web browser to debug and control BLE devices.
This repository depends on [Web Bluetooth API](https://developer.mozilla.org/docs/Web/API/Web_Bluetooth_API)


## Characteristic Handling Concept

```mermaid
graph LR;

subgraph BLE_CORE
   Characteristic
   CharacteristicConfigurationDescriptor
   UserDescriptor
   PresentationFormatDescriptor
end

subgraph js
   characteristic_core
   data_view
   name
   config
   data_type
   unit
   prefix
end

subgraph mui
   TextFieldValue
   postfix[unit]
   characteristic_name
end

Characteristic-->|copy|characteristic_core
Characteristic-->|read & cache|data_view
CharacteristicConfigurationDescriptor-->|read|config
UserDescriptor-->|read|name
PresentationFormatDescriptor-->|parse|data_type
PresentationFormatDescriptor-->|parse|unit
PresentationFormatDescriptor-->|parse|prefix

data_view-->decoder-->TextFieldValue
data_type-->decoder
name-->characteristic_name
unit-->postfix
```


## Value R/W system

```mermaid
graph LR

subgraph peripheral
   subgraph characteristic
      value
   end
end

subgraph central
   raw_value
   text_field_value
   numeration_sys

   plus(( ))
   raw_value-->|onChange|plus
   numeration_sys-->|onChange|plus
   plus-->|toString|text_field_value

   text_field_value-->|write|value
end

value-->|read|raw_value

```
