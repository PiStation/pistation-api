load('api_gpio.js');
load('api_mqtt.js');
load('api_sys.js');

let pin = 4;   // Button Pin
let ledPin = 13; // LED pin
let topic = 'lights/led1'; // MQTT topic for state and event listeners

GPIO.set_button_handler(pin, GPIO.PULL_DOWN, GPIO.INT_EDGE_NEG, 50, function(x) {
    print('button trigger');
    toggleLedLight();
}, true);

GPIO.set_mode(ledPin, GPIO.MODE_OUTPUT);

//Led toggle

let ledLightState = 0;
function toggleLedLight() {
    if(ledLightState === 0) {
        ledLightState = 1;
    } else {
        ledLightState = 0;
    }
    GPIO.write(ledPin, ledLightState);
    let message = JSON.stringify({
        state: ledLightState
    });

    let ok = MQTT.pub(topic, message, message.length);
    print('Succesfully toggled light: ', ok ? 'yes' : 'no', 'topic:', topic, 'message:', message);
}

MQTT.sub(topic, function(conn, msg) {
    print('Got message: ', msg);
    let obj = JSON.parse(msg);
    print(JSON.stringify(obj));
    if(obj.toggle){
        toggleLedLight();
    }
}, true);



print('Flash button is configured on GPIO pin ', pin);
print('Press the flash button now!');
