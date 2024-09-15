import { ChromaClient, IncludeEnum, OpenAIEmbeddingFunction } from 'chromadb';

import OpenAI from 'openai';

export async function ragExampleLib(body: any): Promise<string> {
  const question = body.question;
  const systemPrompt =
    body.context ||
    'Answer the following question without hallucinating' +
      ' if you are unsure request more information and suggest possible prompts';

  if (!question) throw new Error('You did not ask a question');

  const apiKey = process.env.OPENAI_API_KEY!;

  const embeddings = new OpenAIEmbeddingFunction({
    openai_model: 'text-embedding-3-small',
    openai_api_key: apiKey,
  });

  const client = new ChromaClient({
    auth: {
      provider: 'token',
      credentials: process.env.SECRET_TOKEN!
    },
    path: 'http://localhost:8000',
  });

  const collection = await client.getOrCreateCollection({
    name: 'file_collection',
    embeddingFunction: embeddings,
  });

  const context = await collection.query({
    queryTexts: question,
    include: [IncludeEnum.Documents, IncludeEnum.Metadatas],
    nResults: 10,
  });

  let contextString = 'The context for answering the question is: \n';
  for (let i = 0; i < context.ids[0].length; i++) {
    contextString +=
      'context: ' +
      context.documents[0][i] +
      'with metadata: ' +
      JSON.stringify(context.metadatas[0][i]) +
      '\n';
  }

  const answer = await new OpenAI({
    apiKey,
  }).chat.completions.create({
    model: 'text-embedding-3-small',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: 'Using the context: ' + contextString +'Answer the question: ' + question,
      },
    ],
  });

  return JSON.stringify(answer.choices[0].message?.content ?? 'No Answer');
}
