import { Router } from "express";

const exampleRouter = Router();

exampleRouter.post('/a', (req, res) => {
    res.send("a");
})

exampleRouter.get('/b', (req, res) => {
    res.send("b");
})

export default exampleRouter;