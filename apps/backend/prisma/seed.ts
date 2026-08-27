import { PrismaClient, FeedbackChannel, FeedbackStatus } from "@prisma/client";

const prisma = new PrismaClient();

const seedNow = new Date();
const recentDate = (daysAgo: number, hour: number, minute: number) => {
  const date = new Date(seedNow);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const feedbacks = [
  {
    seedKey: "fb-001",
    customerName: "Ana Souza",
    rating: 5,
    comment: "Atendimento excelente do início ao fim.",
    channel: FeedbackChannel.GOOGLE,
    status: FeedbackStatus.CONCLUIDO,
    createdAt: recentDate(7, 9, 15)
  },
  {
    seedKey: "fb-002",
    customerName: "Bruno Lima",
    rating: 4,
    comment: "Entrega rápida e produto bem embalado.",
    channel: FeedbackChannel.IFOOD,
    status: FeedbackStatus.CONCLUIDO,
    createdAt: recentDate(6, 12, 30)
  },
  {
    seedKey: "fb-003",
    customerName: "Carla Mendes",
    rating: 2,
    comment: "O pedido chegou frio.",
    channel: FeedbackChannel.IFOOD,
    status: FeedbackStatus.EM_ANALISE,
    createdAt: recentDate(5, 18, 45)
  },
  {
    seedKey: "fb-004",
    customerName: "Diego Alves",
    rating: 1,
    comment: "Demoraram muito para responder.",
    channel: FeedbackChannel.GOOGLE,
    status: FeedbackStatus.CONCLUIDO,
    createdAt: recentDate(4, 8, 10)
  },
  {
    seedKey: "fb-005",
    customerName: "Elaine Costa",
    rating: 3,
    comment: "Experiência ok, mas pode melhorar.",
    channel: FeedbackChannel.PESQUISA,
    status: FeedbackStatus.NOVO,
    createdAt: recentDate(3, 14, 20)
  },
  {
    seedKey: "fb-006",
    customerName: "Felipe Rocha",
    rating: 5,
    comment: null,
    channel: FeedbackChannel.GOOGLE,
    status: FeedbackStatus.NOVO,
    createdAt: recentDate(2, 11, 5)
  },
  {
    seedKey: "fb-007",
    customerName: "Gabriela Nunes",
    rating: 2,
    comment: "Meu problema ainda não foi resolvido.",
    channel: FeedbackChannel.PESQUISA,
    status: FeedbackStatus.EM_ANALISE,
    createdAt: recentDate(2, 16, 50)
  },
  {
    seedKey: "fb-008",
    customerName: "Henrique Martins",
    rating: 4,
    comment: "Gostei bastante do atendimento presencial.",
    channel: FeedbackChannel.PESQUISA,
    status: FeedbackStatus.CONCLUIDO,
    createdAt: recentDate(1, 10, 40)
  },
  {
    seedKey: "fb-009",
    customerName: "Isabela Pereira",
    rating: 1,
    comment: "Pedido veio incompleto.",
    channel: FeedbackChannel.IFOOD,
    status: FeedbackStatus.NOVO,
    createdAt: recentDate(0, 19, 0)
  },
  {
    seedKey: "fb-010",
    customerName: "Joao Ribeiro",
    rating: 3,
    comment: "Bom atendimento, mas a fila estava longa.",
    channel: FeedbackChannel.GOOGLE,
    status: FeedbackStatus.EM_ANALISE,
    createdAt: recentDate(0, 13, 35)
  },
  {
    seedKey: "fb-011",
    customerName: "Kelly Santos",
    rating: 5,
    comment: "Voltarei a comprar com certeza.",
    channel: FeedbackChannel.IFOOD,
    status: FeedbackStatus.CONCLUIDO,
    createdAt: recentDate(0, 17, 25)
  },
  {
    seedKey: "fb-012",
    customerName: "Lucas Ferreira",
    rating: 4,
    comment: "Pesquisa simples e atendimento prestativo.",
    channel: FeedbackChannel.PESQUISA,
    status: FeedbackStatus.NOVO,
    createdAt: recentDate(0, 9, 55)
  }
] as const;

const notes = [
  {
    feedbackSeedKey: "fb-003",
    description: "Solicitada nova entrega ao cliente.",
    createdAt: recentDate(4, 10, 0)
  },
  {
    feedbackSeedKey: "fb-004",
    description: "Cliente recebeu retorno e aceitou o prazo de compensação.",
    createdAt: recentDate(4, 15, 30)
  },
  {
    feedbackSeedKey: "fb-007",
    description: "Caso encaminhado para revisão com a equipe de suporte.",
    createdAt: recentDate(1, 9, 20)
  }
] as const;

async function main() {
  await prisma.feedbackNote.deleteMany();
  await prisma.feedback.deleteMany();

  const feedbackIdBySeedKey = new Map<string, string>();

  for (const { seedKey, ...data } of feedbacks) {
    const feedback = await prisma.feedback.create({ data });
    feedbackIdBySeedKey.set(seedKey, feedback.id);
  }

  await prisma.feedbackNote.createMany({
    data: notes.map(({ feedbackSeedKey, ...data }) => ({
      ...data,
      feedbackId: feedbackIdBySeedKey.get(feedbackSeedKey)!
    }))
  });

  const [feedbackCount, noteCount, channelCounts, statusCounts] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedbackNote.count(),
    prisma.feedback.groupBy({ by: ["channel"], _count: { _all: true }, orderBy: { channel: "asc" } }),
    prisma.feedback.groupBy({ by: ["status"], _count: { _all: true }, orderBy: { status: "asc" } })
  ]);

  console.log(`Seed concluído: ${feedbackCount} feedbacks e ${noteCount} notas criados.`);
  console.log(
    `Canais: ${channelCounts.map((item) => `${item.channel}=${item._count._all}`).join(", ")}`
  );
  console.log(
    `Status: ${statusCounts.map((item) => `${item.status}=${item._count._all}`).join(", ")}`
  );
}

main()
  .catch(async (error) => {
    console.error("Seed falhou:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
