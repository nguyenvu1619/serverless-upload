"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.extractAudio = exports.analystic = void 0;
var sns_1 = require("aws-sdk/clients/sns");
var fluent_ffmpeg_1 = require("fluent-ffmpeg");
var dynamodb_1 = require("aws-sdk/clients/dynamodb");
var uuid_1 = require("uuid");
var stream_1 = require("stream");
var fs_1 = require("fs");
var s3_1 = require("aws-sdk/clients/s3");
var sns = new sns_1["default"]();
// ffmpeg.setFfmpegPath('/opt/ffmpeg')
// ffmpeg.setFfprobePath('/opt/ffprobe')
var topicArn = process.env.SNS_TOPIC_ANALYSIS_ARN;
var tableName = process.env.DYNAMODB_TableName;
var bucketName = process.env.S3BucketName;
var analystic = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var url_1, promise, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                url_1 = "https://nguyenvu-upload-lambda-functions.s3-ap-southeast-1.amazonaws.com/theboy.mp4";
                promise = new Promise(function (resolve) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        fluent_ffmpeg_1["default"].ffprobe(url_1, function (err, metadata) { return __awaiter(void 0, void 0, void 0, function () {
                            var jobLength, promisePushMessagePool, docClient, listJob, batchJobId, i, start, end, jobId, data, resultStoreDynamoDb, resultPromise;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        jobLength = Math.ceil(metadata.format.duration / 30);
                                        console.log(jobLength);
                                        promisePushMessagePool = [];
                                        docClient = new dynamodb_1["default"].DocumentClient();
                                        listJob = [];
                                        batchJobId = uuid_1.v4();
                                        for (i = 0; i < jobLength; i++) {
                                            start = i * 30;
                                            end = Math.min((i + 1) * 30, metadata.format.duration);
                                            jobId = uuid_1.v4();
                                            data = {
                                                batchJobId: batchJobId,
                                                jobId: jobId,
                                                start: start,
                                                end: end,
                                                url: url_1
                                            };
                                            listJob.push(data);
                                            promisePushMessagePool.push(sns.publish({
                                                Message: JSON.stringify(data),
                                                TopicArn: topicArn
                                            }).promise());
                                        }
                                        return [4 /*yield*/, docClient.put({
                                                TableName: "BatchJob",
                                                Item: {
                                                    id: batchJobId,
                                                    url: url_1,
                                                    jobs: listJob.map(function (job) { return ({
                                                        id: job.jobId,
                                                        start: job.start,
                                                        end: job.end,
                                                        status: "converting"
                                                    }); })
                                                }
                                            }).promise()];
                                    case 1:
                                        resultStoreDynamoDb = _a.sent();
                                        console.log("analystic -> resultStoreDynamoDb", resultStoreDynamoDb);
                                        return [4 /*yield*/, Promise.all(listJob.map(function (data) { return __awaiter(void 0, void 0, void 0, function () {
                                                return __generator(this, function (_a) {
                                                    return [2 /*return*/, sns.publish({
                                                            Message: JSON.stringify(data),
                                                            TopicArn: topicArn
                                                        }).promise()];
                                                });
                                            }); }))];
                                    case 2:
                                        resultPromise = _a.sent();
                                        console.log("analystic -> resultPromise", resultPromise);
                                        resolve(true);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                    });
                }); });
                return [4 /*yield*/, promise];
            case 1:
                _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        // Headers must be sent here as well as defined in the template.yaml.
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': "*",
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
                        },
                        body: JSON.stringify(true)
                    }];
            case 2:
                e_1 = _a.sent();
                console.log(e_1);
                console.log("asdasdas");
                return [2 /*return*/, "2"];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.analystic = analystic;
var test = {
    "Records": [
        {
            "Sns": {
                "Message": {
                    "url": "https://nguyenvu-upload-lambda-functions.s3-ap-southeast-1.amazonaws.com/theboy.mp4",
                    "batchJobId": 123,
                    "jobId": 123,
                    "start": 30,
                    "end": 60
                }
            }
        }
    ]
};
var transcoder = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var message, data, url_2, batchJobId, jobId, start_1, end_1, trancoderPromise, objectName, uploadStream, _a, writeStream, promise, readStream, pipeline, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                console.log(event.Records);
                message = test.Records[0].Sns.Message;
                console.log(typeof message, "asdasd");
                data = message;
                url_2 = data.url, batchJobId = data.batchJobId, jobId = data.jobId, start_1 = data.start, end_1 = data.end;
                console.log(data, 'ok');
                trancoderPromise = new Promise(function (resolve, reject) {
                    fluent_ffmpeg_1["default"](url_2).inputOptions([
                        "-ss " + start_1,
                        "-to " + end_1
                    ]).outputOptions([
                        '-an',
                        '-s hd720'
                    ])
                        .on('end', function () {
                        resolve(true);
                    })
                        .on('error', function (err) {
                        console.log(err);
                        reject(err);
                    })
                        .on('stderr', function (line) {
                        console.log(line);
                    })
                        .outputFormat('mp4').save("/tmp/ok.mp4");
                });
                return [4 /*yield*/, trancoderPromise];
            case 1:
                _b.sent();
                objectName = batchJobId + "/" + jobId + "/" + start_1 + "-" + end_1 + ".mp4";
                uploadStream = function (_a) {
                    var Bucket = _a.Bucket, Key = _a.Key;
                    var s3 = new s3_1["default"]();
                    var pass = new stream_1["default"].PassThrough();
                    return {
                        writeStream: pass,
                        promise: s3.upload({ Bucket: Bucket, Key: Key, Body: pass }).promise()
                    };
                };
                _a = uploadStream({ Bucket: bucketName, Key: objectName }), writeStream = _a.writeStream, promise = _a.promise;
                readStream = fs_1["default"].createReadStream('/tmp/ok.mp4');
                pipeline = readStream.pipe(writeStream);
                return [4 /*yield*/, promise];
            case 2:
                _b.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        // Headers must be sent here as well as defined in the template.yaml.
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': "*",
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
                        },
                        body: JSON.stringify("")
                    }];
            case 3:
                e_2 = _b.sent();
                console.log(e_2.toString(), "asdasdas");
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
var extractAudio = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var message;
    return __generator(this, function (_a) {
        message = event.Records[0].Sns.Message;
        console.log('Message received from SNS:', message);
        return [2 /*return*/, {
                statusCode: 200,
                // Headers must be sent here as well as defined in the template.yaml.
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': "*",
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PATCH'
                },
                body: JSON.stringify(message)
            }];
    });
}); };
exports.extractAudio = extractAudio;
transcoder("");
