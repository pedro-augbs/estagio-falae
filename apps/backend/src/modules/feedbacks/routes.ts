import type { FastifyPluginAsync } from "fastify";

import type { FeedbackService } from "./service.js";
import type { FeedbackFilters, FeedbackStatus } from "./types.js";
import {
  createFeedbackNoteBodySchema,
  feedbackListQuerySchema,
  feedbackListResponseSchema,
  feedbackNoteSchema,
  feedbackParamsSchema,
  feedbackSchema,
  updateFeedbackStatusBodySchema
} from "./schemas.js";

type FeedbackRoutesOptions = {
  service: FeedbackService;
};
export const feedbackRoutes: FastifyPluginAsync<FeedbackRoutesOptions> = async (app, { service }) => {
  app.get<{
    Querystring: FeedbackFilters;
  }>(
    "/",
    {
      schema: {
        querystring: feedbackListQuerySchema,
        response: {
          200: feedbackListResponseSchema
        }
      }
    },
    async (request) => service.list(request.query)
  );

  app.get<{
    Params: { id: string };
  }>(
    "/:id",
    {
      schema: {
        params: feedbackParamsSchema,
        response: {
          200: feedbackSchema
        }
      }
    },
    async (request) => service.get(request.params.id)
  );

  app.get<{
    Params: { id: string };
  }>(
    "/:id/notes",
    {
      schema: {
        params: feedbackParamsSchema,
        response: {
          200: {
            type: "array",
            items: feedbackNoteSchema
          }
        }
      }
    },
    async (request) => service.getNotes(request.params.id)
  );

  app.post<{
    Params: { id: string };
    Body: { description: string };
  }>(
    "/:id/notes",
    {
      schema: {
        params: feedbackParamsSchema,
        body: createFeedbackNoteBodySchema,
        response: {
          201: feedbackNoteSchema
        }
      }
    },
    async (request, reply) => {
      const note = await service.addNote(request.params.id, request.body.description);

      return reply.code(201).send(note);
    }
  );

  app.patch<{
    Params: { id: string };
    Body: { status: FeedbackStatus };
  }>(
    "/:id/status",
    {
      schema: {
        params: feedbackParamsSchema,
        body: updateFeedbackStatusBodySchema,
        response: {
          200: feedbackSchema
        }
      }
    },
    async (request) => service.changeStatus(request.params.id, request.body.status)
  );
};
