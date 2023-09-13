# ReactJS BLE Console

[![jobs to build and deploy page](https://github.com/botamochi6277/reactjs-ble-console/actions/workflows/pages.yml/badge.svg)](https://github.com/botamochi6277/reactjs-ble-console/actions/workflows/pages.yml)

A console in web browser to debug and control BLE devices.
This repository depends on [Web Bluetooth API](https://developer.mozilla.org/docs/Web/API/Web_Bluetooth_API)

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
