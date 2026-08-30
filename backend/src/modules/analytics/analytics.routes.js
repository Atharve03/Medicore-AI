const router = require('express').Router(); const Joi=require('joi'); const authenticate = require('../../middlewares/authenticate'); const authorize=require('../../middlewares/authorize'); const validate = require('../../utils/validate'); const { dateRangeSchema } = require('./analytics.validators'); const controller = require('./analytics.controller');
router.use(authenticate); for (const name of ['overview','appointments','patients','doctors','billing','pharmacy','laboratory','admissions','departments']) router.get(`/${name}`, validate(dateRangeSchema,'query'), controller.section(name));
router.get('/ai-usage',authorize('superAdmin'),validate(dateRangeSchema,'query'),controller.section('aiUsage'));
router.post('/ai-report',authorize('superAdmin'),validate(Joi.object({range:Joi.string().valid('today','yesterday','last7Days','last30Days','thisMonth','lastMonth').default('last30Days')})),controller.report);
module.exports = router;
