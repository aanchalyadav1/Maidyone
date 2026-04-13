"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workerController_1 = require("../controllers/workerController");
const router = (0, express_1.Router)();
router.get('/', workerController_1.getWorkers);
router.post('/', workerController_1.createWorker);
router.patch('/:id', workerController_1.updateWorker);
exports.default = router;
