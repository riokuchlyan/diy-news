import * as React from 'react';

interface NewsItem {
  title: string;
  description: string;
  url: string;
}

interface EmailTemplateProps {
  newsItems: NewsItem[];
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  newsItems,
}) => (
  <div>
    <h1>Your Daily News Digest</h1>
    {newsItems.map((item, index) => (
      <div key={index}>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <a href={item.url}>Read more</a>
        {index < newsItems.length - 1 && <hr />}
      </div>
    ))}
  </div>
);