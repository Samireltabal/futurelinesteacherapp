import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
UIkit.use(Icons);
// components can be called from the imported UIkit reference
UIkit.notification('اهلاً بالعالم');
import $ from 'jquery'
import './index.css';
import { getConnectedDevices, updateCameraList, playVideoFromCamera } from './js/stream';
import { ping } from './js/app'
$(document).ready(function () {
    $('#tester').text(process.env.STREAM_HOST)
    $('#tester').append(`<br> ${process.env.WEBSOCKET_HOST}`)
    ping().then((response) => {
        $('#loading').hide();
        $('#content').show();
    }).catch((error) => {
        $('#loading').hide();
        $('#content').html(`
            <pre>
                ${error}
            </pre>
        `);
    });
    getConnectedDevices('videoinput',  function(devices) {
        updateCameraList(devices);
    });
    playVideoFromCamera();
})
