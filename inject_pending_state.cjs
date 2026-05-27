const fs = require('fs');

let content = fs.readFileSync('src/frontend/src/pages/WorkerDashboardPage.tsx', 'utf8');

// Find the destructuring of useQuery for certification to add isLoading
content = content.replace(
  /const \{ data: certification \} = useQuery<CertificationResult \| null>\(\{/g,
  'const { data: certification, isLoading: isCertLoading } = useQuery<CertificationResult | null>({'
);

const pendingBlock = `  if (isCertLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!certification || !certification.passed) {
    return (
      <main className="flex-1 bg-background min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-xl">
          <Clock className="w-16 h-16 text-amber-500 mx-auto mb-6" />
          <h1 className="font-display font-bold text-2xl text-white mb-3">Registration Pending</h1>
          <p className="font-body text-slate-400 mb-6">
            Your registration is currently under review by our administration team. Please wait for some time to get approved.
          </p>
          <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-white" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
          </Button>
          <div className="mt-4 pt-4 border-t border-slate-800">
            <Button variant="ghost" className="text-slate-500 hover:text-slate-300 w-full" onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>
              Log Out
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-background">`;

content = content.replace(/  return \(\s*<main className="flex-1 bg-background">/, pendingBlock);

fs.writeFileSync('src/frontend/src/pages/WorkerDashboardPage.tsx', content);
console.log("WorkerDashboardPage pending state injected!");
