"use strict";

exports.classify = imageURL => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('*** resolving');
            resolve("colonial");
        }, 2000);
    });
};