import fastify from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { createEvent } from "./routes/create-events";

const app = fastify();

// Add schema validator and serializer
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get("/health-check", () => {
  return "hello form terminal";
});

app.register(createEvent);

app.listen({ port: 3333 }).then(() => {
  console.log("http server is running...");
});
