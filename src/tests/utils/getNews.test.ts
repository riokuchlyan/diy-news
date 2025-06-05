import { getNews } from '@/utils/getNews';

// Mock the global fetch function
global.fetch = jest.fn();

describe('getNews', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should fetch news data successfully', async () => {
        // Mock successful API response
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

        // Verify fetch was called with correct URL
        expect(global.fetch).toHaveBeenCalledWith('/api/news-api?country=us');
        
        // Verify the returned data
        expect(result).toEqual(mockResponse);
    });

    it('should handle API errors', async () => {
        // Mock failed API response
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        // Verify that the error is thrown
        await expect(getNews('us')).rejects.toThrow('API Error');
    });

    it('should handle different country parameters', async () => {
        const mockResponse = { articles: [] };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        await getNews('gb');

        // Verify fetch was called with correct country parameter
        expect(global.fetch).toHaveBeenCalledWith('/api/news-api?country=gb');
    });

    it('should handle empty response', async () => {
        const mockResponse = { articles: [] };
        
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            json: () => Promise.resolve(mockResponse)
        });

        const result = await getNews('us');

        // Verify the empty response is handled correctly
        expect(result).toEqual(mockResponse);
    });
}); 