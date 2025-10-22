const { OpenAI } = require('openai');

class RAGService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.vectorDbUrl = process.env.VECTOR_DB_URL;
        this.embeddingModel = process.env.EMBEDDING_MODEL;
    }

    async generateEmbedding(text) {
        try {
            const response = await this.openai.embeddings.create({
                model: this.embeddingModel,
                input: text
            });
            return response.data[0].embedding;
        } catch (error) {
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    async query(queryText) {
        try {
            // Generate embedding for query
            const queryEmbedding = await this.generateEmbedding(queryText);
            
            // Search similar documents in vector database
            const similarDocs = await this.searchSimilarDocuments(queryEmbedding);
            
            // Generate response using retrieved context
            const response = await this.generateResponse(queryText, similarDocs);
            
            return {
                query: queryText,
                response: response,
                sources: similarDocs
            };
        } catch (error) {
            throw new Error(`RAG query failed: ${error.message}`);
        }
    }

    async searchSimilarDocuments(embedding) {
        // Mock implementation - replace with actual vector database search
        return [
            { id: 1, content: 'Document content 1', score: 0.95 },
            { id: 2, content: 'Document content 2', score: 0.87 }
        ];
    }

    async generateResponse(query, context) {
        const contextText = context.map(doc => doc.content).join('\n');
        
        const response = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Answer the question based on the provided context.'
                },
                {
                    role: 'user',
                    content: `Context: ${contextText}\n\nQuestion: ${query}`
                }
            ]
        });

        return response.choices[0].message.content;
    }

    async ingestDocuments(documents) {
        const results = [];
        
        for (const doc of documents) {
            const embedding = await this.generateEmbedding(doc.content);
            // Store in vector database
            results.push({
                id: doc.id,
                status: 'ingested',
                embedding_size: embedding.length
            });
        }
        
        return results;
    }
}

module.exports = new RAGService();
