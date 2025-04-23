import {PrismaClient} from "@/generated/prisma";

async function main(prisma: PrismaClient) {
    await prisma.lLMProvider.createMany(
        {
            skipDuplicates: true,
            data: [
                {
                    handle: 'claudeai',
                    name: 'Claude AI'
                },
                {
                    handle: 'openai',
                    name: 'OpenAI'
                },
                {
                    handle: 'lmstudio',
                    name: 'LM Studio'
                },
                {
                    handle: 'ollama',
                    name: 'Ollama'
                }
            ]
        }
    );
}


const prisma = new PrismaClient();

main(prisma)
    .finally(async () => {
        await prisma.$disconnect();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })