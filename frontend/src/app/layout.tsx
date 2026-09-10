import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AWS CloudOps AI - Infrastructure Intelligence Platform',
  description: 'AI-powered AWS infrastructure intelligence dashboard monitoring cost, EC2 compute, S3 storage, and Amazon Bedrock optimization recommendations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#f2f3f3', color: '#16191f', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
