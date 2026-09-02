import { useEffect, useState } from 'react';

export default function ResearchResult({ result }) {
  if (!result) return null;

  const report = result.report || {};
  const sources = report.sources || [];
  const hasErrors = result.errors?.length > 0;

  return (
    <article className="research-result">
      <header className="research-header">
        <h1 className="research-title">{report.title || 'Research Report'}</h1>
        <div className="research-meta">
          {report.symbol && <span className="symbol">{report.symbol}</span>}
          {report.createdAt && <time>{new Date(report.createdAt).toLocaleDateString()}</time>}
          <span className={`confidence confidence--${report.confidence || 'low'}`}>
            Confidence: {report.confidence || 'low'}
          </span>
        </div>
      </header>

      {report.summary && (
        <section className="research-section">
          <h2>Summary</h2>
          <p>{report.summary}</p>
        </section>
      )}

      {report.marketSnapshot && (
        <section className="research-section">
          <h2>Market Snapshot</h2>
          <p>{report.marketSnapshot}</p>
        </section>
      )}

      {report.whatIsHappening && (
        <section className="research-section">
          <h2>What Is Happening</h2>
          <p>{report.whatIsHappening}</p>
        </section>
      )}

      {(report.newsCatalysts || report.fundamentals) && (
        <section className="research-section">
          <h2>News & Fundamentals</h2>
          {report.newsCatalysts && <p>{report.newsCatalysts}</p>}
          {report.fundamentals && (
            <pre className="fundamentals">{JSON.stringify(report.fundamentals, null, 2)}</pre>
          )}
        </section>
      )}

      {Array.isArray(report.bullishFactors) && report.bullishFactors.length > 0 && (
        <section className="research-section">
          <h2>Bullish Factors</h2>
          <ul>
            {report.bullishFactors.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </section>
      )}

      {Array.isArray(report.bearishFactors) && report.bearishFactors.length > 0 && (
        <section className="research-section">
          <h2>Bearish Factors</h2>
          <ul>
            {report.bearishFactors.map((f, i) => <li key={i}>{f}</li>)}
          </ul>
        </section>
      )}

      {Array.isArray(report.risks) && report.risks.length > 0 && (
        <section className="research-section">
          <h2>Key Risks</h2>
          <ul>
            {report.risks.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>
      )}

      {report.outlook && (
        <section className="research-section">
          <h2>Research-Based Outlook</h2>
          <p>{report.outlook}</p>
        </section>
      )}

      {sources.length > 0 && (
        <section className="research-section">
          <h2>Sources</h2>
          <ul className="sources-list">
            {sources.map((s, i) => (
              <li key={i} className="source-item">
                <span className="source-provider">{s.provider}</span>
                {s.sourceUrl && <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer">{s.sourceTitle || s.sourceUrl}</a>}
                {s.publishedAt && <span className="source-date">{new Date(s.publishedAt).toLocaleDateString()}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasErrors && (
        <section className="research-section">
          <h2>Data Availability</h2>
          <ul className="limitations">
            {result.errors.map((e, i) => (
              <li key={i}>{e.provider}: {e.error}</li>
            ))}
          </ul>
        </section>
      )}

      <footer className="research-footer">
        <p className="disclaimer">
          Guide Trade provides research and educational information, not guaranteed financial predictions or personalized financial advice. Markets are uncertain and can move unexpectedly. Always verify information and consider your own risk tolerance.
        </p>
      </footer>
    </article>
  );
}
