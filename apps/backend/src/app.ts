import cors from "@fastify/cors";
import Fastify from "fastify";

import { PrismaFeedbackRepository } from "./modules/feedbacks/repository.js";
import { feedbackRoutes } from "./modules/feedbacks/routes.js";
import { FeedbackService } from "./modules/feedbacks/service.js";
import { AppError } from "./shared/errors.js";

type BuildAppDependencies = {
  service?: FeedbackService;
};

type ValidationLikeError = {
  message: string;
  validation: unknown;
};

function isValidationLikeError(error: unknown): error is ValidationLikeError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string" &&
    "validation" in error
  );
}

export function buildApp(dependencies: BuildAppDependencies = {}) {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        removeAdditional: false
      }
    }
  });
  const service =
    dependencies.service ?? new FeedbackService(new PrismaFeedbackRepository());

  void app.register(cors, {
    origin: process.env.FRONTEND_URL ?? true,
    methods: ["GET", "HEAD", "POST", "PATCH"]
  });

  app.get("/health", async () => ({ status: "ok" }));

  void app.register(feedbackRoutes, {
    prefix: "/api/feedbacks",
    service
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      const statusCode =
        error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION_ERROR" ? 400 : 409;

      return reply.status(statusCode).send({
        error: {
          code: error.code,
          message: error.message
        }
      });
    }

    if (isValidationLikeError(error)) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: error.message
        }
      });
    }

    request.log.error(error);

    return reply.status(500).send({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Internal server error"
      }
    });
  });

  return app;
}
