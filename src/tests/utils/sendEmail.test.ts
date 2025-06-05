import { sendEmail } from '@/utils/sendEmail';

global.fetch = jest.fn();

describe('sendEmail', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should send an email successfully', async () => {
    const mockResponse = { id: 'test-email-id' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const testData = {
      email: 'delivered@resend.dev',
      subject: 'Test Email',
      data: [{
        title: 'Test News',
        description: 'This is a test message',
        url: 'https://example.com'
      }]
    };

    const result = await sendEmail(testData);
    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/send'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String)
      })
    );
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Invalid email address';
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage })
    });

    const invalidData = {
      email: 'invalid-email',
      subject: 'Test Email',
      data: [{
        title: 'Test News',
        description: 'Test description',
        url: 'https://example.com'
      }]
    };

    await expect(sendEmail(invalidData)).rejects.toThrow(errorMessage);
  });
});
