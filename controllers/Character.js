const axios = require("axios");
const event = require('../events/createFile');
const Character = require('../models/Character');
const BLIZZARD_URL = "https://backend-tp-final-nodejs.agence-pixi.fr/wow/compte/check";

const createCharacter = (req, res, next) => {    
    delete req.body._id;
    delete req.body.userId;

    Character.findOne({
        pseudo: req.body.pseudo,
        class: req.body.class
    })
        .then((character) => {
            if (req.auth.isAdmin) return res.status(401).json({ message: "Création refusée en tant qu'administrateur" })
            if (character) return res.status(401).json({ message: 'Pseudo/classe déjà utilisés' });

            const characterObject = new Character({
                ...req.body,
                userId: req.auth.userId,
            });
        
            characterObject
                .save()
                .then(() => res.status(201).json({ message: 'Personnage créé' }))
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(400).json({ error }));
}

const getCharacter = (req, res, next) => {
    Character.findOne({
        pseudo: req.params.pseudo,
        class: req.params.class
    })
        .then((character) => {
            if (!character) res.status(401).json({ message: 'Personnage inexistant' });

            res.status(200).json(character);
        })
        .catch((error) => res.status(400).json({ error }));
}

const blizzardCreateCharacter = (req, res, next) => {
    axios.post(BLIZZARD_URL, { "username": req.body.username, "password": req.body.password })
        .then((response) => res.status(201).json(response.data))
        .catch((error) => {
            event.emit('createFile', { file: 'blizzardCreateLogs', message: `${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} : Tentative de connexion invalide\n` });

            res.status(400).json({ error })
        });
}

const updateCharacter = (req, res, next) => {
    delete req.body.userId;

    Character.findOne({ _id: req.params.id })
    .then((character) => {
        if (character.userId === req.auth.userId || req.auth.isAdmin) {
            Character.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Personnage modifié' }))
                .catch((error) => res.status(400).json({ error }));
        } else {
            res.status(401).json({ message: 'Cet utilisateur ne peut pas modifier ce personnage' })
        }
    })
    .catch((error) => res.status(400).json({ error }));
}

const getCharacters = (req, res, next) => {
    Character.findById(req.params.id)
        .then((character) => res.status(200).json(character))
        .catch((error) => res.status(400).json(error));
}

const deleteCharacter = (req, res, next) => {
    Character.findById(req.params.id)
        .then((character) => {
            if (character.userId === req.auth.userId || req.auth.isAdmin) {
                Character.deleteOne({ _id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Personnage supprimé' }))
                    .catch((error) => res.status(400).json({ error }));
            } else {
                res.status(401).json({ message: 'Cet utilisateur ne peut pas supprimer ce personnage' });
            }
        })
        .catch((error) => res.status(400).json({ error }));
}

module.exports = {
    createCharacter,
    blizzardCreateCharacter,
    getCharacter,
    getCharacters,
    updateCharacter,
    deleteCharacter
}