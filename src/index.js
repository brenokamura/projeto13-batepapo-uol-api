import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import joi from 'joi';
import { MongoClient } from "mongodb";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect().then(() => {
	db = mongoClient.db("batepapo");
});

const participantsSchema = joi.object({
	name: joi.string().min(3).required(),
	lastStatus: joi.number()
}
);

const messagesSchema = joi.object({
	from: joi.string().required(),
	to: joi.string().min(3).required(),
	text: joi.string().min(1).required(),
	type: joi.string().valid("message", "private_message").required(),
	time: joi.string()
}
);


app.listen(5000, () => console.log("Rodando a porta 5000. Sucesso!!!"))