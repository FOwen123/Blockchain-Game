import { z } from "zod";

export const answerOptionSchema = z.object({
  id: z.string(),
  label: z.string()
});

export const weekTopicSchema = z.object({
  id: z.number().int().min(1).max(15),
  title: z.string(),
  shortTitle: z.string(),
  highlight: z.string(),
  question: z.string(),
  options: z.array(answerOptionSchema).min(3).max(4),
  correctAnswerId: z.string(),
  spectatorCallout: z.string()
});

export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  avatar: z.string(),
  score: z.number().int(),
  progress: z.number().min(0).max(15),
  currentWeek: z.number().int().min(1).max(16),
  boosts: z.number().int().min(0),
  slowdowns: z.number().int().min(0),
  status: z.enum(["ready", "boosting", "slowed", "finished"]),
  connected: z.boolean(),
  joinedAt: z.number(),
  updatedAt: z.number(),
  finishedAt: z.number().optional(),
  lastAnswer: z
    .object({
      weekId: z.number(),
      answerId: z.string(),
      correct: z.boolean(),
      at: z.number()
    })
    .optional()
});

export const roomStateSchema = z.object({
  roomCode: z.string(),
  status: z.enum(["lobby", "countdown", "racing", "checkpoint", "finished", "resetting"]),
  locked: z.boolean(),
  activeWeek: z.number().int().min(1).max(15),
  startedAt: z.number().optional(),
  finishedAt: z.number().optional(),
  countdownEndsAt: z.number().optional(),
  players: z.record(z.string(), playerSchema),
  hostMessage: z.string().optional(),
  revision: z.number().int().min(0)
});

export const roomEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("player:join"),
    originId: z.string(),
    player: playerSchema
  }),
  z.object({
    type: z.literal("player:answer"),
    originId: z.string(),
    playerId: z.string(),
    weekId: z.number(),
    answerId: z.string(),
    at: z.number()
  }),
  z.object({
    type: z.literal("player:heartbeat"),
    originId: z.string(),
    playerId: z.string(),
    at: z.number()
  }),
  z.object({
    type: z.literal("host:state"),
    originId: z.string(),
    state: roomStateSchema
  }),
  z.object({
    type: z.literal("host:request-state"),
    originId: z.string()
  })
]);

export type AnswerOption = z.infer<typeof answerOptionSchema>;
export type WeekTopic = z.infer<typeof weekTopicSchema>;
export type Player = z.infer<typeof playerSchema>;
export type RoomState = z.infer<typeof roomStateSchema>;
export type RoomEvent = z.infer<typeof roomEventSchema>;
export type RaceStatus = RoomState["status"];
