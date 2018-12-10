'use strict';

const hat = require('hat');
const helpers = require('./helpers');
const redisFunc = require('./redis-functions')

async function process(obj) {
    let surveyObject = await createSurveyObject(obj);
    let result = await redisFunc.surveys.getAsync(surveyObject.id);
    if (result === null) {
        await redisFunc.surveys.set(surveyObject.id, JSON.stringify(surveyObject.survey));
        return surveyObject.codes;
    } else {
        return [];
    }
}

function createSurveyObject(obj) {
    let id = helpers.hashCode(obj['survey-name']);
    let questions = findValueByPrefix(obj, 'q');
    let options = findValueByPrefix(obj, 'o', true);
    let codes = generateInviteCodes(obj['survey-codes']);
    let output = {
        id : id,
        survey : {
            name: obj['survey-name'],
            instruction: obj['survey-instruction'],
            price: obj['survey-price'],
            questions: questions,
            options: options
        },
        codes : codes,
        timestamp : Date.now()
    }
    return output;
}

function generateInviteCodes(n) {
    let codes = [];
    for (let i = 0; i < n; i++) {
        codes.push(hat());
    }
    return codes;
}

function findValueByPrefix(object, prefix, split = false) {
    let filteredElements = {};
    for (let property in object) {
        if (object.hasOwnProperty(property) &&
            property.toString().startsWith(prefix)) {
            if (split === true) {
                filteredElements[property] = object[property].split(',').map(item => item.trim());
            } else {
                filteredElements[property] = object[property];
            }
        }
    }
    return filteredElements;
}

module.exports = {
    process: process
};