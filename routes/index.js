var express = require("express");
var router = express.Router();
let cors = require("cors");
let Problem = require("../models/Problem");
let vm = require("vm");

router.get("/ping", core(), (req, res, next) => {
    console.log("Pong");
    res.json({
        status : 200,
        result : "Pong",
    });
})

router.options("/problems/:problem_id", cors());

router.post("/problems/:problem_id", cors(), async (req, res, next) => {
    const body = req.body;
    const code = body.code;

    try {
        const problem = await Problem.findById(req.params.problem_id);

        let isCorrect = true;

        for(let i = 0; i < problem.tests.length; i++) {
            try {
                const script = new vm.Script(code + problem.tests[i].code);
                const result = script.runInNewContext();
    
                if(`${result}` !== problem.tests[i].solution) {
                    isCorrect = false;
                }
            } catch(err) {
                res.json({
                    result : "에러",
                    detail : err.message
                });

                return;
            }
        }

        if(!isCorrect) {
            res.json({ result : "오답" });
        } else {
            res.json({ result : "정답" });
        }
    } catch(err) {
        next(err);
    }
});

router.get("/problems", cors(), async function(req, res, next) {
    try {
        const dosc = await Problem.find();
        res.json(dosc);
    } catch(err) {
        next(err);
    }
});

module.exports = router;