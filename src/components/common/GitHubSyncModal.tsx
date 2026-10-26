import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface GitHubSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubSyncModal: React.FC<GitHubSyncModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const repoUrl = 'https://github.com/tubalrr/ManokTrack---Poultry-Management';

  if (!isOpen) return null;

  const pushCommands = `git init -b main
git remote add origin https://github.com/tubalrr/ManokTrack---Poultry-Management.git
git add .
git commit -m "Initial commit: ManokTrack Poultry Farm Management"
git push -u origin main`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pushCommands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4 bg-stone-900 text-white">
          <div className="flex items-center gap-2.5">
            <svg className="h-6 w-6 fill-white" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <div>
              <h3 className="text-base font-bold text-white">GitHub Repository Sync</h3>
              <p className="text-xs text-stone-400">tubalrr / ManokTrack---Poultry-Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Why it hasn't appeared yet alert */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              <span>Bakit wala pa sa GitHub repo? (GitHub Authentication Required)</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Kahit naka-link na ang URL, kailangan ng GitHub ng <strong>authorization / password</strong> (Personal Access Token o SSH) bago payagan ang pagsusulat ng files sa iyong account upang maprotektahan ang iyong repo.
            </p>
          </div>

          {/* Option 1: One-Click Instant Download */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Option 1: I-download ang Buong Source Code (.ZIP)
                </span>
                <p className="text-xs text-stone-500">
                  Kumpletong kopya ng lahat ng React components, Tailwind styles, at Firebase configs.
                </p>
              </div>
            </div>

            <a
              href="/manoktrack-project.zip"
              download="manoktrack-project.zip"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>I-download ang manoktrack-project.zip (1.3 MB)</span>
            </a>
          </div>

          {/* Option 2: Push via Local Terminal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-stone-600" />
                <span>Option 2: I-push gamit ang Terminal sa iyong computer</span>
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Commands'}</span>
              </button>
            </div>

            <div className="relative rounded-lg bg-stone-900 p-3 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed border border-stone-800">
              <pre>{pushCommands}</pre>
            </div>
            <p className="text-[11px] text-stone-500">
              I-extract ang na-download na zip folder, buksan sa VS Code o Terminal, at i-paste ang mga command na ito para ma-push agad sa iyong GitHub.
            </p>
          </div>

          {/* Direct Link to GitHub */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-200">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 underline"
            >
              <span>Buksan ang GitHub Repo ({repoUrl.replace('https://github.com/', '')})</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            <button
              onClick={onClose}
              className="rounded-lg bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700 transition-colors"
            >
              Naiintindihan ko (Close)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
