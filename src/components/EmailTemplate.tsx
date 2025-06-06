import * as React from 'react';
import { NewsSummary } from './NewsSummary';

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
    {newsItems.map((item, index) => (
      <div key={index} style={{ 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px'
      }}>
        <h2 style={{ 
          fontSize: '20px',
          marginBottom: '10px',
          color: '#000000'
        }}>
          {item}
        </h2>
        <a href={`https://news.google.com/search?q=${encodeURIComponent(item)}`} style={{
          display: 'inline-block',
          backgroundColor: '#000000',
          color: '#cccccc',
          padding: '10px 20px',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          Read more
        </a>
      </div>
    ))}
    <div style={{
      textAlign: 'center',
      marginTop: '30px',
      paddingTop: '20px',
      borderTop: '1px solid #eeeeee',
      fontSize: '12px',
      color: '#666666'
    }}>
      <p>This email was sent to you because you subscribed to DIY News.</p>
    </div>
  </div>
);