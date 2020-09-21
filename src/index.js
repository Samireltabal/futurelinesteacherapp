import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
UIkit.use(Icons);
// components can be called from the imported UIkit reference
UIkit.notification('اهلاً بالعالم');
import $ from 'jquery'
import boostrap from 'bootstrap'
require('popper.js');
import './index.css';
import { ping } from './js/app'

$(document).ready(function () {
    $('#tester').text(process.env.STREAM_HOST)
    $('#tester').append(`<br> ${process.env.WEBSOCKET_HOST}`)
})

