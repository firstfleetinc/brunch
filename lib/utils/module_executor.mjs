import { workerData, parentPort } from 'worker_threads'

parentPort.on('message', (data) => {console.log(JSON.stringify(data))})
