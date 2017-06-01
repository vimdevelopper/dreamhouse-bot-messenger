"use strict";

let messenger = require('./messenger'),
    formatter = require('./formatter'),
    salesforce = require('./salesforce');
if(process.env.EINSTEIN_VISION_ACCOUNT_ID==''||process.env.EINSTEIN_VISION_MODEL==''||process.env.EINSTEIN_VISION_PRIVATE_KEY==''||process.env.EINSTEIN_VISION_URL=='')
    var visionService = require('./vision-service-mock');
else
    var visionService = require('./vision-service');

exports.processUpload = (sender, attachments) => {
    if (attachments.length > 0) {
        let attachment = attachments[0];
        if (attachment.type === "image") {
            messenger.send({text: 'OK, let me look at that picture...'}, sender);
            console.log(attachment);
            visionService.classify(attachment.url)
                .then(houseType => {
                    messenger.send({text: `Looking for houses matching "${houseType}"`}, sender);
                    return salesforce.findPropertiesByCategory(houseType)
                })
                .then(properties => messenger.send(formatter.formatProperties(properties), sender))
        } else {
            messenger.send({text: 'This type of attachment is not supported'}, sender);
        }
    }
};
