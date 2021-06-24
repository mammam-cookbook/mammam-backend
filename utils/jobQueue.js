const Bull = require('bull');
const emailProcess = require('./consumer');
// const {setQueues, BullAdapter} = require('@bull-board/api/bullAdapter');


const emailQueue = new Bull('email', {
    redis: "redis:6379"
});

// setQueues([
//     new BullAdapter(emailQueue)
// ]);

emailQueue.process(emailProcess);

const sendNewEmailProducer = (data) => {
    emailQueue.add(data, {
        attempts: 3
    });
};

module.exports = {
    sendNewEmailProducer
}