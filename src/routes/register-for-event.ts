import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export async function registerForEvent(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Register an attendee",
        tags: ["attendees"],
        params: z.object({
          eventId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        respose: {
          201: z.object({
            attendeeId: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const { name, email } = request.body;

      await validateMaximumEventAttendees(eventId);
      await validateAttendeeUniqueness(eventId, email);

      const attendee = await prisma.attendee.create({
        data: {
          name,
          email,
          eventId,
        },
      });

      return reply.status(201).send({ attendeeId: attendee.id });
    },
  );
}

async function validateMaximumEventAttendees(eventId: string) {
  const eventPromise = prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

  const eventAttendeesCountPromise = prisma.attendee.count({
    where: {
      eventId,
    },
  });

  const [event, eventAttendeesCount] = await Promise.all([
    eventPromise,
    eventAttendeesCountPromise,
  ]);

  if (
    event?.maximumAttendees &&
    eventAttendeesCount >= event.maximumAttendees
  ) {
    throw new Error("Maximum attendees limit was exceeded!");
  }
}

async function validateAttendeeUniqueness(eventId: string, email: string) {
  const attendeeFromEmail = await prisma.attendee.findUnique({
    where: {
      eventId_email: {
        email,
        eventId,
      },
    },
  });

  if (attendeeFromEmail !== null) {
    throw new Error("This e-mail is already registered for this event!");
  }
}
