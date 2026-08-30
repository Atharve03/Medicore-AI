const repo=require('../repositories/aiUsage.repository'); const logger=require('../config/logger');
async function record({user,result,durationMs,success}){try{const provider=result?.provider||'local';await repo.record({userId:user.id,role:user.role,provider,model:result?.model||'unknown',promptTokens:result?.usage?.promptTokens||0,completionTokens:result?.usage?.completionTokens||0,durationMs,success,cost:provider==='local'?0:null,costCurrency:provider==='local'?'INR':null});}catch(error){logger.warn(`AI usage telemetry could not be recorded: ${error.message}`);}}
module.exports={record};
