"use strict";

let messenger = require('./messenger');
let formatter = require('./formatter');
let visionService = require('./vision-service');

exports.processUpload = (sender, attachments) => {
    if (attachments.length > 0) {
        let attachment = attachments[0];
        if (attachment.type === "image") {
            messenger.send({text: `OK, looking for houses like that...`}, sender);
            visionService.classify(attachment.url)
                .then(houseType => salesforce.findPropertiesByCategory(houseType))
                .then(properties => messenger.send(formatter.formatProperties(properties), sender))
        } else {
            messenger.send({text: `This type of attachment is not supported`}, sender);
        }
    }
};