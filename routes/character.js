const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const characterController = require('../controllers/Character');

router.put('/:id', auth, characterController.updateCharacter);

router.get('/:pseudo/:class', characterController.getCharacter);

router.delete('/:id', auth, characterController.deleteCharacter);

router.get('/:id', characterController.getCharacters);

router.post('/blizzard', characterController.blizzardCreateCharacter);

router.post('/', auth, characterController.createCharacter)
module.exports = router;