const amqp = require("amqplib");
const { exec } = require("child_process");
const e = require("express");
const fs = require("fs");
const { stderr } = require("process");
class Consumer {
  #queueName;
  #connection;
  #channel;
  constructor(queueName) {
    this.#queueName = queueName;
    this.#connection = null;
    this.#channel = null;
  }
  async connect() {
    if (!(this.#connection && this.#channel)) {
      this.#connection = await amqp.connect(`amqp://localhost`);
      this.#channel = await this.#connection.createChannel();
      this.#channel.assertQueue(this.#queueName, { durable: false });
      this.#connection.on("error", (err) => {
        console.log(`Error occured in Publisher Connection: ${err}`);
      });
      this.#channel.on("error", (err) => {
        console.log(`Error occured in Publisher channel: ${err}`);
      });
    }
  }
  consume(executeJob) {
    if (!(this.#connection && this.#channel)) {
      throw err;
    } else {
      this.#channel.consume(
        this.#queueName,
        (message) => {
          const job = JSON.parse(message.content.toString());
          console.log(`--------Job Recieved--------`);
          console.log(`SubmissionId: ${job.submissionId}`);
          console.log(`SubmissionId: ${job.languageId}`);
          console.log(`SubmissionId: ${job.problemId}`);
          console.log(`SubmissionId: ${job.submission}`);
          executeJob(job);
          // channel.ack(message) To send the acknowledgement to all the message explicitly
        },
        { noAck: true } // true so that implicitly acknowledgement is sent to every message
      );
    }
  }
  shutdown() {
    try {
      this.#channel.close();
      this.#connection.close();
    } catch (e) {
      console.log(`Error occured while publisher shutdown : ${e}`);
    }
  }
}
/**
 *
 * @param {*} job
 */
function jobHandler(job) {
  const submissionId = job.submissionId;
  const languageId = job.languageId;
  const problemId = job.problemId;
  const submission = job.submission;
  let directoryName = submissionId;
  let sourceCodeFile = `Submission.${retrieveExtension(languageId)}`;
  let testDataFile = `testData.txt`;
  let submissionDir = __dirname + "/sandbox/temp/" + directoryName;
  let sourceCodeDir = submissionDir + "/source-code/";
  let resultDir = submissionDir + "/result/";
  let testDataDir = __dirname + `/sandbox/temp/testData/${problemId}/`;
  generateSubmissionFile(sourceCodeDir, sourceCodeFile, submission);
  generateTestDataFile(problemId, testDataDir, testDataFile);
  triggerJob(submissionDir, testDataDir);
}
function triggerJob(submissionDir, testDataDir) {
  exec(
    __dirname + `/sandbox/trigger.sh ${submissionDir} ${testDataDir}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(stderr.toString());
      }
      console.log(stdout);
    }
  );
}
/**
 *
 * @param {*} problemId
 * @param {*} testDataDir
 */
function generateTestDataFile(problemId, testDataDir, testDataFile) {
  fs.mkdir(testDataDir, { recursive: true }, (err, path) => {
    if (err) {
      throw err;
    }
    console.log(`Directory created for ProblemId: ${testDataDir}`);
    if (!fs.existsSync(testDataDir + testDataFile)) {
      const testData = retrieveTestData(problemId);
      fs.open(testDataDir + testDataFile, "w", (err, file) => {
        if (err) {
          throw err;
        }
        fs.write(file, JSON.stringify(testData), (err, writen, str) => {
          if (err) {
            throw err;
          }
          console.log(
            `Test Data ${str} for ${problemId}  is written ${writen} to ${
              testDataDir + testDataFile
            }`
          );
        });
      });
    }
  });
}
/**
 *
 * @param {*} sourceCodeDir
 * @param {*} sourceCodeFile
 * @param {*} submission
 */
function generateSubmissionFile(sourceCodeDir, sourceCodeFile, submission) {
  fs.mkdir(sourceCodeDir, { recursive: true }, (err, path) => {
    if (err) {
      throw err;
    }
    console.log(`Directory created for SubmissionId: ${sourceCodeDir}`);
    fs.writeFile(sourceCodeDir + sourceCodeFile, submission, "utf-8", () => {
      console.log(
        `Submission code written to ${sourceCodeDir + sourceCodeFile}`
      );
    });
  });
}
function retrieveTimeoutForProblem(problemId) {
  const timeouts = { P101: 30000, P102: 45000 };
  return;
}
/**
 *
 * @param {*} problemId
 * @returns
 */
function retrieveTestData(problemId) {
  let testData = {
    1: [1, 2, 3, 150],
    2: [2, 4, 6, 130],
    3: [5.4, 2.9, 8.3, 80],
  };
  return testData;
}
/**
 *
 * @param {*} languageId
 * @returns
 */
function retrieveExtension(languageId) {
  switch (languageId) {
    case "L101":
      return "java";
      break;
    case "L102":
      return "py";
      break;
    default:
      throw new Error("Language Not supported");
  }
}
(async () => {
  const consumer = new Consumer("submissionQueue");
  await consumer.connect();
  consumer.consume((job) => {
    jobHandler(job);
  });
})();
