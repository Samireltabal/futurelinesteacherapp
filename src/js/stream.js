// Open camera with at least minWidth and minHeight capabilities
import { getConnectedDevices } from './streamHelpers';


async function openCamera(cameraId, minWidth, minHeight) {
    const constraints = {
        'audio': {'echoCancellation': true},
        'video': {
            'deviceId': cameraId,
            'width': {'min': minWidth},
            'height': {'min': minHeight}
            }
        }

    return await navigator.mediaDevices.getUserMedia(constraints);
}
var stream;
export async function playVideoFromCamera() {
    try {
        getConnectedDevices('videoinput', (cameras) => {
            openCamera(cameras[0].deviceId, 1280, 720);
        });
        const constraints = {'video': true, 'audio': true};
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoElement = document.querySelector('video#localVideo');
        videoElement.srcObject = stream;
    } catch(error) {
        console.error('Error opening video camera.', error);
    }
}