(function() {
  'use strict';

  var PUBLIC_SERVICE_UUID           = 0xFFF0;
  var CHARACTERISTIC_RECEIVED_UUID  = 0xFFF3;
  var CHARACTERISTIC_RENAME_UUID    = 0xFFF5;
   
  class Notti {
    constructor() {
      this.isOn = false;
      this.redStart = 0;
      this.redEnd = 0
      this.greenStart = 0;
      this.greenEnd = 0;
      this.blueStart = 0;
      this.blueEnd = 0;   
      this.characteristics = new Map();
    }

    connect() {
      var options = {filters:[{name: 'Notti',}]};
      return navigator.bluetooth.requestDevice(options).then(function (device) {
        window.notti.device = device;
        return device.connectGATT();
      }).then(function (server) {
        window.notti.server = server;
        return Promise.all([
          server.getPrimaryService(PUBLIC_SERVICE_UUID).then(function (service) {
          return Promise.all([
            window.notti._cacheCharacteristic(service, CHARACTERISTIC_RECEIVED_UUID),
            window.notti._cacheCharacteristic(service, CHARACTERISTIC_RENAME_UUID)]);
        })]);
      });
    }

    /* Smart Light Services */
   
    toggleNottiLight(status){
        if(status){
            this.turnON();
        }else{
            this.turnOFF();
        }
    };

    turnON(){
        var data = [0x06,0x01,0xff,0x00,0x00];
        return this._writeCharacteristicValue(CHARACTERISTIC_RECEIVED_UUID, new Uint8Array(data));
    };

    turnOFF(){
        var data = [0x06,0x01,0x00,0x00,0x00];
        return this._writeCharacteristicValue(CHARACTERISTIC_RECEIVED_UUID, new Uint8Array(data));
    };

    selectRGBColor(r,g,b){
      var data =  [6,1,r,g,b];
      return this._writeCharacteristicValue(CHARACTERISTIC_RECEIVED_UUID, new Uint8Array(data));
    };

    customColorChange(){
        var data = [0x04,0x05,0x02];
        return this._writeCharacteristicValue(CHARACTERISTIC_RECEIVED_UUID, new Uint8Array(data));
    };

    fullColorChange(data){
        return this._writeCharacteristicValue(CHARACTERISTIC_RECEIVED_UUID, new Uint8Array(data));
    };


    /* Utils */

    _cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid).then(function (characteristic) {
        window.notti.characteristics.set(characteristicUuid, characteristic);
      });
    }

    _readCharacteristicValue(characteristicUuid) {
      var characteristic = this.characteristics.get(characteristicUuid);
      return characteristic.readValue().then(function (value) {
        value = value.buffer ? value : new DataView(value);
        return value;
      });
    }

    _writeCharacteristicValue(characteristicUuid, value) {
      var characteristic = this.characteristics.get(characteristicUuid);
      if (this._debug) {
        console.debug('WRITE', characteristic.uuid, value);
      }
      if(characteristic)
      return characteristic.writeValue(value);
    }

  }

  window.notti = new Notti();

})();