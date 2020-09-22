import $ from 'jquery';

export function getConnectedDevices(type, callback) {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === type);
            callback(filtered);
        });
}

export function updateCameraList(cameras) {
    const listElement = $('#availableCameras');
    cameras.map(camera => {
        const item = `<option val="${camera.deviceId}">${camera.label}</option>`;
        listElement.prepend(item);
    })
}

export function updateAudioList(Audios) {
    const listElement = $('#availableAudio');
    Audios.map(camera => {
        const item = `<option val="${camera.deviceId}">${camera.label}</option>`;
        listElement.append(item);
    })
}