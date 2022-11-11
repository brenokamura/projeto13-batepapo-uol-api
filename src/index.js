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

const participantSchema = joi.object({
	name: joi.string().min(3).required(),
	lastStatus: joi.number()
}
);

const messageSchema = joi.object({
	from: joi.string().required(),
	to: joi.string().min(3).required(),
	text: joi.string().min(1).required(),
	type: joi.string().valid("message", "private_message").required(),
	time: joi.string()
}
);


app.post("/participants", async (req, res) => {

	const participant = req.body;
	const validation = participantSchema.validate(participant, { abortEarly: false, });

	if (validation.error) {
		const errors = validation.error.details.map((type) => type.message);
		res.status(422).send(errors);
		return;
	}
	try{
		const isParticipant = await db.collection("participants").findOne({name: participant.name})
		if(isParticipant){
			res.sendStatus(409);
			return;
		}
		await db.collection("participants").insertOne({name: participant.name, lastStatus: Date.now()});
		await db.collection("message").insertOne({
			from: participant.name,
			to: "Todos",
			text: "entrar na sala...",
			type: "status",
			//time: Date.now().format("HH:mm:ss")
		});
		res.send(201);
	}catch(error){
		res.status(500).send(error.message);
	}
})

app.get('/participants', async (req, res) => {
  try {
    const participants = await db.collection('participants').find().toArray();
    if(!participants){
    res.status(404).send("Não há nenhum participante.");
    return
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});
app.listen(5000, () => console.log("Rodando a porta 5000. Sucesso!!!"))
