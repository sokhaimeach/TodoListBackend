const { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent } = require('../controllers/event.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createEventSchema, updateEventSchema } = require('../validators/event.validator');
const { paramSchema } = require('../validators/param.validator');

const router = require('express').Router();

router.use(auth);

router.post('/', validate(createEventSchema), createEvent);
router.get('/', getAllEvents);
router.get('/:id', validate(paramSchema, 'params'), getEventById);
router.put('/:id', validate(paramSchema, 'params'), validate(updateEventSchema), updateEvent);
router.delete('/:id', validate(paramSchema, 'params'), deleteEvent);

module.exports = router;
