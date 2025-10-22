import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentic Curator',
  description: 'Autonomous chatbot that discovers and curates content as shareable cards'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <h1>Agentic Curator</h1>
            <p className="sub">Discover. Curate. Share.</p>
          </header>
          <main>{children}</main>
          <footer className="footer">Built with Next.js</footer>
        </div>
      </body>
    </html>
  );
}
