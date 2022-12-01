import cron from 'node-cron';
import {cleanOldIdempotentRequests} from './maintenanceTasks';

//  ┌────────────── second (optional)
//  │ ┌──────────── minute
//  │ │ ┌────────── hour
//  │ │ │ ┌──────── day of month
//  │ │ │ │ ┌────── month
//  │ │ │ │ │ ┌──── day of week
//  │ │ │ │ │ │
//  │ │ │ │ │ │
//  * * * * * *

// clean old idempotent requests
// runs at 1am every day
console.log('scheduling the idempotent request cleanup job');
cron.schedule('0 1 * * *', async () => {
  await cleanOldIdempotentRequests();
});

// things to run on startup (use timeout to allow for await)
setTimeout(async () => {
  console.log('running jobs that should also run on startup...');
  await cleanOldIdempotentRequests();
}, 500);
