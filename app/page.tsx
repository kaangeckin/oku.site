'use client';

import { useState } from 'react';
import { ArrowRight, Copy, Terminal, FileJson, FileText, Check, Loader2, Download, Zap } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'json' | 'preview'>('raw');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/parse?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const content = activeTab === 'json' ? JSON.stringify(result, null, 2) : result.markdown;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.markdown], { type: 'text/markdown' });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `${result.title ? result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'oku_site'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-zinc-800">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-xl leading-none tracking-tighter">
            O
          </div>
          <span className="font-semibold text-lg tracking-tight">oku.site</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <a href="#api" className="hover:text-white transition-colors">API Docs</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
            Web'i Yapay Zeka İçin <br className="hidden md:block"/>Okunabilir Kılın.
          </h1>
          <p className="text-gray-400 text-lg">
            Karmaşık web sayfalarını tek bir istekle saniyeler içinde temiz Markdown formatına dönüştürün. Token maliyetlerinde %90'a varan tasarruf sağlayın.
          </p>
          
          <form onSubmit={handleSubmit} className="relative group mt-8">
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/20 to-zinc-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-zinc-900 border border-zinc-800 focus-within:border-zinc-600 rounded-xl overflow-hidden transition-colors shadow-2xl">
              <div className="hidden sm:flex pl-4 pr-2 py-4 text-zinc-500 font-mono text-sm border-r border-zinc-800 items-center">
                oku.site/
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://news.ycombinator.com"
                className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white font-mono text-sm placeholder:text-zinc-600"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="px-6 py-4 bg-zinc-100 text-zinc-900 font-medium hover:bg-white disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'İşleniyor...' : 'Dönüştür'}</span>
              </button>
            </div>
          </form>

          {/* Quick Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-sm">
            <span className="text-zinc-500">Örnekler:</span>
            {[
              { label: 'Hacker News', url: 'https://news.ycombinator.com' },
              { label: 'React Docs', url: 'https://react.dev/learn' },
              { label: 'Paul Graham', url: 'https://paulgraham.com/greatwork.html' },
            ].map(chip => (
              <button
                key={chip.label}
                onClick={() => setUrl(chip.url)}
                className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* Results Area */}
        {result && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Ham Token</span>
                <span className="text-2xl font-mono text-zinc-300">{result.raw_tokens?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Markdown Token</span>
                <span className="text-2xl font-mono text-emerald-400">{result.md_tokens?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex flex-col gap-1 relative overflow-hidden">
                <Zap className="absolute right-[-10%] top-[-10%] w-24 h-24 text-emerald-500/10" />
                <span className="text-emerald-500 text-xs font-medium uppercase tracking-wider">Tasarruf Oranı</span>
                <span className="text-2xl font-mono text-emerald-400">{result.reduction_rate || '0%'}</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 flex flex-col gap-1">
                <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Maliyet Kazancı</span>
                <span className="text-2xl font-mono text-zinc-300">{result.estimated_savings || '$0.000'}</span>
              </div>
            </div>

            {/* Output Tabs */}
            <div className="bg-[#0f0f0f] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between bg-zinc-900/50 border-b border-zinc-800 px-2 overflow-x-auto">
                <div className="flex items-center">
                  <button
                    onClick={() => setActiveTab('raw')}
                    className={cn(
                      "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                      activeTab === 'raw' ? "border-zinc-100 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Markdown
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={cn(
                      "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                      activeTab === 'json' ? "border-zinc-100 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <FileJson className="w-4 h-4" />
                    Agent JSON
                  </button>
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={cn(
                      "px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                      activeTab === 'preview' ? "border-zinc-100 text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <Check className="w-4 h-4" />
                    Preview
                  </button>
                </div>
                
                <div className="flex items-center gap-2 pr-2 py-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="İndir (.md)"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Kopyalandı' : 'Kopyala'}
                  </button>
                </div>
              </div>

              <div className="p-0 overflow-auto max-h-[600px] min-h-[300px] relative custom-scrollbar">
                {activeTab === 'raw' && (
                  <pre className="p-6 text-sm font-mono text-zinc-300 whitespace-pre-wrap break-words">
                    {result.markdown}
                  </pre>
                )}
                {activeTab === 'json' && (
                  <pre className="p-6 text-sm font-mono text-blue-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
                {activeTab === 'preview' && (
                  <div className="p-8 bg-zinc-50 prose prose-zinc prose-sm md:prose-base max-w-none rounded-b-xl">
                     <ReactMarkdown>{result.markdown}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Integration Guide */}
        <section id="api" className="pt-12 border-t border-zinc-900">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Kolay Entegrasyon</h2>
            <p className="text-zinc-400">Agent sistemlerinize sadece bir satır kodla bağlayın.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Terminal className="w-5 h-5 text-zinc-400" />
                <h3 className="font-semibold text-zinc-200">Terminal (cURL)</h3>
              </div>
              <pre className="bg-[#0a0a0a] border border-zinc-800 p-4 rounded-lg text-sm font-mono text-zinc-300 overflow-x-auto">
                <code>curl -s https://oku.site/https://example.com</code>
              </pre>
            </div>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileJson className="w-5 h-5 text-zinc-400" />
                <h3 className="font-semibold text-zinc-200">Python (Requests)</h3>
              </div>
              <pre className="bg-[#0a0a0a] border border-zinc-800 p-4 rounded-lg text-sm font-mono text-zinc-300 overflow-x-auto">
                <code className="text-blue-300">import</code> requests<br/><br/>
                url = <span className="text-green-300">"https://oku.site/https://example.com"</span><br/>
                response = requests.get(url, headers=&#123;<span className="text-green-300">"Accept"</span>: <span className="text-green-300">"application/json"</span>&#125;)<br/>
                <code className="text-blue-300">print</code>(response.json()[<span className="text-green-300">"markdown"</span>])
              </pre>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t border-white/5 text-center text-xs text-zinc-600">
        &copy; 2026 oku.site. AI token optimizasyon aracı.
      </footer>
    </div>
  );
}
