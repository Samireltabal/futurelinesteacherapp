import $ from 'jquery';
export function appendChat (type, object) {
    if (type == "sent" || type == "recieved" || type  === "info") {
        if (type == "sent") {
            $('#chatbox').append(`
            <!-- chat item sent -->
            <div class="me uk-grid-small uk-flex-bottom uk-flex-right uk-text-right" uk-grid>
              <div class="uk-width-auto">
                <div class="uk-card uk-card-body uk-card-small uk-card-primary uk-border-rounded">
                <p class="msgSender uk-margin-remove">
                    انت : 
                </p>  
                <p class="msgBody uk-margin-remove">
                    شكراً يا مستر
                  </p>
                </div>
              </div>
            </div>
            <!-- chat item sent End -->
            `);
        } else if (type == "recieved") {
            $('#chatbox').append(`
                <!-- chat item recieved -->
                    <div class="guest uk-grid-small uk-flex-bottom uk-flex-left" uk-grid>
                        <div class="uk-width-auto">
                            <div class="uk-card uk-card-body uk-card-small uk-card-default uk-border-rounded">
                            <p class="msgSender uk-margin-remove">
                    ${object['uuid']}
                  </p>  
                            <p class="uk-margin-remove">
                                ${object['message']}
                            </p>
                            </div>
                        </div>
                    </div>
                <!-- chat item end -->
            `);
        } else if (type == "info") {
            $('#chatbox').append(`
            <!-- chat item recieved -->
                <div class="infomsg uk-grid-small uk-flex-bottom uk-flex-center" uk-grid>
                    <div class="uk-width-auto">
                        <div class="uk-card uk-card-body uk-card-small uk-card-default uk-border-rounded">
                        <p class="uk-margin-remove">Hey dude!</p>
                        </div>
                    </div>
                </div>
            <!-- chat item end -->
        `);
        }
        $("#chatbox"). animate({ scrollTop: $('#chatbox').prop("scrollHeight")}, 1000);
    } else {
        return false;
    }
}
