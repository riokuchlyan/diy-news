import { sendNewsletter } from '@/services/news-letter/NewsLetter';
import { sendEmail } from '@/utils/sendEmail';

jest.mock('@/utils/sendEmail', () => ({
  sendEmail: jest.fn()
}));

jest.mock('@supabase/supabase-js', () => {
  const mockSelect = jest.fn();
  const mockFrom = jest.fn(() => ({ select: mockSelect }));
  const mockSupabase = { from: mockFrom };
  
  return {
    createClient: jest.fn(() => mockSupabase),
    __mockSelect: mockSelect
  };
});

const mockSelect = (jest.requireMock('@supabase/supabase-js') as { __mockSelect: jest.Mock }).__mockSelect;

describe('sendNewsletter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send emails to all users with news items', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        {
          email: 'test1@example.com',
          news_items: [
            {
              title: 'Test News 1',
              description: 'Description 1',
              url: 'https://example.com/1'
            }
          ]
        },
        {
          email: 'test2@example.com',
          news_items: [
            {
              title: 'Test News 2',
              description: 'Description 2',
              url: 'https://example.com/2'
            }
          ]
        }
      ],
      error: null
    });

    const result = await sendNewsletter();

    expect(result).toEqual({ success: true });
    expect(sendEmail).toHaveBeenCalledTimes(2);
    expect(sendEmail).toHaveBeenCalledWith({
      email: 'test1@example.com',
      subject: 'Your Daily News Digest',
      data: expect.arrayContaining([
        expect.objectContaining({
          title: 'Test News 1',
          description: 'Description 1',
          url: 'https://example.com/1'
        })
      ])
    });
    expect(sendEmail).toHaveBeenCalledWith({
      email: 'test2@example.com',
      subject: 'Your Daily News Digest',
      data: expect.arrayContaining([
        expect.objectContaining({
          title: 'Test News 2',
          description: 'Description 2',
          url: 'https://example.com/2'
        })
      ])
    });
  });

  it('should handle Supabase errors', async () => {
    mockSelect.mockResolvedValueOnce({
      data: null,
      error: new Error('Database error')
    });

    await expect(sendNewsletter()).rejects.toThrow('Database error');
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('should skip users without email or news items', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        { email: null, news_items: [] },
        { email: 'test@example.com', news_items: [] }
      ],
      error: null
    });

    const result = await sendNewsletter();
    expect(result).toEqual({ success: true });
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
