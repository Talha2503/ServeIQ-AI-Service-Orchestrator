require('dotenv').config({ path: '.env.local' });
const { intentAgent } = require('./agents/intent/intentAgent.js');

async function test() {
    const result = await intentAgent('AC bilkul kaam nahi kar raha, kal subah G-13 mein technician chahiye, budget zyada nahi hai');
    console.log(JSON.stringify(result, null, 2));
}

test();