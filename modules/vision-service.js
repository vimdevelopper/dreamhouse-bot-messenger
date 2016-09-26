"use strict";

exports.classify = imageURL => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("colonial");
        }, 2000);
    });
};