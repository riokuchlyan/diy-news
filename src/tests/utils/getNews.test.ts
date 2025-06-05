import { getNews } from '@/utils/getNews';

global.fetch = jest.fn();

describe('getNews', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch news data successfully', async () => {
        const mockResponse = {
            articles: [
                { title: 'Test Article 1', description: 'Description 1' },
                { title: 'Test Article 2', description: 'Description 2' }
            ]
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        const result = await getNews('us');

        expect(global.fetch).toHaveBeenCalledWith('/api/news-api?country=us');
        
        expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        await expect(getNews('us')).rejects.toThrow('API Error');
    });

    it('should handle different country parameters', async () => {
        const mockResponse = { articles: [] };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        await getNews('gb');

        expect(global.fetch).toHaveBeenCalledWith('/api/news-api?country=gb');
    });

    it('should handle empty response', async () => {
        const mockResponse = { articles: [] };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        const result = await getNews('us');

        expect(result).toEqual(mockResponse);
    });
}); 