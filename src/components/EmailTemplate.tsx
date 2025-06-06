import * as React from 'react';

interface EmailTemplateProps {
  newsItems: string[];
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  newsItems,
}) => (
  <div style={{ 
    maxWidth: '600px', 
    margin: '0 auto', 
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    color: '#333333'
  }}>
    <h1 style={{ 
      textAlign: 'center', 
      color: '#000000',
      fontSize: '24px',
      marginBottom: '30px',
      borderBottom: '2px solid #000000',
      paddingBottom: '10px'
    }}>
      Your Daily News Digest
    </h1>
    {newsItems.map((item, index) => {
      const [term, summary] = item.split('\n\n');
      return (
        <div key={index} style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            marginBottom: '15px',
            color: '#000000',
            fontWeight: '600'
          }}>
            {term}
          </h2>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px',
            color: '#444444'
          }}>
            {summary}
          </p>
          <a href={`https://news.google.com/search?q=${encodeURIComponent(term)}`} style={{
            display: 'inline-block',
            backgroundColor: '#000000',
            color: '#cccccc',
            padding: '12px 24px',
            textDecoration: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background-color 0.2s'
          }}>
            Read more
          </a>
        </div>
      );
    })}
    <div style={{
      textAlign: 'center',
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #eeeeee',
      fontSize: '12px',
      color: '#666666'
    }}>
      <p>This email was sent to you because you subscribed to <a href="https://diy-news-seven.vercel.app" style={{ color: '#666666', textDecoration: 'underline' }}>DIY News</a>.</p>
      <p style={{ marginTop: '8px' }}>To unsubscribe, please remove all your news terms from your account.</p>
    </div>
  </div>
);