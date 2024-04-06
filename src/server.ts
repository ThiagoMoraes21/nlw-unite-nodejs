import fastify from "fastify";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const app = fastify();

const prisma = new PrismaClient({
  log: ['query']
});

app.get("/health-check", () => {
  return "hello form terminal";
});


app.post("/events", async (request, reply) => {

  // creates an Schema to validate an object
  const createEventSchema = z.object({
    title: z.string().min(4),
    details: z.string().nullable(),
    maximumAttendees: z.number().int().positive().nullable(),
  });  

  // validate data comming from request.body, based on the zod schema created above
  const data = createEventSchema.parse(request.body);


  // create a new event in the database
  const event = await prisma.event.create({
    data: {
      title: data.title,
      details: data.details,
      maximumAttendees: data.maximumAttendees,
      slug: new Date().toISOString(),
    }
  });

  return reply.status(201).send({ eventId: event.id });

});


app.listen({ port: 3333 }).then(() => {
  console.log("http server is running...");
});
