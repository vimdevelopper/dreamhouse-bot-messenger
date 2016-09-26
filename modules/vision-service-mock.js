"use strict";

exports.classify = imageURL => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve("colonial");
    }, 2000);
});