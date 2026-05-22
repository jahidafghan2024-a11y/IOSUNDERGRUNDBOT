import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileKey,
  Shield,
  Package,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  Zap,
  Info,
} from "lucide-react";
import { useLocation } from "wouter";

type SignStep = "idle" | "uploading" | "signing" | "done" | "error";

interface FileState {
  file: File | null;
  name: string;
}

function DropZone({
  label,
  accept,
  icon: Icon,
  color,
  fileState,
  onFile,
  hint,
}: {
  label: string;
  accept: string;
  icon: React.ElementType;
  color: string;
  fileState: FileState;
  onFile: (f: File) => void;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer group
        ${dragging ? "border-primary bg-primary/10 scale-[1.02]" : "border-border/50 hover:border-primary/50 hover:bg-card/80"}
        ${fileState.file ? "border-green-500/50 bg-green-500/5" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />
      <div className="flex items-center gap-4 p-4">
        <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
          {fileState.file && (
            <div className="mt-1 flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{fileState.name}</span>
            </div>
          )}
        </div>
        {!fileState.file && (
          <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

export default function Signer() {
  const [, navigate] = useLocation();
  const [cert, setCert] = useState<FileState>({ file: null, name: "" });
  const [provision, setProvision] = useState<FileState>({ file: null, name: "" });
  const [ipa, setIpa] = useState<FileState>({ file: null, name: "" });
  const [certPassword, setCertPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bundleId, setBundleId] = useState("");
  const [appName, setAppName] = useState("");
  const [step, setStep] = useState<SignStep>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [progress, setProgress] = useState(0);

  const setFile = (setter: (s: FileState) => void) => (f: File) => {
    setter({ file: f, name: f.name });
  };

  const canSign = cert.file && provision.file && ipa.file;

  const handleSign = async () => {
    if (!canSign) return;
    setStep("uploading");
    setProgress(10);
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("certificate", cert.file!);
      formData.append("provision", provision.file!);
      formData.append("ipa", ipa.file!);
      formData.append("certPassword", certPassword);
      if (bundleId) formData.append("bundleId", bundleId);
      if (appName) formData.append("appName", appName);

      setStep("signing");
      setProgress(40);

      const res = await fetch("/api/sign", {
        method: "POST",
        body: formData,
      });

      setProgress(90);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Signing failed" }));
        throw new Error(err.error || "Signing failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setStep("done");
    } catch (e: unknown) {
      setStep("error");
      setErrorMsg(e instanceof Error ? e.message : "An unexpected error occurred");
    }
  };

  const reset = () => {
    setCert({ file: null, name: "" });
    setProvision({ file: null, name: "" });
    setIpa({ file: null, name: "" });
    setCertPassword("");
    setBundleId("");
    setAppName("");
    setStep("idle");
    setErrorMsg("");
    setDownloadUrl("");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-card transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">IPA Signer</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Sign iOS apps with your own certificate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Info banner */}
        <Card className="bg-blue-500/10 border-blue-500/30 p-4">
          <div className="flex gap-3">
            <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-300/90 leading-relaxed">
              Your files are processed on the server and never stored. All temp files are deleted immediately after signing. Use your own developer certificates for best results.
            </p>
          </div>
        </Card>

        {/* Step 1 — Files */}
        {(step === "idle" || step === "error") && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Step 1 — Upload Files
            </h2>

            <DropZone
              label="Developer Certificate"
              accept=".p12,.pfx"
              icon={FileKey}
              color="from-blue-500 to-blue-700"
              fileState={cert}
              onFile={setFile(setCert)}
              hint="Your .p12 certificate file"
            />

            <div className="relative">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Certificate Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter certificate password (if any)"
                  value={certPassword}
                  onChange={(e) => setCertPassword(e.target.value)}
                  className="pr-10 bg-card/50 border-border/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <DropZone
              label="Provisioning Profile"
              accept=".mobileprovision"
              icon={Shield}
              color="from-purple-500 to-purple-700"
              fileState={provision}
              onFile={setFile(setProvision)}
              hint="Your .mobileprovision file"
            />

            <DropZone
              label="IPA File"
              accept=".ipa"
              icon={Package}
              color="from-pink-500 to-pink-700"
              fileState={ipa}
              onFile={setFile(setIpa)}
              hint="The .ipa file you want to sign"
            />

            {/* Step 2 — Optional */}
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-3">
              Step 2 — Optional Overrides
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Bundle ID Override</Label>
                <Input
                  placeholder="com.example.app"
                  value={bundleId}
                  onChange={(e) => setBundleId(e.target.value)}
                  className="bg-card/50 border-border/50 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">App Name Override</Label>
                <Input
                  placeholder="MyApp"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="bg-card/50 border-border/50 text-sm"
                />
              </div>
            </div>

            {step === "error" && (
              <Card className="bg-red-500/10 border-red-500/30 p-4">
                <div className="flex gap-3">
                  <XCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-400">Signing Failed</p>
                    <p className="text-xs text-red-300/80 mt-1">{errorMsg}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Sign Button */}
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 font-semibold mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!canSign}
              onClick={handleSign}
            >
              <Zap className="mr-2 h-5 w-5" />
              {canSign ? "Sign IPA" : "Upload all 3 files to sign"}
            </Button>
          </div>
        )}

        {/* Signing Progress */}
        {(step === "uploading" || step === "signing") && (
          <Card className="bg-card/50 border-border/50 p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-4 border-primary/20" />
                <div
                  className="absolute inset-0 w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin"
                />
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold">
                {step === "uploading" ? "Uploading files…" : "Signing IPA…"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "uploading"
                  ? "Securely sending your files to the server"
                  : "Running zsign — this takes a few seconds"}
              </p>
            </div>
            <div className="w-full bg-border/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{progress}%</p>
          </Card>
        )}

        {/* Done */}
        {step === "done" && (
          <Card className="bg-card/50 border-green-500/30 p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
              </div>
            </div>
            <div>
              <p className="text-xl font-bold text-green-400">IPA Signed!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your app was signed successfully. Download it below.
              </p>
            </div>
            <div className="space-y-3">
              <a href={downloadUrl} download="signed.ipa" className="block">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 font-semibold"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Signed IPA
                </Button>
              </a>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-border/50 hover:bg-card"
                onClick={reset}
              >
                Sign Another IPA
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
